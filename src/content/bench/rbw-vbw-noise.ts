import type { BenchItem } from './types'

export const RBW_VBW_NOISE: BenchItem = {
  id: 'rbw-vbw-noise',
  number: 4,
  title: 'RBW · VBW · noise floor · sweep time',
  summary: 'RBW를 좁히면 noise floor가 내려가지만 측정 시간이 늘어납니다. 테스트 프로그램의 속도와 정확도가 갈리는 가장 기본적인 설정입니다.',
  principle: [
    'RBW(resolution bandwidth)는 IF 필터의 폭입니다. SA는 매 순간 이 폭 안에 들어온 전력을 봅니다. CW 신호는 폭이 거의 0이라 RBW를 바꿔도 레벨이 같지만, 잡음은 넓게 퍼져 있어서 RBW 폭만큼의 잡음 전력이 보입니다. 그래서 RBW를 10배 좁히면 잡음 표시가 약 10 dB 내려갑니다(10·log10 비율).',
    '좁은 필터는 반응이 느립니다. 필터가 자리를 잡을 시간을 주려면 sweep 속도를 늦춰야 해서, swept 방식에서 sweep time은 대략 span ÷ RBW²에 비례해 늘어납니다. RBW를 10배 좁히면 sweep time이 최대 100배 길어질 수 있습니다.',
    'VBW(video bandwidth)는 detector 뒤의 평활 필터입니다. VBW를 좁히면 잡음 trace가 매끈해져 읽기 쉬워지지만, 평균 잡음 레벨을 낮추지는 않습니다. VBW도 좁히면 sweep time이 늘어납니다.',
    'Auto 상태에서 RBW는 span에 묶여 있습니다(Span:RBW 비율 Preset 106). VBW는 RBW에 묶여 있습니다(VBW:RBW 비율 Preset 1). Auto를 쓰면 span만 바꿔도 RBW, VBW, sweep time이 함께 바뀝니다.',
  ],
  settings: [
    { name: 'Res BW (RBW)', effect: '두 신호를 구분하는 능력, 표시 잡음 레벨, sweep time', defaultValue: 'Auto (span에 결합)', pitfall: '수동으로 고정한 뒤 span을 크게 넓히면 sweep time이 매우 길어짐' },
    { name: 'Span:3 dB RBW', effect: 'Auto일 때 RBW = span ÷ 이 비율', defaultValue: '106 (Preset), 2–10000', pitfall: '비율을 키우면 RBW가 좁아져 느려짐' },
    { name: 'Video BW (VBW)', effect: '잡음 trace 평활', defaultValue: 'Auto (RBW에 결합)', pitfall: 'Average detector(swept)에서는 VBW 필터가 실제로 적용되지 않음. 그래도 sweep time 계산에는 영향' },
    { name: 'VBW:3 dB RBW', effect: 'Auto일 때 VBW = RBW × 이 비율', defaultValue: '1 (Preset)', pitfall: '비율을 0.1로 줄이면 매끈해지지만 sweep time이 늘어남' },
    { name: 'Sweep Time', effect: '한 번 훑는 시간', defaultValue: 'Auto', pitfall: 'Auto보다 짧게 고정하면 필터가 자리를 못 잡아 레벨이 낮게 읽힘(Meas Uncal 표시)' },
  ],
  steps: [
    {
      id: 'auto-rbw',
      title: 'Span에 따라 RBW가 바뀌는 것 보기',
      actions: [
        'SG: 1 GHz, −10 dBm CW, RF On. SA: Center 1 GHz, BW 모두 Auto.',
        'Span을 10 MHz, 1 MHz, 100 kHz로 바꾸며 화면 아래의 RBW 값을 읽습니다.',
      ],
      check: 'RBW는 대략 span ÷ 106에 가까운, 장비가 지원하는 값으로 정해집니다.',
      record: { label: 'Span 1 MHz일 때 RBW', unit: 'kHz', predict: true },
    },
    {
      id: 'noise-vs-rbw',
      title: 'RBW를 좁히며 noise floor 읽기',
      actions: [
        'Span 1 MHz에서 RBW를 수동 100 kHz로 두고, marker를 신호에서 300 kHz 떨어진 곳에 놓아 noise 레벨을 읽습니다.',
        'RBW를 10 kHz, 1 kHz로 바꾸며 같은 위치를 읽습니다. 신호 peak 레벨도 같이 봅니다.',
      ],
      check: 'RBW를 10배 좁힐 때마다 noise가 약 10 dB 내려가고, 신호 peak는 그대로입니다.',
      record: { label: 'RBW 100 kHz → 10 kHz일 때 noise 변화', unit: 'dB', predict: true },
    },
    {
      id: 'sweep-time',
      title: 'Sweep time 비용 보기',
      actions: ['위 세 RBW에서 화면 아래의 sweep time을 읽습니다.'],
      check: 'RBW를 좁힐수록 sweep time이 크게 늘어납니다. 측정 시간과 noise floor 사이의 거래입니다.',
      record: { label: 'RBW 1 kHz일 때 sweep time', unit: 'ms', predict: true },
    },
    {
      id: 'vbw',
      title: 'VBW로 trace 평활',
      actions: ['RBW 10 kHz에서 VBW를 Auto(10 kHz) → 100 Hz로 줄입니다.'],
      check: '잡음 trace가 얇아지지만 평균 높이는 거의 그대로입니다. sweep time은 늘어납니다.',
      record: { label: 'VBW 100 Hz일 때 sweep time', unit: 'ms', predict: true },
    },
    {
      id: 'too-fast',
      title: 'Sweep time을 억지로 줄이면',
      actions: ['RBW 1 kHz에서 Sweep Time을 Auto 값의 1/10로 수동 설정하고 신호 peak 레벨을 읽습니다.'],
      check: '레벨이 낮게 읽히고 화면에 경고(Meas Uncal)가 뜹니다. Auto로 되돌리면 정상 값으로 돌아옵니다.',
      record: { label: '너무 빠른 sweep에서 peak 레벨', unit: 'dBm', predict: true },
    },
  ],
  scpi: [
    { command: '[:SENSe]:BANDwidth[:RESolution] <freq>', instrument: 'SA', purpose: 'RBW 설정', source: 'xsa-scpi' },
    { command: '[:SENSe]:BANDwidth[:RESolution]:AUTO ON|OFF', instrument: 'SA', purpose: 'RBW Auto 결합', source: 'xsa-scpi' },
    { command: '[:SENSe]:FREQuency:SPAN:BANDwidth[:RESolution]:RATio <integer>', instrument: 'SA', purpose: 'Span:RBW 비율 (Preset 106)', source: 'xsa-scpi' },
    { command: '[:SENSe]:BANDwidth:VIDeo <freq> / :AUTO ON|OFF', instrument: 'SA', purpose: 'VBW 설정 · Auto 결합', source: 'xsa-scpi' },
    { command: '[:SENSe]:BANDwidth:VIDeo:RATio <real>', instrument: 'SA', purpose: 'VBW:RBW 비율 (Preset 1)', source: 'xsa-scpi' },
    { command: '[:SENSe]:SWEep:TIME <time> / :AUTO ON|OFF', instrument: 'SA', purpose: 'Sweep time 고정 · Auto', source: 'xsa-scpi' },
    { command: '[:SENSe]:SWEep:TIME?', instrument: 'SA', purpose: '현재 sweep time 읽기', source: 'xsa-scpi' },
    { command: ':CALCulate:MARKer1:X <freq>', instrument: 'SA', purpose: 'marker를 지정 주파수로 (noise 읽기 위치)', source: 'xsa-scpi' },
  ],
  testProgram: [
    'RBW는 측정 항목의 규격이 정하는 경우가 많습니다(예: spurious 측정 RBW). 규격이 없으면, 필요한 noise floor 마진을 먼저 정하고 그걸 만족하는 가장 넓은 RBW를 고릅니다. 시간이 가장 적게 듭니다.',
    'Auto 결합을 믿고 span만 바꾸면 RBW, VBW, sweep time이 같이 바뀌어 측정 조건이 몰래 달라집니다. 판정에 쓰는 측정은 RBW와 VBW를 명시적으로 고정하고 데이터에 기록합니다.',
    'Sweep time을 줄여 test time을 아끼려면 Auto 값보다 짧게 두지 말고, span이나 RBW를 조정합니다. 장비가 Uncal 상태인지 확인하는 단계를 둘 수도 있습니다.',
    '이 항목은 로드맵의 "측정 속도와 정확도" 주제를 실습으로 다룹니다. 이 항목의 스크립트는 RBW별로 sweep 한 번이 실제로 걸린 시간(PC에서 잰 값)을 함께 출력합니다.',
  ],
  script: 'bench/labs/lab04_rbw_vbw_noise.py',
}
