import type { BenchItem } from './types'

export const VNA_SERIES = 'VNA 실습 (E5071C)'
export const VNA_SETUP = 'E5071C 포트 1 → 케이블 → 감쇠기 → 케이블 → 포트 2'

export const VNA_BASICS: BenchItem = {
  id: 'vna-basics',
  number: 1,
  title: 'S-parameter와 VNA 기본 설정',
  series: VNA_SERIES,
  setup: VNA_SETUP,
  summary: 'VNA는 자기가 보낸 신호와 돌아온 신호를 비교해 반사(S11)와 통과(S21)를 복소수로 잽니다. 주파수 범위, 점 수, IF bandwidth, 포트 전력이 결과와 측정 시간을 어떻게 바꾸는지 익힙니다.',
  principle: [
    'SA는 들어오는 신호의 크기만 보지만, VNA는 자기 신호원으로 DUT를 자극하고 반사된 신호와 통과한 신호를 기준 신호와 비교합니다. 그래서 크기와 위상을 함께 얻습니다. 결과는 S-parameter입니다.',
    'S11은 포트 1로 보낸 신호 중 포트 1로 돌아온 비율(반사), S21은 포트 1로 보낸 신호 중 포트 2에 도착한 비율(통과)입니다. dB로 보면 S21은 이득 또는 손실, S11은 정합 정도입니다. return loss = −S11(dB)이고, VSWR = (1+|Γ|)/(1−|Γ|)입니다(Γ는 S11의 선형 크기).',
    'IF bandwidth(IFBW)는 VNA 수신기의 대역폭입니다. 좁히면 trace 잡음이 줄지만 점 하나를 재는 시간이 늘어납니다. SA의 RBW와 같은 거래입니다. 점 수(points)가 많으면 주파수 해상도는 좋아지지만 시간도 비례해서 늘어납니다.',
    'E5071C는 Preset 후 RF 출력이 켜진 상태(0 dBm)입니다. DUT를 연결하기 전에 포트 전력이 DUT와 반대편 포트에 안전한지 먼저 정합니다. 포트 최대 입력은 +10 dBm, 손상 레벨은 +26 dBm입니다(데이터시트 5989-5479EN, 해당 옵션 기준).',
  ],
  settings: [
    { name: 'Start / Stop', effect: '측정 주파수 범위', defaultValue: 'Start 100 kHz (Preset)', pitfall: '범위를 넓히면 같은 점 수에서 주파수 간격이 넓어져 좁은 공진을 놓침' },
    { name: 'Points', effect: '측정 점 수', defaultValue: '201 (Preset), 2–20001', pitfall: '점 수에 비례해 sweep 시간이 늘어남' },
    { name: 'IFBW', effect: '수신기 대역폭: trace 잡음과 측정 시간', defaultValue: '70 kHz (Preset), 10 Hz–1.5 MHz', pitfall: '낮은 레벨(큰 감쇠, 높은 차단 대역)을 넓은 IFBW로 재면 잡음에 묻힘' },
    { name: 'Port Power', effect: 'DUT에 들어가는 자극 전력', defaultValue: '0 dBm (Preset)', pitfall: '증폭기를 재면 출력이 반대 포트 최대 입력(+10 dBm)을 넘을 수 있음' },
    { name: 'Measurement (S11/S21…)', effect: '어떤 비율을 볼지', defaultValue: 'S11 (Preset)', pitfall: 'trace가 여러 개면 선택된 trace에만 명령이 적용됨' },
    { name: 'Format', effect: 'Log Mag, Phase, Group Delay, Smith, SWR 등 표시 형식', defaultValue: 'Log Mag (Preset)', pitfall: '같은 데이터라도 format에 따라 읽어오는 값(FDATA)의 의미가 바뀜' },
  ],
  steps: [
    {
      id: 'thru-uncal',
      title: '보정 없이 케이블만 보기',
      actions: [
        '포트 1과 포트 2를 케이블 두 개로 직접 연결합니다(감쇠기 없이).',
        'Preset 후 Start 10 MHz, Stop 3 GHz, Points 201, 포트 전력 −10 dBm. Measurement S21, Format Log Mag.',
      ],
      check: '보정 전이라 0 dB 근처에서 주파수에 따라 출렁이는 선이 보입니다. 케이블 손실과 VNA 자체 오차가 섞인 값입니다.',
      record: { label: '3 GHz에서 S21', unit: 'dB', predict: true },
    },
    {
      id: 'four-views',
      title: '같은 연결을 네 가지 형식으로',
      actions: ['S21을 Phase, Group Delay로, S11을 Log Mag, SWR로 바꿔 봅니다.'],
      check: 'Phase는 주파수에 따라 계속 돌아가며(케이블 길이 때문), Group Delay는 거의 평평한 값이 됩니다.',
      record: { label: 'S21 group delay', unit: 'ns', predict: true },
    },
    {
      id: 'ifbw',
      title: 'IFBW와 trace 잡음',
      actions: [
        '케이블 사이에 감쇠기를 넣습니다. S21 Log Mag를 보면서 IFBW를 70 kHz → 1 kHz → 100 Hz로 바꿉니다.',
        '화면의 sweep 시간도 함께 읽습니다.',
      ],
      check: 'IFBW를 좁힐수록 trace가 매끈해지고 sweep 시간이 길어집니다.',
      record: { label: 'IFBW 100 Hz일 때 sweep 시간', unit: 's', predict: true },
    },
    {
      id: 'points',
      title: '점 수와 시간',
      actions: ['IFBW 1 kHz에서 Points를 201 → 1601로 바꾸고 sweep 시간을 읽습니다.'],
      check: '점 수가 8배면 sweep 시간도 대략 8배가 됩니다.',
      record: { label: 'Points 1601일 때 sweep 시간', unit: 's', predict: true },
    },
  ],
  scpi: [
    { command: ':SENSe1:FREQuency:STARt <freq> / :STOP <freq>', instrument: 'VNA', purpose: '주파수 범위 (Start Preset 100 kHz)', source: 'e5071c-help' },
    { command: ':SENSe1:SWEep:POINts <n>', instrument: 'VNA', purpose: '점 수 (Preset 201, 2–20001)', source: 'e5071c-help' },
    { command: ':SENSe1:BANDwidth[:RESolution] <Hz>', instrument: 'VNA', purpose: 'IFBW (Preset 70 kHz, 10 Hz–1.5 MHz)', source: 'e5071c-help' },
    { command: ':SOURce1:POWer[:LEVel][:IMMediate][:AMPLitude] <dBm>', instrument: 'VNA', purpose: '포트 전력 (Preset 0 dBm, 0.05 dB 단위)', source: 'e5071c-help' },
    { command: ':OUTPut[:STATe] ON|OFF', instrument: 'VNA', purpose: '자극 출력 (Preset ON)', source: 'e5071c-help' },
    { command: ':CALCulate1:PARameter1:DEFine S11|S21|S12|S22', instrument: 'VNA', purpose: 'trace 1이 볼 S-parameter (Preset S11)', source: 'e5071c-help' },
    { command: ':CALCulate1:PARameter1:SELect', instrument: 'VNA', purpose: 'trace 1을 활성 trace로', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:FORMat MLOGarithmic|PHASe|GDELay|SMITh|SWR|...', instrument: 'VNA', purpose: '표시 형식 (Preset MLOG)', source: 'e5071c-help' },
    { command: ':DISPlay:WINDow1:TRACe1:Y[:SCALe]:AUTO', instrument: 'VNA', purpose: '자동 스케일', source: 'e5071c-help' },  ],
  testProgram: [
    'VNA 측정 시간은 대략 점 수 × (1/IFBW에 비례하는 시간)입니다. 생산 테스트에서는 판정에 필요한 주파수 점만 재거나(segment sweep), 판정 마진이 허락하는 가장 넓은 IFBW를 고릅니다.',
    'Preset 후 RF가 켜져 있으므로, 시퀀스는 포트 전력을 먼저 설정하고 DUT를 연결(또는 스위치 전환)한 뒤 측정합니다.',
    '여러 trace를 쓰는 시퀀스는 명령마다 어떤 trace가 활성인지 명확히 합니다(:CALC:PAR:SEL). 활성 trace가 바뀌어 다른 S-parameter의 값을 읽는 실수가 흔합니다.',
    'Format은 읽어오는 데이터의 의미를 바꿉니다. 프로그램이 dB를 기대한다면 format을 MLOG로 명시하고 읽습니다.',
  ],
  script: 'bench/labs/lab_vna1_basics.py',
}
