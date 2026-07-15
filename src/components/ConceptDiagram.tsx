export function ConceptDiagram() {
  return (
    <figure className="concept-diagram">
      <figcaption><span>FIG. 01</span> TDMA hierarchy — 큰 시간 구조에서 실제 burst로 내려가기</figcaption>
      <div className="hierarchy-grid">
        <div className="hierarchy-frame"><span>FRAME</span><strong>4.615 ms</strong><i>8 time slots</i></div>
        <div className="diagram-arrow" aria-hidden="true">→</div>
        <div className="slot-stack" aria-label="8개 timeslot 중 하나를 강조">
          {Array.from({ length: 8 }, (_, index) => <i key={index} className={index === 3 ? 'active' : ''}>{index}</i>)}
        </div>
        <div className="diagram-arrow" aria-hidden="true">→</div>
        <div className="burst-map">
          <span className="tail">TAIL<br />3</span><span>DATA<br />58</span><span className="training">TRAINING<br />26</span><span>DATA<br />58</span><span className="tail">TAIL<br />3</span><span className="guard">GUARD<br />8.25</span>
        </div>
      </div>
      <p>Timeslot은 전송 기회이고 Normal Burst는 148-bit 구조 뒤에 8.25-bit guard가 이어집니다. 이 Lab의 542.8 µs reference window는 147 symbol duration으로 정규화한 교육용 경계이며, PvT는 그 주위의 RF power envelope를 봅니다.</p>
    </figure>
  )
}
