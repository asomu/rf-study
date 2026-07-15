const sources = [
  { id: 'TS 45.002', role: 'TDMA frame, timeslot, burst timing 구조' },
  { id: 'TS 45.004', role: 'GMSK modulation과 symbol-rate 맥락' },
  { id: 'TS 45.005', role: '무선 송수신 RF 성능 요구사항 계열' },
  { id: 'TS 51.010-1', role: '이동국 시험 구성과 측정 절차 계열' },
]

export function SpecificationReference() {
  return (
    <details className="spec-reference">
      <summary>
        <span>SPECIFICATION REFERENCE LAYER</span>
        <strong>현재 모델과 3GPP 문서의 역할 구분 보기</strong>
      </summary>
      <div className="spec-reference-body">
        <div className="reference-intro">
          <span>BOUNDARY</span>
          <p>
            차트의 <b>REF START / REF END</b>는 교육용 useful window이고, amber corridor는 개념 학습을 위한 근사 mask입니다.
            공식 적합성 수치나 판정을 재현하지 않습니다.
          </p>
        </div>
        <dl>
          {sources.map((source) => (
            <div key={source.id}>
              <dt>{source.id}</dt>
              <dd>{source.role}</dd>
            </div>
          ))}
        </dl>
        <p className="reference-procedure">
          <span>MEASUREMENT ORDER</span>
          profile 선언 → 기준 전력 정규화 → 시간 정렬 → sample별 upper/lower margin → first violation과 worst margin 확인
        </p>
      </div>
    </details>
  )
}
