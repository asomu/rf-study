import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConceptDiagram } from '../components/ConceptDiagram'
import { LearningVisuals } from '../components/LearningVisuals'
import { CAUSE_EFFECT_ROWS, DIAGNOSTIC_ITEMS } from '../content/learning'
import { useProgress } from '../state/progress'

export function LearnPage() {
  const { progress, setConceptCheck } = useProgress()
  const [feedback, setFeedback] = useState<Record<string, { choice: boolean; correct: boolean }>>({})

  const answer = (id: string, choice: boolean, expected: boolean) => {
    const correct = choice === expected
    setFeedback((current) => ({ ...current, [id]: { choice, correct } }))
    setConceptCheck(id, correct)
  }

  return (
    <div className="page learn-page">
      <section className="page-hero learn-hero">
        <div className="hero-copy">
          <span className="kicker">FIELD NOTE 001 / TIME DOMAIN</span>
          <h1>BURST를<br /><em>읽는 법.</em></h1>
          <p>Mask의 선을 외우기 전에, 어떤 제어가 어떤 파형을 만들고 왜 그 위치에서 실패하는지 연결합니다.</p>
          <div className="hero-actions">
            <Link className="button-primary" to="/modules/gsm-pvt/lab">LAB 시작하기 <span>→</span></Link>
            <a className="text-link" href="#diagnostic">5문항 사전 진단</a>
          </div>
        </div>
        <div className="hero-instrument" aria-label="GSM Normal Burst 핵심 수치">
          <div className="instrument-top"><span>BURST MONITOR</span><i>CH 01</i></div>
          <div className="signal-sketch" aria-hidden="true">
            <svg viewBox="0 0 560 180" preserveAspectRatio="none">
              <path className="sketch-grid" d="M0 45H560M0 90H560M0 135H560M70 0V180M140 0V180M210 0V180M280 0V180M350 0V180M420 0V180M490 0V180" />
              <path className="sketch-mask" d="M0 158L58 158L77 122L94 35L466 35L484 122L503 158L560 158" />
              <path className="sketch-trace" d="M0 165L61 164C69 163 78 151 83 120C88 88 90 38 102 29C113 20 126 42 141 31C158 26 176 32 196 30L455 30C466 31 471 46 478 87C484 129 490 158 507 164L560 165" />
            </svg>
          </div>
          <dl>
            <div><dt>TIME SLOT</dt><dd>576.9 <small>µs</small></dd></div>
            <div><dt>EDU WINDOW</dt><dd>542.8 <small>µs</small></dd></div>
            <div><dt>REFERENCE</dt><dd>0 <small>dBc</small></dd></div>
          </dl>
          <p><span>NOTE</span> 0 dBc는 선언한 reference에 대한 상대값입니다.</p>
        </div>
      </section>

      <ConceptDiagram />

      <section className="learning-block">
        <div className="section-number">02</div>
        <div className="learning-copy">
          <span className="eyebrow">THE ENGINEERING CHAIN</span>
          <h2>Parameter 하나가 파형과 원인 사이를 잇습니다.</h2>
          <p>같은 Fail이라도 첫 위반 위치가 다르면 확인할 회로와 제어 순서도 달라집니다.</p>
        </div>
        <div className="cause-table">
          <div className="cause-header"><span>CONTROL</span><span>VISIBLE SYMPTOM</span><span>FIRST REGION</span><span>CHECK NEXT</span></div>
          {CAUSE_EFFECT_ROWS.map((row) => (
            <div className="cause-row" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span></div>
          ))}
        </div>
      </section>

      <LearningVisuals />

      <section className="diagnostic-section" id="diagnostic">
        <div className="section-heading">
          <span className="eyebrow">PRE-FLIGHT CHECK</span>
          <h2>5문항 사전 진단</h2>
          <p>틀린 항목은 진입을 막지 않습니다. Review에서 다시 볼 개념으로 표시됩니다.</p>
        </div>
        <div className="diagnostic-grid">
          {DIAGNOSTIC_ITEMS.map((item, index) => {
            const result = feedback[item.id]
            return (
              <article className={`diagnostic-card ${result ? (result.correct ? 'is-correct' : 'is-wrong') : ''}`} key={item.id}>
                <span className="card-index">Q{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.question}</h3>
                <div className="binary-actions" aria-label={`${item.question} 답 선택`}>
                  <button type="button" onClick={() => answer(item.id, true, item.answer)}>YES</button>
                  <button type="button" onClick={() => answer(item.id, false, item.answer)}>NO</button>
                </div>
                {result && <p role="status"><strong>{result.correct ? '정확합니다.' : '다시 연결해 봅시다.'}</strong> {item.explanation}</p>}
                {!result && progress.conceptChecks[item.id] !== undefined && <small>이전에 답한 문항입니다. 다시 확인할 수 있습니다.</small>}
              </article>
            )
          })}
        </div>
      </section>

      <section className="source-note">
        <span>SOURCE MAP</span>
        <p>Timing: TS 45.002 · Modulation: TS 45.004 · RF requirement: TS 45.005 · Measurement procedure: TS 51.010-1</p>
        <strong>Educational approximation — not a conformance verdict.</strong>
      </section>
    </div>
  )
}
