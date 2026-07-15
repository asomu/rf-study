import { Link } from 'react-router-dom'
import { DiagnosisPanel } from '../components/DiagnosisPanel'
import { ProgressMatrix } from '../components/ProgressMatrix'
import { PvTChart } from '../components/PvTChart'
import { DIAGNOSTIC_ITEMS } from '../content/learning'
import { simulatePvT } from '../domain/pvt/model'
import { EDUCATIONAL_PROFILE, PARAMETER_DEFINITIONS } from '../domain/pvt/profile'
import { useProgress } from '../state/progress'

export function ReviewPage() {
  const { progress, setTeachBackComplete } = useProgress()
  const result = simulatePvT(progress.lastParameters)
  const reviewConcepts = DIAGNOSTIC_ITEMS.filter((item) => progress.conceptChecks[item.id] === false)

  return (
    <div className="page review-page">
      <header className="review-header">
        <div><span className="kicker">FIELD EVIDENCE / M1</span><h1>설명할 수 있어야<br /><em>완료입니다.</em></h1></div>
        <p>활동 횟수가 아니라 예측, 판정, 진단, teach-back의 증거를 따로 확인합니다.</p>
      </header>

      <ProgressMatrix progress={progress} />

      {reviewConcepts.length > 0 && (
        <section className="review-queue" aria-labelledby="review-queue-title">
          <div>
            <span className="eyebrow">TARGETED CONCEPT REVIEW</span>
            <h2 id="review-queue-title">다시 연결할 개념 {reviewConcepts.length}개</h2>
          </div>
          <div className="review-queue-grid">
            {reviewConcepts.map((item) => (
              <article key={item.id}>
                <strong>{item.question}</strong>
                <p>{item.explanation}</p>
              </article>
            ))}
          </div>
          <Link className="text-link" to="/modules/gsm-pvt/learn#diagnostic">사전 진단에서 다시 확인 →</Link>
        </section>
      )}

      {progress.lastEvaluation ? (
        <section className="teaching-snapshot" id="teaching-snapshot">
          <div className="snapshot-head">
            <div><span className="eyebrow">TEACHING SNAPSHOT</span><h2>GSM Burst / PvT 진단 한 장 요약</h2></div>
            <button className="button-secondary no-print" type="button" onClick={() => window.print()}>인쇄하기</button>
          </div>
          <PvTChart trace={result.trace} violations={result.evaluation.violations} compact />
          <section className="snapshot-record" aria-label="실험 재현 정보">
            <div className="profile-record">
              <span>PROFILE</span>
              <strong>{EDUCATIONAL_PROFILE.id}</strong>
              <small>{EDUCATIONAL_PROFILE.specVersion}</small>
            </div>
            <dl>
              {PARAMETER_DEFINITIONS.map((definition) => (
                <div key={definition.key}>
                  <dt>{definition.shortLabel}</dt>
                  <dd>{progress.lastParameters[definition.key]} <small>{definition.unit}</small></dd>
                </div>
              ))}
              <div>
                <dt>SEED</dt>
                <dd>{progress.lastParameters.seed}</dd>
              </div>
            </dl>
            {progress.lastResponse && (
              <div className="learner-record">
                <span>LEARNER EVIDENCE · {progress.lastResponse.scenarioId.toUpperCase()}</span>
                <p><b>Diagnosis</b> {progress.lastResponse.diagnosis}</p>
                <p><b>Evidence</b> {progress.lastResponse.evidence}</p>
              </div>
            )}
          </section>
          <div className="snapshot-bottom">
            <DiagnosisPanel evaluation={result.evaluation} />
            <div className="teach-prompt">
              <span>90-SECOND TEACH-BACK</span>
              <h3>왜 이 trace는 {result.evaluation.pass ? '통과' : '실패'}했나요?</h3>
              <ol>
                <li>Reference와 단위를 먼저 말합니다.</li>
                <li>첫 위반 위치와 worst margin을 지목합니다.</li>
                <li>가능한 PA/FEM 원인과 다음 확인 항목을 설명합니다.</li>
              </ol>
              <label className="teach-complete">
                <input
                  type="checkbox"
                  checked={progress.teachBackComplete}
                  onChange={(event) => setTeachBackComplete(event.target.checked)}
                />
                <span>90초 설명을 실제로 완료했습니다.</span>
              </label>
            </div>
          </div>
        </section>
      ) : (
        <section className="empty-review">
          <span>NO FIELD RECORD</span><h2>아직 저장된 진단이 없습니다.</h2>
          <p>Lab에서 첫 실험을 완료하면 chart와 reasoning이 여기에 기록됩니다.</p>
          <Link className="button-primary" to="/modules/gsm-pvt/lab">첫 실험 시작 <span>→</span></Link>
        </section>
      )}

      <section className="next-module">
        <span>NEXT SIGNAL</span><h2>M2 · GSM Phase Error Lab</h2><p>Phase trajectory와 modulation quality를 같은 예측–진단 구조로 연결합니다.</p>
        <em>LOCKED · M1 REVIEW REQUIRED</em>
      </section>
    </div>
  )
}
