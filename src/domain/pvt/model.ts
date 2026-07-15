import { z } from 'zod'
import { EDUCATIONAL_PROFILE, PARAMETER_DEFINITIONS } from './profile'
import type {
  BoundaryKind,
  EvaluationResult,
  MaskPoint,
  PvTParameters,
  SimulationProfile,
  SimulationResult,
  TracePoint,
  Violation,
  ViolationRegion,
} from './types'

const rawParametersSchema = z.object({
  rampUpUs: z.number().finite(),
  rampDownUs: z.number().finite(),
  timingOffsetUs: z.number().finite(),
  overshootDb: z.number().finite(),
  settlingUs: z.number().finite(),
  ringingDb: z.number().finite(),
  noiseFloorDbc: z.number().finite(),
  seed: z.number().int().min(1).max(9999),
})

export const pvtParametersSchema = rawParametersSchema.superRefine((parameters, context) => {
  for (const definition of PARAMETER_DEFINITIONS) {
    const value = parameters[definition.key]
    if (value < definition.min || value > definition.max) {
      context.addIssue({
        code: 'custom',
        path: [definition.key],
        message: `${definition.key} must be ${definition.min}…${definition.max}`,
      })
    }
  }
})

export function validateParameters(parameters: PvTParameters): PvTParameters {
  return pvtParametersSchema.parse(parameters)
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function smoothstep(value: number) {
  const x = Math.max(0, Math.min(1, value))
  return x * x * (3 - 2 * x)
}

function amplitudeToDb(amplitude: number, floorDbc: number) {
  if (amplitude <= 0) return floorDbc
  return Math.max(floorDbc, 20 * Math.log10(amplitude))
}

function interpolateMask(timeUs: number, mask: MaskPoint[]) {
  const exact = mask.find((point) => point.timeUs === timeUs)
  if (exact) return { upper: exact.upperDbc, lower: exact.lowerDbc }

  const rightIndex = mask.findIndex((point) => point.timeUs > timeUs)
  if (rightIndex <= 0) {
    const point = rightIndex === 0 ? mask[0] : mask[mask.length - 1]
    return { upper: point.upperDbc, lower: point.lowerDbc }
  }
  const left = mask[rightIndex - 1]
  const right = mask[rightIndex]
  const ratio = (timeUs - left.timeUs) / (right.timeUs - left.timeUs)
  const upper = left.upperDbc + (right.upperDbc - left.upperDbc) * ratio
  const lower =
    left.lowerDbc === null || right.lowerDbc === null
      ? null
      : left.lowerDbc + (right.lowerDbc - left.lowerDbc) * ratio
  return { upper, lower }
}

function regionForTime(timeUs: number, profile: SimulationProfile, boundary: BoundaryKind): ViolationRegion {
  if (timeUs < profile.burstStartUs - 20) return 'pre-burst'
  if (timeUs < profile.burstStartUs) return 'ramp-up'
  if (timeUs < profile.burstStartUs + 8 && boundary === 'lower') return 'ramp-up'
  if (timeUs < profile.burstStartUs + 90) return 'early-settling'
  if (timeUs < profile.burstEndUs - 8) return 'plateau'
  if (timeUs <= profile.burstEndUs + 20) return 'ramp-down'
  return 'post-burst'
}

function causeLabels(violations: Violation[]) {
  const regions = new Set(violations.map((violation) => violation.region))
  const causes: string[] = []
  if (regions.has('pre-burst')) causes.push('PA enable 또는 trigger가 너무 이른지 확인')
  if (regions.has('ramp-up')) causes.push('Ramp-up slew와 bias sequence timing 확인')
  if (regions.has('early-settling')) causes.push('Turn-on overshoot와 control-loop settling 확인')
  if (regions.has('plateau')) causes.push('Ringing, gain ripple 또는 지속 settling 확인')
  if (regions.has('ramp-down')) causes.push('Ramp-down slew와 switch/bias turn-off timing 확인')
  if (regions.has('post-burst')) causes.push('Leakage, isolation 또는 off-region noise floor 확인')
  return causes.length > 0 ? causes : ['Trace는 현재 교육용 mask 안에 있습니다.']
}

export function evaluateTrace(trace: TracePoint[], profile = EDUCATIONAL_PROFILE): EvaluationResult {
  let worstMarginDb = Number.POSITIVE_INFINITY
  let worstTimeUs = profile.chartStartUs
  const raw: Array<{ point: TracePoint; boundary: BoundaryKind }> = []

  for (const point of trace) {
    const upperMargin = point.upperMaskDbc - point.powerDbc
    const lowerMargin = point.lowerMaskDbc === null ? Number.POSITIVE_INFINITY : point.powerDbc - point.lowerMaskDbc
    const margin = Math.min(upperMargin, lowerMargin)
    if (margin < worstMarginDb) {
      worstMarginDb = margin
      worstTimeUs = point.timeUs
    }
    if (margin < 0) {
      raw.push({ point, boundary: upperMargin < lowerMargin ? 'upper' : 'lower' })
    }
  }

  const violations: Violation[] = []
  for (const item of raw) {
    const region = regionForTime(item.point.timeUs, profile, item.boundary)
    const previous = violations[violations.length - 1]
    if (
      previous &&
      previous.boundary === item.boundary &&
      previous.region === region &&
      item.point.timeUs - previous.endUs <= 1.05
    ) {
      previous.endUs = item.point.timeUs
      previous.worstMarginDb = Math.min(previous.worstMarginDb, item.point.marginDb)
    } else {
      violations.push({
        startUs: item.point.timeUs,
        endUs: item.point.timeUs,
        worstMarginDb: item.point.marginDb,
        boundary: item.boundary,
        region,
      })
    }
  }

  return {
    pass: violations.length === 0,
    worstMarginDb,
    worstTimeUs,
    firstViolationTimeUs: violations[0]?.startUs ?? null,
    violations,
    possibleCauses: causeLabels(violations),
  }
}

export function simulatePvT(
  input: PvTParameters,
  profile: SimulationProfile = EDUCATIONAL_PROFILE,
): SimulationResult {
  const parameters = validateParameters(input)
  const random = mulberry32(parameters.seed)
  const times = new Set<number>()
  for (let time = profile.chartStartUs; time <= profile.chartEndUs; time += 1) {
    times.add(Number(time.toFixed(1)))
  }
  profile.mask.forEach((point) => times.add(point.timeUs))

  const shiftedStart = profile.burstStartUs + parameters.timingOffsetUs
  const shiftedEnd = profile.burstEndUs + parameters.timingOffsetUs
  const rampStart = shiftedStart - parameters.rampUpUs
  const rampEnd = shiftedEnd + parameters.rampDownUs

  const trace: TracePoint[] = [...times]
    .sort((a, b) => a - b)
    .map((timeUs) => {
      let amplitude = 0
      if (timeUs >= rampStart && timeUs < shiftedStart) {
        amplitude = smoothstep((timeUs - rampStart) / parameters.rampUpUs)
      } else if (timeUs >= shiftedStart && timeUs <= shiftedEnd) {
        amplitude = 1
      } else if (timeUs > shiftedEnd && timeUs <= rampEnd) {
        amplitude = 1 - smoothstep((timeUs - shiftedEnd) / parameters.rampDownUs)
      }

      let powerDbc = amplitudeToDb(amplitude, parameters.noiseFloorDbc)
      if (timeUs >= shiftedStart && timeUs <= shiftedEnd) {
        const elapsed = timeUs - shiftedStart
        const decay = Math.exp(-elapsed / parameters.settlingUs)
        const overshoot = parameters.overshootDb * decay
        const ringing = parameters.ringingDb * decay * Math.sin((elapsed / 10.5) * Math.PI * 2)
        powerDbc += overshoot + ringing + (random() - 0.5) * 0.055
      } else {
        powerDbc += (random() - 0.5) * 0.6
      }
      powerDbc = Math.max(-80, Math.min(6, powerDbc))

      const mask = interpolateMask(timeUs, profile.mask)
      const upperMargin = mask.upper - powerDbc
      const lowerMargin = mask.lower === null ? Number.POSITIVE_INFINITY : powerDbc - mask.lower
      return {
        timeUs,
        powerDbc,
        upperMaskDbc: mask.upper,
        lowerMaskDbc: mask.lower,
        marginDb: Math.min(upperMargin, lowerMargin),
      }
    })

  return { trace, evaluation: evaluateTrace(trace, profile) }
}
