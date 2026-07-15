import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { z } from 'zod'
import { pvtParametersSchema } from '../domain/pvt/model'
import { DEFAULT_PARAMETERS } from '../domain/pvt/profile'
import type {
  ChallengeResult,
  EvaluationResult,
  LearnerProgress,
  LearnerResponse,
  PvTParameters,
} from '../domain/pvt/types'

const STORAGE_KEY = 'rf-study:v1'

const finiteNumber = z.number().finite()
const counterSchema = z.object({
  correct: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
}).refine((counter) => counter.correct <= counter.total, 'correct cannot exceed total')

const evaluationSchema = z.object({
  pass: z.boolean(),
  worstMarginDb: finiteNumber,
  worstTimeUs: finiteNumber,
  firstViolationTimeUs: finiteNumber.nullable(),
  violations: z.array(
    z.object({
      startUs: finiteNumber,
      endUs: finiteNumber,
      worstMarginDb: finiteNumber,
      boundary: z.enum(['upper', 'lower']),
      region: z.enum(['pre-burst', 'ramp-up', 'early-settling', 'plateau', 'ramp-down', 'post-burst']),
    }).refine((violation) => violation.startUs <= violation.endUs, 'violation range is reversed'),
  ),
  possibleCauses: z.array(z.string()),
})

const learnerResponseSchema = z.object({
  scenarioId: z.string().min(1),
  diagnosis: z.string().min(1),
  evidence: z.string().min(1),
})

const commonProgressFields = {
  visitedSteps: z.array(z.string()),
  predictions: counterSchema,
  challengeResults: z.record(z.string(), z.object({
    diagnosisCorrect: z.boolean(),
    evidenceCorrect: z.boolean(),
  })),
  conceptChecks: z.record(z.string(), z.boolean()),
  completedChallenges: z.array(z.string()),
  teachBackComplete: z.boolean(),
  lastParameters: pvtParametersSchema,
  lastEvaluation: evaluationSchema.nullable(),
  lastResponse: learnerResponseSchema.nullable(),
}

const progressV3Schema = z.object({
  version: z.literal(3),
  ...commonProgressFields,
  judgmentResults: z.record(z.string(), z.boolean()),
})

const progressV2Schema = z.object({
  version: z.literal(2),
  ...commonProgressFields,
  judgments: counterSchema,
})

const progressV1Schema = z.object({
  version: z.literal(1),
  visitedSteps: z.array(z.string()),
  predictions: counterSchema,
  judgments: counterSchema,
  diagnoses: counterSchema,
  conceptChecks: z.record(z.string(), z.boolean()),
  completedChallenges: z.array(z.string()),
  teachBackComplete: z.boolean().default(false),
  lastParameters: pvtParametersSchema,
  lastEvaluation: evaluationSchema.nullable(),
})

const initialProgress: LearnerProgress = {
  version: 3,
  visitedSteps: [],
  predictions: { correct: 0, total: 0 },
  judgmentResults: {},
  challengeResults: {},
  conceptChecks: {},
  completedChallenges: [],
  teachBackComplete: false,
  lastParameters: DEFAULT_PARAMETERS,
  lastEvaluation: null,
  lastResponse: null,
}

interface ProgressContextValue {
  progress: LearnerProgress
  recoveryMessage: string | null
  markVisited: (step: string) => void
  setConceptCheck: (id: string, correct: boolean) => void
  recordPrediction: (correct: boolean) => void
  recordJudgment: (signature: string, correct: boolean) => void
  recordChallengeResult: (id: string, diagnosisCorrect: boolean, evidenceCorrect: boolean) => void
  setTeachBackComplete: (complete: boolean) => void
  saveExperiment: (
    parameters: PvTParameters,
    evaluation: EvaluationResult,
    response?: LearnerResponse | null,
  ) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

function migrateProgress(input: unknown): { progress: LearnerProgress; message: string | null } {
  const version = typeof input === 'object' && input !== null && 'version' in input ? input.version : null
  if (version === 3) {
    return { progress: progressV3Schema.parse(input) as LearnerProgress, message: null }
  }
  if (version === 2) {
    const legacy = progressV2Schema.parse(input)
    return {
      progress: {
        version: 3,
        visitedSteps: legacy.visitedSteps,
        predictions: legacy.predictions,
        judgmentResults: {},
        challengeResults: legacy.challengeResults,
        conceptChecks: legacy.conceptChecks,
        completedChallenges: legacy.completedChallenges,
        teachBackComplete: false,
        lastParameters: legacy.lastParameters,
        lastEvaluation: legacy.lastEvaluation,
        lastResponse: legacy.lastResponse,
      },
      message: '기존 학습 기록을 v3 증거 형식으로 변환했습니다. Judgment는 파형별로 다시 측정합니다.',
    }
  }
  if (version === 1) {
    const legacy = progressV1Schema.parse(input)
    return {
      progress: {
        version: 3,
        visitedSteps: legacy.visitedSteps,
        predictions: legacy.predictions,
        judgmentResults: {},
        challengeResults: {},
        conceptChecks: legacy.conceptChecks,
        completedChallenges: [],
        teachBackComplete: false,
        lastParameters: legacy.lastParameters,
        lastEvaluation: legacy.lastEvaluation,
        lastResponse: null,
      },
      message: '기존 학습 기록을 새 증거 형식으로 변환했습니다. Judgment와 Challenge 점수는 다시 측정합니다.',
    }
  }
  throw new Error('Unsupported progress version')
}

function readProgress() {
  if (typeof window === 'undefined') return { progress: initialProgress, message: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { progress: initialProgress, message: null }
    return migrateProgress(JSON.parse(raw))
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage may be unavailable; the in-memory session still works.
    }
    return {
      progress: initialProgress,
      message: '저장된 학습 기록의 범위 또는 형식이 올바르지 않아 안전하게 초기화했습니다.',
    }
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(readProgress)
  const [progress, setProgress] = useState<LearnerProgress>(loaded.progress)
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(loaded.message)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      if (recoveryMessage?.includes('브라우저에 저장하지 못했습니다')) setRecoveryMessage(null)
    } catch {
      setRecoveryMessage('학습 기록을 브라우저에 저장하지 못했습니다. 현재 탭에서는 계속 사용할 수 있습니다.')
    }
  }, [progress, recoveryMessage])

  const update = useCallback((recipe: (current: LearnerProgress) => LearnerProgress) => {
    setProgress((current) => recipe(current))
  }, [])

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      recoveryMessage,
      markVisited: (step) =>
        update((current) =>
          current.visitedSteps.includes(step)
            ? current
            : { ...current, visitedSteps: [...current.visitedSteps, step] },
        ),
      setConceptCheck: (id, correct) =>
        update((current) => ({
          ...current,
          conceptChecks: { ...current.conceptChecks, [id]: correct },
        })),
      recordPrediction: (correct) =>
        update((current) => ({
          ...current,
          predictions: {
            total: current.predictions.total + 1,
            correct: current.predictions.correct + Number(correct),
          },
        })),
      recordJudgment: (signature, correct) =>
        update((current) => ({
          ...current,
          judgmentResults: {
            ...current.judgmentResults,
            [signature]: correct,
          },
        })),
      recordChallengeResult: (id, diagnosisCorrect, evidenceCorrect) =>
        update((current) => ({
          ...current,
          challengeResults: {
            ...current.challengeResults,
            [id]: { diagnosisCorrect, evidenceCorrect } satisfies ChallengeResult,
          },
          completedChallenges: current.completedChallenges.includes(id)
            ? current.completedChallenges
            : [...current.completedChallenges, id],
        })),
      setTeachBackComplete: (complete) =>
        update((current) => ({ ...current, teachBackComplete: complete })),
      saveExperiment: (parameters, evaluation, response = null) =>
        update((current) => ({
          ...current,
          lastParameters: pvtParametersSchema.parse(parameters),
          lastEvaluation: evaluationSchema.parse(evaluation),
          lastResponse: response,
          teachBackComplete: false,
        })),
    }),
    [progress, recoveryMessage, update],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used inside ProgressProvider')
  return context
}
