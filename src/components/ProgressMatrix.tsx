import type { LearnerProgress } from '../domain/pvt/types'

function score(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}

export function ProgressMatrix({ progress }: { progress: LearnerProgress }) {
  const conceptCorrect = Object.values(progress.conceptChecks).filter(Boolean).length
  const challengeResults = Object.values(progress.challengeResults)
  const diagnosisCorrect = challengeResults.filter(
    (result) => result.diagnosisCorrect && result.evidenceCorrect,
  ).length
  const judgmentResults = Object.values(progress.judgmentResults)
  const judgmentCorrect = judgmentResults.filter(Boolean).length
  const rows = [
    ['CONCEPT', conceptCorrect, 5, score(conceptCorrect, 5)],
    ['PREDICTION', progress.predictions.correct, progress.predictions.total, score(progress.predictions.correct, progress.predictions.total)],
    ['JUDGMENT', judgmentCorrect, judgmentResults.length, score(judgmentCorrect, judgmentResults.length)],
    ['DIAGNOSIS', diagnosisCorrect, challengeResults.length, score(diagnosisCorrect, challengeResults.length)],
    ['TEACH-BACK', progress.teachBackComplete ? 1 : 0, 1, progress.teachBackComplete ? 100 : 0],
  ] as const
  return (
    <section className="progress-matrix" aria-labelledby="progress-title">
      <div className="section-heading"><span className="eyebrow">EVIDENCE, NOT ACTIVITY</span><h2 id="progress-title">COMPETENCY MATRIX</h2></div>
      <div className="matrix-grid">
        {rows.map(([label, correct, total, percent]) => (
          <div className="matrix-cell" key={label}>
            <span>{label}</span><strong>{percent}%</strong><i>{correct} / {total}</i>
            <div className="meter"><em style={{ width: `${percent}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  )
}
