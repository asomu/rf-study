import { useState } from 'react'
import type { EvaluationResult, ViolationRegion } from '../domain/pvt/types'

export type JudgmentRegion = 'inside-mask' | 'ramp-up' | 'early-settling' | 'plateau' | 'ramp-down' | 'off-region'

const options: Array<{ value: JudgmentRegion; label: string }> = [
  { value: 'inside-mask', label: 'INSIDE MASK' },
  { value: 'ramp-up', label: 'RAMP ↑' },
  { value: 'early-settling', label: 'EARLY SETTLE' },
  { value: 'plateau', label: 'PLATEAU' },
  { value: 'ramp-down', label: 'RAMP ↓' },
  { value: 'off-region', label: 'OFF REGION' },
]

function simplify(region: ViolationRegion | undefined): JudgmentRegion {
  if (!region) return 'inside-mask'
  if (region === 'pre-burst' || region === 'post-burst') return 'off-region'
  return region
}

function expectedRegions(evaluation: EvaluationResult) {
  if (evaluation.pass) return { first: 'inside-mask' as const, worst: 'inside-mask' as const }
  const worstViolation = evaluation.violations.find(
    (violation) => evaluation.worstTimeUs >= violation.startUs && evaluation.worstTimeUs <= violation.endUs,
  )
  return {
    first: simplify(evaluation.violations[0]?.region),
    worst: simplify(worstViolation?.region),
  }
}

export function JudgmentPanel({
  evaluation,
  onComplete,
}: {
  evaluation: EvaluationResult
  onComplete: (correct: boolean) => void
}) {
  const [first, setFirst] = useState<JudgmentRegion | ''>('')
  const [worst, setWorst] = useState<JudgmentRegion | ''>('')
  const [submitted, setSubmitted] = useState(false)
  const expected = expectedRegions(evaluation)
  const correct = first === expected.first && worst === expected.worst

  const submit = () => {
    if (!first || !worst || submitted) return
    setSubmitted(true)
    onComplete(correct)
  }

  return (
    <section className="judgment-panel" aria-labelledby="judgment-title">
      <div>
        <span className="eyebrow">READ THE REVEALED TRACE</span>
        <h2 id="judgment-title">첫 결과와 worst region을 직접 판정하세요.</h2>
      </div>
      <label>
        <span>FIRST RESULT</span>
        <select aria-label="첫 결과 region" value={first} disabled={submitted} onChange={(event) => setFirst(event.target.value as JudgmentRegion)}>
          <option value="">선택</option>
          {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label>
        <span>WORST REGION</span>
        <select aria-label="worst region" value={worst} disabled={submitted} onChange={(event) => setWorst(event.target.value as JudgmentRegion)}>
          <option value="">선택</option>
          {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </label>
      <button className="button-secondary" type="button" disabled={!first || !worst || submitted} onClick={submit}>판정 기록</button>
      {submitted && (
        <p className={correct ? 'is-correct' : 'is-wrong'} role="status">
          {correct
            ? 'Trace에서 first와 worst region을 정확히 찾았습니다.'
            : `기록된 결과: FIRST ${expected.first.toUpperCase()} · WORST ${expected.worst.toUpperCase()}`}
        </p>
      )}
    </section>
  )
}
