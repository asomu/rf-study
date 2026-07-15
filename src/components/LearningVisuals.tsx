const failureShapes = [
  { id: 'PASS', region: 'ALL REGIONS', check: 'Positive margin', path: 'M4 38 L18 38 L25 9 L94 9 L101 38 L116 38' },
  { id: 'TIMING', region: 'PRE / RAMP', check: 'Trigger alignment', path: 'M4 38 L11 38 L18 9 L87 9 L94 38 L116 38' },
  { id: 'OVERSHOOT', region: 'EARLY SETTLE', check: 'Control step', path: 'M4 38 L18 38 L25 4 L34 14 L43 9 L94 9 L101 38 L116 38' },
  { id: 'SETTLING', region: 'EARLY SETTLE', check: 'Loop damping', path: 'M4 38 L18 38 L25 5 L34 15 L43 7 L52 13 L61 9 L94 9 L101 38 L116 38' },
  { id: 'FLOOR', region: 'PRE / POST', check: 'Leakage · isolation', path: 'M4 30 L18 30 L25 9 L94 9 L101 30 L116 30' },
]

export function LearningVisuals() {
  return (
    <section className="learning-visuals" aria-label="PvT 설명 도해">
      <figure className="sequence-figure">
        <figcaption><span>FIG. 02</span> CONTROL → RF OUTPUT — 같은 시간축에서 보기</figcaption>
        <div className="sequence-axis" aria-label="PA enable, bias, RF output, 교육용 mask의 상대 timing">
          <div className="sequence-marker"><span>PRE</span><span>RAMP</span><span>USEFUL BURST</span><span>RAMP</span><span>POST</span></div>
          <div className="sequence-row enable-row"><strong>PA ENABLE</strong><i /></div>
          <div className="sequence-row bias-row"><strong>BIAS / SUPPLY</strong><i /></div>
          <div className="sequence-row output-row"><strong>RF OUTPUT</strong><i /></div>
          <div className="sequence-row mask-row"><strong>EDU MASK</strong><i /></div>
        </div>
        <p>Trigger가 먼저 열리고 bias/supply가 안정된 뒤 RF가 corridor 안으로 진입해야 합니다. 순서와 응답 속도 중 어느 쪽이 어긋났는지 분리해서 봅니다.</p>
      </figure>

      <figure className="failure-atlas">
        <figcaption><span>FIG. 03</span> FAILURE ATLAS — 모양보다 첫 위반 위치를 먼저 읽기</figcaption>
        <div className="failure-grid">
          {failureShapes.map((shape) => (
            <article key={shape.id}>
              <div><strong>{shape.id}</strong><span>{shape.region}</span></div>
              <svg viewBox="0 0 120 46" role="img" aria-label={`${shape.id} 교육용 trace 예시`}>
                <path className="mini-mask" d="M4 40 L16 40 L23 13 L97 13 L104 40 L116 40" />
                <path className="mini-trace" d={shape.path} />
              </svg>
              <p>{shape.check}</p>
            </article>
          ))}
        </div>
      </figure>
    </section>
  )
}
