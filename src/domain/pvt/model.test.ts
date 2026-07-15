import { describe, expect, it } from 'vitest'
import { CHALLENGES } from './challenges'
import { simulatePvT, validateParameters } from './model'
import { DEFAULT_PARAMETERS, EDUCATIONAL_PROFILE } from './profile'

describe('educational PvT model', () => {
  it('is deterministic for the same parameters and seed', () => {
    const first = simulatePvT(DEFAULT_PARAMETERS)
    const second = simulatePvT(DEFAULT_PARAMETERS)
    expect(first.trace).toEqual(second.trace)
    expect(first.evaluation).toEqual(second.evaluation)
  })

  it('includes every exact mask corner in the trace', () => {
    const result = simulatePvT(DEFAULT_PARAMETERS)
    const times = new Set(result.trace.map((point) => point.timeUs))
    for (const point of EDUCATIONAL_PROFILE.mask) {
      expect(times.has(point.timeUs)).toBe(true)
    }
  })

  it('keeps the baseline inside the educational corridor', () => {
    const result = simulatePvT(DEFAULT_PARAMETERS)
    expect(result.evaluation.pass, JSON.stringify(result.evaluation)).toBe(true)
    expect(result.evaluation.worstMarginDb).toBeGreaterThan(0)
  })

  it.each(CHALLENGES)('$id matches its declared trace evidence', (scenario) => {
    const result = simulatePvT(scenario.parameters)
    const { evaluation } = result
    const expected = scenario.expectedTrace
    expect(evaluation.pass).toBe(expected.pass)
    expect(evaluation.violations.length).toBeGreaterThanOrEqual(expected.minimumViolationGroups)
    expect(evaluation.violations[0]?.region ?? null).toBe(expected.firstRegion)
    expect(evaluation.violations[0]?.boundary ?? null).toBe(expected.firstBoundary)
    const worstViolation = evaluation.violations.find(
      (violation) => evaluation.worstTimeUs >= violation.startUs && evaluation.worstTimeUs <= violation.endUs,
    )
    expect(worstViolation?.region ?? null).toBe(expected.worstRegion)
    expect(worstViolation?.boundary ?? null).toBe(expected.worstBoundary)
    expect(evaluation.possibleCauses.length).toBeGreaterThan(0)
  })

  it('rejects values outside the declared parameter ranges', () => {
    expect(() => validateParameters({ ...DEFAULT_PARAMETERS, overshootDb: 99 })).toThrow()
    expect(() => validateParameters({ ...DEFAULT_PARAMETERS, rampUpUs: Number.NaN })).toThrow()
  })
})
