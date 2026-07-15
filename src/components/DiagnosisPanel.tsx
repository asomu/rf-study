import type { EvaluationResult } from '../domain/pvt/types'

export function DiagnosisPanel({ evaluation }: { evaluation: EvaluationResult }) {
  const firstRegion = evaluation.violations[0]?.region ?? 'inside-mask'
  return (
    <section className={`diagnosis-panel ${evaluation.pass ? 'is-pass' : 'is-fail'}`} aria-labelledby="diagnosis-title">
      <div className="verdict-row">
        <span className="status-lamp" aria-hidden="true" />
        <div>
          <span className="eyebrow">EDUCATIONAL VERDICT</span>
          <h2 id="diagnosis-title">{evaluation.pass ? '교육용 마스크 통과' : '교육용 마스크 이탈'}</h2>
        </div>
      </div>
      <dl className="metric-grid">
        <div><dt>WORST MARGIN</dt><dd>{evaluation.worstMarginDb.toFixed(2)} <small>dB</small></dd></div>
        <div><dt>WORST TIME</dt><dd>{evaluation.worstTimeUs.toFixed(1)} <small>µs</small></dd></div>
        <div><dt>FIRST REGION</dt><dd className="metric-text">{firstRegion}</dd></div>
      </dl>
      <div className="cause-list">
        <span>WHY DID IT {evaluation.pass ? 'PASS' : 'FAIL'}?</span>
        <ol>
          {evaluation.possibleCauses.map((cause) => <li key={cause}>{cause}</li>)}
        </ol>
      </div>
      <p className="model-disclaimer">이 결과는 학습용 근사이며 적합성 판정이 아닙니다.</p>
    </section>
  )
}
