import type { BenchItem } from './types'

export const SA_AXES: BenchItem = {
  id: 'sa-axes',
  number: 3,
  title: 'SA 기본 축: center · span · ref level · scale',
  summary: 'SA 화면의 가로축(주파수)과 세로축(레벨)을 어떻게 정하는지, 그리고 ref level이 화면만이 아니라 입력 감쇠까지 바꾼다는 점을 확인합니다.',
  principle: [
    'Swept SA는 LO를 쓸면서 입력 신호를 IF로 내리고, RBW 필터와 detector를 거친 값을 주파수별로 그립니다. 가로축은 LO가 훑는 범위입니다. Center+Span과 Start+Stop은 같은 범위를 두 가지 방법으로 말하는 것입니다.',
    '세로축 맨 위 눈금선이 reference level입니다. Log 스케일 기본값은 10 dB/div, 10칸이라서 화면은 ref level부터 100 dB 아래까지 보여줍니다.',
    'Ref level은 화면 표시값이지만 Auto 상태의 입력 감쇠기와 묶여 있습니다. ref level을 올리면 큰 신호가 mixer를 포화시키지 않도록 감쇠가 늘어나고, 그만큼 noise floor가 올라갑니다. 5번 항목에서 자세히 다룹니다.',
    'Ref level offset은 모든 표시값에 같은 dB를 더합니다. 10 dB 감쇠기 뒤에서 잴 때 offset을 +10 dB로 두면, 화면이 감쇠기 앞(SG 출력)의 레벨을 보여줍니다.',
  ],
  settings: [
    { name: 'Center / Span', effect: '화면 가운데 주파수와 전체 폭', defaultValue: 'Span = 장비 전체 범위 (Preset)', pitfall: 'Span을 바꾸면 RBW Auto가 따라 바뀌어 noise floor와 sweep time도 변함' },
    { name: 'Start / Stop', effect: '화면 왼쪽 끝과 오른쪽 끝 주파수', defaultValue: '—', pitfall: 'Start/Stop으로 설정해도 Center/Span 값이 같이 바뀜. 둘을 섞어 보내면 마지막 명령 기준' },
    { name: 'Ref Level', effect: '맨 위 눈금선의 레벨', defaultValue: '0 dBm (Preset)', pitfall: '신호가 ref level보다 크면 화면 위로 잘리고, Auto 감쇠 조건이 바뀜' },
    { name: 'Scale/Div', effect: '세로 한 칸의 dB 크기', defaultValue: '10 dB/div (Preset), 0.1–20 dB', pitfall: '1 dB/div로 줄이면 작은 레벨 변화가 보이지만 화면 범위가 10 dB로 좁아짐' },
    { name: 'Scale Type', effect: 'Log(dB) 또는 Lin(전압) 눈금', defaultValue: 'Log', pitfall: 'Lin에서는 Scale/Div가 적용되지 않음' },
    { name: 'Ref Level Offset', effect: '모든 표시 레벨에 같은 dB 더하기', defaultValue: '0 dB (Preset)', pitfall: 'Preset하면 0으로 돌아감. 프로그램이 매번 다시 설정해야 함' },
    { name: 'Y Axis Unit', effect: 'dBm, dBmV, dBµV, W, V 등 표시 단위', defaultValue: 'dBm', pitfall: '단위를 바꾸면 marker Y? 응답 단위도 바뀜. 파싱 코드가 dBm을 가정하면 틀린 값이 기록됨' },
  ],
  steps: [
    {
      id: 'center-span',
      title: 'Center/Span과 Start/Stop 비교',
      actions: [
        'SG: 1 GHz, −10 dBm CW, RF On (1·2번 항목과 같은 조건).',
        'SA: Center 1 GHz, Span 20 MHz로 둔 뒤 Start와 Stop 값을 읽습니다.',
      ],
      check: 'Start = 990 MHz, Stop = 1010 MHz. Start/Stop을 직접 넣어도 같은 화면이 됩니다.',
      record: { label: 'Start 주파수', unit: 'MHz', predict: true },
    },
    {
      id: 'ref-level-atten',
      title: 'Ref level이 감쇠를 바꾸는 것 보기',
      actions: [
        'Attenuation을 Auto로 둡니다. Ref level 0 dBm에서 감쇠 값을 읽습니다.',
        'Ref level을 +20 dBm으로 올리고 감쇠 값을 다시 읽습니다. noise floor 높이도 같이 봅니다.',
      ],
      check: 'Ref level을 올리면 감쇠가 늘어나고 noise floor가 올라갑니다. 신호 marker 레벨은 거의 그대로입니다.',
      record: { label: 'Ref level +20 dBm일 때 감쇠', unit: 'dB', predict: true },
    },
    {
      id: 'scale',
      title: 'Scale/Div로 작은 변화 보기',
      actions: [
        'Ref level을 신호 바로 위(예: 신호 +5 dB)로 맞추고 Scale/Div를 1 dB로 줄입니다.',
        'SG 레벨을 0.5 dB씩 두 번 바꿔 봅니다.',
      ],
      check: '10 dB/div에서는 거의 안 보이던 0.5 dB 변화가 반 칸씩 움직입니다.',
      record: { label: '0.5 dB 바꿀 때 trace가 움직인 칸 수', predict: true },
    },
    {
      id: 'offset',
      title: 'Ref level offset으로 감쇠기 앞 레벨 보기',
      actions: [
        'Scale을 10 dB/div로 되돌리고, Ref Level Offset을 1번 항목에서 기록한 감쇠기 값으로 넣습니다.',
        'Peak Search로 marker 레벨을 읽습니다.',
      ],
      check: 'marker가 SG 설정값(−10 dBm)에 가까워집니다. 남는 차이는 케이블 손실과 두 장비의 오차이며, 7번 항목에서 다룹니다.',
      record: { label: 'Offset 적용 후 marker 레벨', unit: 'dBm', predict: true },
    },
    {
      id: 'units',
      title: 'Y축 단위 바꿔 읽기',
      actions: ['Y Axis Unit을 W로 바꾸고 marker 값을 읽은 뒤 dBm으로 되돌립니다.'],
      check: '−10 dBm은 100 µW입니다. 로그 단위와 선형 단위가 같은 전력을 다르게 쓴 것입니다.',
      record: { label: 'W 단위 marker 값', predict: true },
    },
  ],
  scpi: [
    { command: '[:SENSe]:FREQuency:CENTer <freq>', instrument: 'SA', purpose: '중심 주파수', source: 'xsa-scpi' },
    { command: '[:SENSe]:FREQuency:SPAN <freq>', instrument: 'SA', purpose: '표시 폭 (0 Hz면 zero span)', source: 'xsa-scpi' },
    { command: '[:SENSe]:FREQuency:SPAN:FULL', instrument: 'SA', purpose: '장비 전체 범위로', source: 'xsa-scpi' },
    { command: '[:SENSe]:FREQuency:STARt <freq> / :STOP <freq>', instrument: 'SA', purpose: '시작 · 끝 주파수', source: 'xsa-scpi' },
    { command: ':DISPlay:WINDow[1]:TRACe:Y[:SCALe]:RLEVel <real>', instrument: 'SA', purpose: 'Reference level (Preset 0 dBm)', source: 'xsa-scpi' },
    { command: ':DISPlay:WINDow[1]:TRACe:Y[:SCALe]:PDIVision <rel_ampl>', instrument: 'SA', purpose: 'Scale/Div (Preset 10 dB)', source: 'xsa-scpi' },
    { command: ':DISPlay:WINDow[1]:TRACe:Y[:SCALe]:SPACing LINear|LOGarithmic', instrument: 'SA', purpose: '세로 눈금 종류', source: 'xsa-scpi' },
    { command: ':DISPlay:WINDow[1]:TRACe:Y[:SCALe]:RLEVel:OFFSet <rel_ampl>', instrument: 'SA', purpose: 'Ref level offset (Preset 0)', source: 'xsa-scpi' },
    { command: ':UNIT:POWer DBM|DBMV|DBUV|W|V|...', instrument: 'SA', purpose: 'Y축 단위', source: 'xsa-scpi' },
    { command: '[:SENSe]:POWer[:RF]:ATTenuation? / :AUTO ON|OFF', instrument: 'SA', purpose: '입력 감쇠 읽기 · Auto 결합', source: 'xsa-scpi' },
  ],
  testProgram: [
    '측정 시퀀스는 Preset 뒤에 center, span, ref level, offset을 매번 명시적으로 보냅니다. 이전 테스트가 남긴 화면 설정에 의존하지 않기 위해서입니다.',
    'Ref level은 예상 최대 신호보다 몇 dB 위로 두되 너무 높이지 않습니다. 너무 높으면 Auto 감쇠가 늘어 noise floor가 올라가고, spurious나 ACLR처럼 작은 신호를 재는 항목의 마진이 줄어듭니다.',
    'Ref level offset이나 External Gain으로 경로 손실을 넣었다면, 그 값을 측정 데이터에 같이 기록합니다. 나중에 원시값을 다시 계산할 수 있어야 합니다.',
    'marker Y? 응답 단위는 현재 Y Axis Unit을 따릅니다. 시퀀스 시작에서 :UNIT:POWer DBM을 보내 파싱 가정과 맞춥니다.',
  ],
  script: 'bench/labs/lab03_sa_axes.py',
}
