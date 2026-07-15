export type ViolationRegion =
  | 'pre-burst'
  | 'ramp-up'
  | 'early-settling'
  | 'plateau'
  | 'ramp-down'
  | 'post-burst'

export type BoundaryKind = 'upper' | 'lower'

export interface PvTParameters {
  rampUpUs: number
  rampDownUs: number
  timingOffsetUs: number
  overshootDb: number
  settlingUs: number
  ringingDb: number
  noiseFloorDbc: number
  seed: number
}

export interface ParameterDefinition {
  key: keyof PvTParameters
  label: string
  shortLabel: string
  unit: string
  min: number
  max: number
  step: number
  explanation: string
}

export interface MaskPoint {
  timeUs: number
  upperDbc: number
  lowerDbc: number | null
}

export interface TracePoint {
  timeUs: number
  powerDbc: number
  upperMaskDbc: number
  lowerMaskDbc: number | null
  marginDb: number
}

export interface Violation {
  startUs: number
  endUs: number
  worstMarginDb: number
  boundary: BoundaryKind
  region: ViolationRegion
}

export interface EvaluationResult {
  pass: boolean
  worstMarginDb: number
  worstTimeUs: number
  firstViolationTimeUs: number | null
  violations: Violation[]
  possibleCauses: string[]
}

export interface SimulationResult {
  trace: TracePoint[]
  evaluation: EvaluationResult
}

export interface SimulationProfile {
  id: string
  name: string
  context: string
  educationalOnly: true
  source: string
  specVersion: string
  assumptions: string[]
  burstStartUs: number
  burstEndUs: number
  chartStartUs: number
  chartEndUs: number
  mask: MaskPoint[]
}

export type Prediction = 'pass' | 'ramp-up' | 'plateau' | 'ramp-down' | 'off-region'

export interface ChallengeScenario {
  id: string
  title: string
  cue: string
  parameters: PvTParameters
  expectedDiagnosis: string
  evidence: string
  explanation: string
  expectedTrace: {
    pass: boolean
    firstRegion: ViolationRegion | null
    firstBoundary: BoundaryKind | null
    worstRegion: ViolationRegion | null
    worstBoundary: BoundaryKind | null
    minimumViolationGroups: number
  }
}

export interface ChallengeResult {
  diagnosisCorrect: boolean
  evidenceCorrect: boolean
}

export interface LearnerResponse {
  scenarioId: string
  diagnosis: string
  evidence: string
}

export interface LearnerProgress {
  version: 3
  visitedSteps: string[]
  predictions: { correct: number; total: number }
  judgmentResults: Record<string, boolean>
  challengeResults: Record<string, ChallengeResult>
  conceptChecks: Record<string, boolean>
  completedChallenges: string[]
  teachBackComplete: boolean
  lastParameters: PvTParameters
  lastEvaluation: EvaluationResult | null
  lastResponse: LearnerResponse | null
}
