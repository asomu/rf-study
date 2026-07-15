import { useMemo, useState } from 'react'
import { DiagnosisPanel } from '../components/DiagnosisPanel'
import { PvTChart } from '../components/PvTChart'
import { DIAGNOSIS_OPTIONS, EVIDENCE_OPTIONS } from '../content/learning'
import { CHALLENGES } from '../domain/pvt/challenges'
import { simulatePvT } from '../domain/pvt/model'
import { useProgress } from '../state/progress'

export function ChallengePage() {
  const { progress, recordChallengeResult, saveExperiment } = useProgress()
  const [selectedId, setSelectedId] = useState(
    CHALLENGES.find((item) => !progress.completedChallenges.includes(item.id))?.id ?? CHALLENGES[0].id,
  )
  const [diagnosis, setDiagnosis] = useState('')
  const [evidence, setEvidence] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const scenario = CHALLENGES.find((item) => item.id === selectedId) ?? CHALLENGES[0]
  const result = useMemo(() => simulatePvT(scenario.parameters), [scenario])
  const correct = diagnosis === scenario.expectedDiagnosis && evidence === scenario.evidence
  const diagnosisCorrect = diagnosis === scenario.expectedDiagnosis
  const evidenceCorrect = evidence === scenario.evidence

  const selectScenario = (id: string) => {
    setSelectedId(id)
    setDiagnosis('')
    setEvidence('')
    setSubmitted(false)
  }

  const submit = () => {
    if (!diagnosis || !evidence || submitted) return
    setSubmitted(true)
    recordChallengeResult(scenario.id, diagnosisCorrect, evidenceCorrect)
    saveExperiment(scenario.parameters, result.evaluation, {
      scenarioId: scenario.id,
      diagnosis,
      evidence,
    })
  }

  return (
    <div className="page challenge-page">
      <header className="challenge-header">
        <div><span className="kicker">FAULT ISOLATION DECK</span><h1>진단은 <em>증거</em>로.</h1></div>
        <p>Trace를 보고 원인과 근거를 함께 선택하세요. 오답도 다음 case 진행을 막지 않습니다.</p>
      </header>

      <div className="case-tabs" role="tablist" aria-label="진단 case 선택">
        {CHALLENGES.map((item, index) => (
          <button
            key={item.id}
            id={`challenge-tab-${item.id}`}
            role="tab"
            aria-selected={item.id === selectedId}
            aria-controls="challenge-panel"
            tabIndex={item.id === selectedId ? 0 : -1}
            className={item.id === selectedId ? 'is-active' : ''}
            onClick={() => selectScenario(item.id)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const current = CHALLENGES.findIndex((candidate) => candidate.id === item.id)
              const next = event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? CHALLENGES.length - 1
                  : (current + (event.key === 'ArrowRight' ? 1 : -1) + CHALLENGES.length) % CHALLENGES.length
              selectScenario(CHALLENGES[next].id)
              const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
              requestAnimationFrame(() => tabs?.[next]?.focus())
            }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{item.title.split(' · ')[1]}</strong>
            <i>{progress.completedChallenges.includes(item.id) ? '●' : '○'}</i>
          </button>
        ))}
      </div>

      <div
        className="challenge-layout"
        id="challenge-panel"
        role="tabpanel"
        aria-labelledby={`challenge-tab-${scenario.id}`}
      >
        <div className="challenge-plot">
          <div className="case-brief"><span>{scenario.title}</span><h2>{scenario.cue}</h2></div>
          <PvTChart trace={result.trace} violations={result.evaluation.violations} compact />
          {submitted && <DiagnosisPanel evaluation={result.evaluation} />}
        </div>

        <section className="answer-sheet" aria-labelledby="answer-title">
          <div className="answer-sheet-head"><span>DIAGNOSIS SHEET</span><strong>{scenario.id.toUpperCase()}</strong></div>
          <h2 id="answer-title">가장 가능성 높은 원인</h2>
          <div className="radio-list">
            {DIAGNOSIS_OPTIONS.map((option) => (
              <label key={option}><input type="radio" name="diagnosis" value={option} checked={diagnosis === option} disabled={submitted} onChange={(event) => setDiagnosis(event.target.value)} /><span>{option}</span></label>
            ))}
          </div>
          <h2 id="evidence-title">판단 근거</h2>
          <select aria-labelledby="evidence-title" value={evidence} disabled={submitted} onChange={(event) => setEvidence(event.target.value)}>
            <option value="">근거를 선택하세요</option>
            {EVIDENCE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
          </select>
          <button className="button-primary submit-diagnosis" type="button" disabled={!diagnosis || !evidence || submitted} onClick={submit}>진단 제출 <span>→</span></button>
          {submitted && (
            <div className={`answer-feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status">
              <strong>{correct ? 'DIAGNOSIS CONFIRMED' : 'REVIEW THE EVIDENCE'}</strong>
              <p>{scenario.explanation}</p>
              {!correct && <p><b>권장 진단:</b> {scenario.expectedDiagnosis}<br /><b>근거:</b> {scenario.evidence}</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
