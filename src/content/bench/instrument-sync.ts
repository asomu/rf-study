import type { BenchItem } from './types'

export const INSTRUMENT_SYNC: BenchItem = {
  id: 'instrument-sync',
  number: 1,
  title: '한 test point를 여러 장비로 만들기',
  series: '다장비 동기화',
  setup: 'N6700C(바이어스, 부하 저항) + N5182B → 케이블 → U2053XA 또는 감쇠기 → N9020B (DUT 없이 흐름만)',
  summary: 'PA 모듈의 한 측정 조건(test point)은 전원, 신호원, 측정기가 정해진 순서로 움직여야 만들어집니다. 순서, 대기, 기록, 정리 단계를 하나의 함수로 묶는 연습입니다.',
  principle: [
    'PA 측정의 기본 순서는 "DC 먼저, RF 나중"입니다. 바이어스가 없는 PA에 RF를 넣거나, RF가 들어가는 중에 바이어스를 끄면 DUT가 손상될 수 있습니다. 끌 때는 반대로 RF를 먼저 끄고 DC를 끕니다.',
    '각 장비는 명령을 받고 실제로 상태가 바뀌기까지 시간이 걸립니다. 전원 OUTPut ON은 35–50 ms, SG 주파수·레벨 변경은 정착 시간, SA sweep과 파워센서 평균은 측정 시간이 있습니다. 장비마다 *OPC?로 완료를 확인한 뒤 다음 장비로 넘어갑니다.',
    '한 test point의 결과는 한 줄의 레코드입니다. 조건(주파수, 레벨, 전압), 결과(전력, harmonic, 전류), 메타데이터(장비 ID, cal 버전, 시각, 단계별 소요 시간)를 함께 남겨야 나중에 결과를 해석할 수 있습니다.',
    '어느 단계에서 에러가 나도 "RF off → DC off" 정리가 반드시 실행되어야 합니다. 이것이 측정 함수 구조의 핵심입니다.',
  ],
  settings: [
    { name: '켜는 순서', effect: 'DC bias → SG 설정 → RF on → 측정', defaultValue: '—', pitfall: 'RF를 먼저 켜면 바이어스 없는 PA에 입력이 걸림' },
    { name: '끄는 순서', effect: 'RF off → DC off', defaultValue: '—', pitfall: '예외 처리에서 순서가 뒤집히기 쉬움' },
    { name: '단계별 대기', effect: '*OPC?로 각 장비 완료 확인', defaultValue: '—', pitfall: 'time.sleep 고정값은 느리거나(낭비) 짧음(불안정)' },
    { name: '레코드 구조', effect: '조건 + 결과 + 메타데이터 한 줄', defaultValue: '—', pitfall: '결과 숫자만 남기면 나중에 어떤 조건이었는지 알 수 없음' },
  ],
  steps: [
    {
      id: 'predict-time',
      title: '총 시간 예측',
      actions: ['스크립트를 실행하기 전에, 각 단계(전원 on, SG 설정, 센서 측정, SA harmonic, 전류 측정, 정리)의 시간을 예상해 합계를 적습니다.'],
      record: { label: '예상 총 시간', unit: 'ms', predict: true },
    },
    {
      id: 'run',
      title: '스크립트로 test point 실행',
      actions: ['python3 -m labs.lab_sync_test_point --live --ps … --sg … --pm … --sa … 를 실행합니다. 센서는 케이블 끝, SA는 감쇠기 뒤에 둘 수 없으므로 --use-sa로 SA만 쓰거나 기본값(센서)으로 실행합니다.'],
      check: '레코드 한 줄과 단계별 시간 표가 출력됩니다.',
      record: { label: '실제 총 시간', unit: 'ms' },
    },
    {
      id: 'slowest',
      title: '가장 느린 단계 찾기',
      actions: ['단계별 시간 표에서 가장 오래 걸린 단계를 찾습니다.'],
      check: '보통 측정기(센서 평균, SA sweep)나 전원 출력 켜기가 가장 깁니다. test time을 줄일 때 먼저 볼 곳입니다(8번 트랙).',
      record: { label: '가장 느린 단계와 시간' },
    },
    {
      id: 'failure-order',
      title: '실패해도 정리 순서가 지켜지는지',
      actions: ['--fail-at sa 옵션으로 SA 단계에서 일부러 실패시키고, 출력된 명령 순서에서 RF off가 DC off보다 먼저인지 확인합니다.'],
      check: '에러가 나도 SG RF off → PS output off 순서로 정리됩니다.',
      record: { label: '정리 순서 확인 결과' },
    },
  ],
  scpi: [
    { command: 'OUTPut[:STATe] ON|OFF,(@<ch>)', instrument: 'DC 전원', purpose: '바이어스 켜기/끄기', source: 'n6700c-osg' },
    { command: ':OUTPut[:STATe] ON|OFF', instrument: 'SG', purpose: 'RF 켜기/끄기', source: 'mxg-scpi' },
    { command: '*OPC?', instrument: '공통', purpose: '각 장비 완료 확인', source: 'ieee-488.2' },
    { command: 'READ[1]?', instrument: '파워센서', purpose: '출력 전력', source: 'u2000-pg' },
    { command: ':INITiate[:IMMediate] / :CALCulate:MARKer1:MAXimum', instrument: 'SA', purpose: 'harmonic 측정', source: 'xsa-scpi' },
    { command: 'MEASure[:SCALar]:CURRent[:DC]? (@<ch>)', instrument: 'DC 전원', purpose: '전류', source: 'n6700c-osg' },
  ],
  testProgram: [
    '측정 함수 하나가 "조건을 받아 → 순서대로 장비를 움직이고 → 레코드를 돌려주고 → 반드시 정리"하도록 만듭니다. 테스트 시퀀스는 이 함수를 조건 목록에 대해 반복할 뿐입니다.',
    '단계별 시간을 레코드에 남기면 test time 분석(8번 트랙)과 장비 이상 감지(갑자기 느려진 장비)에 바로 쓸 수 있습니다.',
    '장비 ID(*IDN?)와 cal 버전은 시퀀스 시작에 한 번 읽어 모든 레코드에 붙입니다(7번 트랙 "측정 데이터 모델").',
    '장비가 늘어날수록 공유 트리거(하드웨어 trigger 선)로 동기화하면 더 빠르지만, 먼저 *OPC? 방식으로 정확한 순서를 만든 뒤 속도를 최적화합니다.',
  ],
  script: 'bench/labs/lab_sync_test_point.py',
}
