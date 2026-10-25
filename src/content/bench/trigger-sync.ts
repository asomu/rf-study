import type { BenchItem } from './types'

export const TRIGGER_SYNC: BenchItem = {
  id: 'trigger-sync',
  number: 11,
  title: 'Trigger와 *OPC? 동기화',
  summary: '프로그램이 장비에게 "측정해"라고 보낸 뒤 언제 결과를 읽어도 되는지를 다룹니다. 동기화가 틀리면 에러 없이 이전 값을 읽는 조용한 버그가 생깁니다.',
  principle: [
    'SCPI 명령은 장비 입력 버퍼에 쌓이고, 장비는 하나씩 처리합니다. :INITiate:IMMediate처럼 시간이 걸리는 명령은 "시작"만 하고 바로 다음 명령으로 넘어갈 수 있습니다(overlapped). 이때 바로 marker를 읽으면 아직 끝나지 않은, 또는 이전 sweep의 값을 읽습니다.',
    '*OPC?는 앞의 모든 명령이 끝날 때까지 응답을 보내지 않고, 끝나면 1을 돌려줍니다. 프로그램은 이 응답을 기다리는 동안 멈춰 있게 됩니다. 가장 단순하고 확실한 동기화입니다. VISA 타임아웃은 가장 긴 sweep보다 길어야 합니다.',
    '*WAI는 장비 안에서만 다음 명령을 기다리게 하고 PC에는 아무것도 돌려주지 않습니다. 프로그램은 계속 진행하므로, 결과를 읽는 질의를 보낼 때 그 질의가 기다려질 뿐입니다. *OPC(물음표 없음)와 상태 레지스터를 쓰면 기다리는 동안 다른 일을 할 수 있지만 코드가 복잡해집니다.',
    'Continuous sweep(:INITiate:CONTinuous ON)은 사람이 화면을 볼 때는 편하지만, 프로그램은 어느 sweep의 값을 읽는지 알 수 없습니다. 자동화에서는 single sweep + *OPC?가 기본입니다.',
  ],
  settings: [
    { name: 'Sweep Mode', effect: 'Continuous 또는 Single', defaultValue: 'Continuous (전원 켤 때). *RST 후에는 Single', pitfall: 'Continuous에서 marker를 읽으면 진행 중인 sweep의 값일 수 있음' },
    { name: 'VISA Timeout', effect: '응답을 기다리는 최대 시간 (PC 쪽 설정)', defaultValue: '라이브러리 기본값 (보통 수 초)', pitfall: '긴 sweep(좁은 RBW, 큰 평균 횟수)에서 *OPC?가 타임아웃' },
    { name: 'Trigger Source', effect: 'sweep 시작 조건 (Free Run, Video, External)', defaultValue: 'Free Run', pitfall: 'External인데 trigger가 오지 않으면 *OPC?가 끝나지 않음' },
    { name: 'SA Trigger 1 Out', effect: 'SA가 sweep 중임을 바깥으로 알리는 신호', defaultValue: 'Sweeping(HSWP)', pitfall: 'Preset으로는 바뀌지 않음(Restore Input/Output Defaults에서 초기화)' },
  ],
  steps: [
    {
      id: 'stale-read',
      title: '이전 값을 읽는 버그 재현',
      actions: [
        'SA: Continuous sweep, RBW 1 kHz, Span 1 MHz (sweep time이 눈에 보이게 길게).',
        'SG를 −10 dBm → −20 dBm으로 바꾼 직후 바로 :CALCulate:MARKer1:Y?를 읽습니다.',
      ],
      check: '−20 dBm 근처가 아니라 −10 dBm 근처 값이 나올 수 있습니다. 에러는 없습니다.',
      record: { label: '레벨 변경 직후 읽은 값', unit: 'dBm', predict: true },
    },
    {
      id: 'opc-read',
      title: 'Single sweep + *OPC?로 고치기',
      actions: [':INITiate:CONTinuous OFF, 레벨 변경, :INITiate:IMMediate, *OPC?(1이 올 때까지 기다림), marker Peak Search 후 Y? 순서로 보냅니다.'],
      check: '항상 바뀐 레벨이 나옵니다.',
      record: { label: '*OPC? 후 읽은 값', unit: 'dBm', predict: true },
    },
    {
      id: 'timing',
      title: 'Sweep 한 번에 걸리는 실제 시간',
      actions: ['스크립트로 RBW 100 kHz, 10 kHz, 1 kHz에서 "INIT + *OPC?"에 걸린 시간을 PC에서 잽니다.'],
      check: '장비 화면의 sweep time보다 조금 깁니다. 명령 전송, 정착, 데이터 처리 시간이 더해지기 때문입니다. 이 값이 test time의 바닥입니다.',
      record: { label: 'RBW 1 kHz에서 측정된 시간', unit: 'ms', predict: true },
    },
    {
      id: 'timeout',
      title: '타임아웃이 나는 조건 만들기',
      actions: ['스크립트의 --timeout-demo로, sweep time 5 s 설정과 VISA 타임아웃 2 s 조합을 실행합니다.'],
      check: '스크립트가 타임아웃을 잡아 보고하고, RF를 끈 뒤 종료합니다. 장비는 sweep을 계속하므로 다음 명령 전에 정리가 필요합니다(13번 항목).',
      record: { label: '타임아웃 발생 여부와 메시지' },
    },
  ],
  scpi: [
    { command: ':INITiate:CONTinuous OFF|ON', instrument: 'SA', purpose: 'Single / Continuous', source: 'xsa-scpi' },
    { command: ':INITiate[:IMMediate]', instrument: 'SA', purpose: 'sweep 시작', source: 'xsa-scpi' },
    { command: '*OPC?', instrument: 'SG · SA', purpose: '앞 명령이 모두 끝나면 1 반환', source: 'ieee-488.2' },
    { command: '*OPC', instrument: 'SG · SA', purpose: '완료 시 상태 레지스터 비트 설정 (비동기 방식)', source: 'ieee-488.2' },
    { command: '*WAI', instrument: 'SG · SA', purpose: '장비 안에서만 다음 명령 대기', source: 'ieee-488.2' },
    { command: ':TRIGger[:SEQuence]:SOURce IMMediate|VIDeo|EXTernal1', instrument: 'SA', purpose: 'trigger 소스', source: 'xsa-scpi' },
    { command: ':TRIGger[:SEQuence]:OUTPut HSWP|...', instrument: 'SA', purpose: 'Trigger 1 Out 신호 종류 (기본 Sweeping)', source: 'xsa-scpi' },
    { command: '[:SENSe]:SWEep:TIME?', instrument: 'SA', purpose: '장비가 계산한 sweep time', source: 'xsa-scpi' },
  ],
  testProgram: [
    '측정 시퀀스는 single sweep + *OPC? + 결과 읽기를 한 단위로 묶은 함수 하나로 만들고, 모든 측정이 그 함수를 거치게 합니다. 개별 코드에서 동기화를 빼먹는 실수를 구조로 막습니다.',
    'VISA 타임아웃은 측정 조건마다 계산합니다(장비 sweep time × 평균 횟수 + 여유). 전역으로 아주 크게 두면 장비가 멈췄을 때 프로그램도 오래 멈춥니다.',
    '타임아웃이 나면 장비는 아직 이전 명령을 처리 중일 수 있습니다. :ABORt, *CLS, 에러 큐 정리를 거친 뒤 다음 DUT로 넘어갑니다.',
    'SG 설정 변경 후 출력이 안정되는 시간도 있습니다. SG에도 *OPC?를 보내 설정 완료를 확인한 뒤 SA를 trigger합니다.',
  ],
  script: 'bench/labs/lab11_trigger_sync.py',
}
