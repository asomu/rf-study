import { useMemo, useState } from 'react'
import { DiagnosisPanel } from '../components/DiagnosisPanel'
import { JudgmentPanel } from '../components/JudgmentPanel'
import { ParameterPanel } from '../components/ParameterPanel'
import { PvTChart } from '../components/PvTChart'
import { SpecificationReference } from '../components/SpecificationReference'
import { simulatePvT } from '../domain/pvt/model'
import { DEFAULT_PARAMETERS, PARAMETER_DEFINITIONS } from '../domain/pvt/profile'
import type { Prediction, PvTParameters, SimulationResult, ViolationRegion } from '../domain/pvt/types'
import { useProgress } from '../state/progress'

const predictionOptions: Array<{ value: Prediction; label: string; detail: string }> = [
  { value: 'pass', label: 'PASS', detail: 'Mask 안에 유지' },
  { value: 'ramp-up', label: 'RAMP ↑', detail: 'Leading edge' },
  { value: 'plateau', label: 'PLATEAU', detail: 'Settling 포함' },
  { value: 'ramp-down', label: 'RAMP ↓', detail: 'Trailing edge' },
  { value: 'off-region', label: 'OFF', detail: 'Burst 바깥' },
]

function expectedPrediction(result: SimulationResult): Prediction {
  if (result.evaluation.pass) return 'pass'
  const region = result.evaluation.violations[0]?.region as ViolationRegion | undefined
  if (region === 'pre-burst' || region === 'post-burst') return 'off-region'
  if (region === 'ramp-up') return 'ramp-up'
  if (region === 'ramp-down') return 'ramp-down'
  return 'plateau'
}

function parameterSignature(parameters: PvTParameters) {
  return [
    parameters.rampUpUs,
    parameters.rampDownUs,
    parameters.timingOffsetUs,
    parameters.overshootDb,
    parameters.settlingUs,
    parameters.ringingDb,
    parameters.noiseFloorDbc,
    parameters.seed,
  ].join('|')
}

export function LabPage() {
  const { progress, recordPrediction, recordJudgment, saveExperiment } = useProgress()
  const baseline = useMemo(() => simulatePvT(DEFAULT_PARAMETERS), [])
  const [draft, setDraft] = useState<PvTParameters>(progress.lastParameters)
  const [evaluatedParameters, setEvaluatedParameters] = useState<PvTParameters>(progress.lastParameters)
  const [result, setResult] = useState<SimulationResult>(() => simulatePvT(progress.lastParameters))
  const [history, setHistory] = useState<PvTParameters[]>([])
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const [judgmentComplete, setJudgmentComplete] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [runId, setRunId] = useState(0)

  const dirty = JSON.stringify(draft) !== JSON.stringify(evaluatedParameters)

  const changeParameter = (key: keyof PvTParameters, value: number) => {
    const definition = PARAMETER_DEFINITIONS.find((item) => item.key === key)
    if (!Number.isFinite(value) || (definition && (value < definition.min || value > definition.max))) {
      setInputError(`${definition?.label ?? key}: ${definition?.min}–${definition?.max} ${definition?.unit ?? ''} 범위가 필요합니다.`)
      return
    }
    setInputError(null)
    setDraft((current) => ({ ...current, [key]: value }))
    setPrediction(null)
    setPredictionFeedback(null)
    setJudgmentComplete(false)
    setHasRun(false)
  }

  const run = () => {
    if (!prediction || inputError) return
    const next = simulatePvT(draft)
    const correct = prediction === expectedPrediction(next)
    setHistory((current) => [...current, evaluatedParameters])
    setEvaluatedParameters(draft)
    setResult(next)
    setJudgmentComplete(false)
    setHasRun(true)
    setRunId((current) => current + 1)
    setPredictionFeedback(correct ? '예측이 trace의 첫 결과와 일치합니다.' : `첫 결과는 ${expectedPrediction(next).toUpperCase()} 영역입니다.`)
    recordPrediction(correct)
    saveExperiment(draft, next.evaluation)
  }

  const reset = () => {
    setDraft(DEFAULT_PARAMETERS)
    setPrediction(null)
    setPredictionFeedback(null)
    setJudgmentComplete(false)
    setHasRun(false)
  }

  const undo = () => {
    const previous = history.at(-1)
    if (!previous) return
    const next = simulatePvT(previous)
    setHistory((current) => current.slice(0, -1))
    setDraft(previous)
    setEvaluatedParameters(previous)
    setResult(next)
    setPrediction(null)
    setPredictionFeedback('이전 실험 상태로 돌아왔습니다.')
    setJudgmentComplete(false)
    setHasRun(false)
    saveExperiment(previous, next.evaluation)
  }

  return (
    <div className="page lab-page">
      <header className="lab-titlebar">
        <div><span className="kicker">LIVE EDUCATIONAL SIMULATOR</span><h1>BURST / PvT <em>LAB</em></h1></div>
        <p>Parameter를 바꾼 뒤 먼저 결과를 예측하세요. Trace는 제출 후 갱신됩니다.</p>
      </header>

      <div className="lab-layout">
        <div className="lab-chart-zone">
          <div className={`lab-chart-wrap ${dirty ? 'is-pending' : ''}`}>
            <PvTChart trace={result.trace} baseline={baseline.trace} violations={result.evaluation.violations} />
            {dirty && <div className="pending-veil"><span>TRACE ARMED</span><strong>예측을 제출하면 새 파형이 나타납니다.</strong></div>}
          </div>
          <SpecificationReference />
        </div>

        <section className="prediction-gate" aria-labelledby="prediction-title">
          <div>
            <span className="eyebrow">PREDICT BEFORE RUN</span>
            <h2 id="prediction-title">첫 결과가 어디에서 나타날까요?</h2>
          </div>
          <div className="prediction-options">
            {predictionOptions.map((option) => (
              <button
                key={option.value}
                className={prediction === option.value ? 'is-selected' : ''}
                type="button"
                onClick={() => setPrediction(option.value)}
              >
                <strong>{option.label}</strong><span>{option.detail}</span>
              </button>
            ))}
          </div>
          <button className="button-primary run-button" type="button" disabled={!prediction || Boolean(inputError)} onClick={run}>
            예측을 제출하고 실행 <span>▶</span>
          </button>
          {predictionFeedback && <p className="prediction-feedback" role="status">{predictionFeedback}</p>}
        </section>

        {hasRun && (
          <JudgmentPanel
            key={`${JSON.stringify(evaluatedParameters)}:${runId}`}
            evaluation={result.evaluation}
            onComplete={(correct) => {
              recordJudgment(parameterSignature(evaluatedParameters), correct)
              setJudgmentComplete(true)
            }}
          />
        )}

        {judgmentComplete && <DiagnosisPanel evaluation={result.evaluation} />}

        <aside className="control-rail">
          {inputError && <div className="input-error" role="alert">{inputError}</div>}
          <ParameterPanel values={draft} onChange={changeParameter} onReset={reset} onUndo={undo} canUndo={history.length > 0} />
          <div className="control-note">
            <span>WORKING RULE</span>
            <p>한 번에 하나의 parameter만 바꾸면 원인과 결과를 더 빠르게 연결할 수 있습니다.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
