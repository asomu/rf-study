import type { BenchItem } from './types'

export const PHASE_NOISE: BenchItem = {
  id: 'phase-noise',
  number: 9,
  title: 'Phase noise와 noise marker',
  summary: 'CW 신호 양옆으로 퍼진 잡음 치마(phase noise)를 SA의 noise marker로 dBc/Hz 단위로 재고, 이 측정이 SA 자신의 한계에 얼마나 영향을 받는지 이해합니다.',
  principle: [
    '실제 발진기의 위상은 조금씩 흔들립니다. 그 흔들림이 스펙트럼에서는 CW 양옆으로 퍼진 잡음으로 보입니다. Phase noise는 반송파에서 일정 주파수(offset) 떨어진 곳의 1 Hz 대역 잡음 전력을 반송파 대비로 나타낸 값이며, 단위는 dBc/Hz입니다.',
    'SA 화면의 잡음 레벨은 RBW 폭만큼의 전력입니다. Noise marker는 이것을 1 Hz 대역으로 환산하고(RBW 폭과 필터 모양 보정), detector와 로그 평균에 의한 잡음 오차도 보정해 dBm/Hz로 보여줍니다.',
    '그래서 Phase noise(dBc/Hz) ≈ noise marker(dBm/Hz) − 반송파 레벨(dBm)입니다. 예를 들어 반송파 −10 dBm, 100 kHz offset의 noise marker −130 dBm/Hz면 −120 dBc/Hz입니다.',
    'SA도 내부 LO의 phase noise가 있습니다. 측정값은 SG와 SA phase noise의 합이라서, SA가 SG보다 나쁘면 SA를 재는 셈이 됩니다. 반송파에서 멀어지면 SA noise floor가 한계가 됩니다.',
  ],
  settings: [
    { name: 'Marker Function: Noise', effect: 'marker 값을 dBm/Hz 잡음 밀도로 표시', defaultValue: 'OFF (Preset)', pitfall: 'marker가 CW peak 위에 있으면 의미 없는 값. offset 위치에 둬야 함' },
    { name: 'Marker Delta + Noise', effect: '반송파 대비 dBc/Hz를 바로 읽기', defaultValue: '—', pitfall: '기준 marker는 반송파 peak, delta marker가 noise 기능이어야 함' },
    { name: 'RBW', effect: 'offset보다 충분히 좁아야 반송파 자체가 섞이지 않음', defaultValue: 'Auto', pitfall: '1 kHz offset을 RBW 1 kHz로 재면 반송파 필터 치마가 섞임' },
    { name: 'Span', effect: '보려는 offset까지 화면에 들어오게', defaultValue: '—', pitfall: 'offset이 클수록 span이 넓어지고 Auto RBW도 넓어짐' },
  ],
  steps: [
    {
      id: 'carrier',
      title: '반송파 레벨',
      actions: ['SG: 1 GHz, −10 dBm CW. SA: Center 1 GHz, Span 300 kHz, Peak Search.'],
      record: { label: '반송파 레벨', unit: 'dBm' },
    },
    {
      id: 'noise-10k',
      title: '10 kHz offset phase noise',
      actions: [
        'Marker 2를 1.00001 GHz(+10 kHz)에 두고 Marker Function → Noise를 켭니다.',
        'RBW를 offset의 1/10 이하(예: 1 kHz 이하)로 둡니다. Trace Average 10회.',
        'noise marker 값에서 반송파 레벨을 빼서 dBc/Hz를 계산합니다.',
      ],
      check: 'offset이 작을수록 phase noise는 큽니다(덜 음수). 값이 RBW를 바꿀 때 크게 변하면 RBW가 너무 넓은 것입니다.',
      record: { label: '10 kHz offset', unit: 'dBc/Hz', predict: true },
    },
    {
      id: 'noise-100k',
      title: '100 kHz offset',
      actions: ['Span을 넓히고 marker 2를 +100 kHz에 둬 같은 방법으로 잽니다.'],
      record: { label: '100 kHz offset', unit: 'dBc/Hz', predict: true },
    },
    {
      id: 'noise-1m',
      title: '1 MHz offset과 SA 한계',
      actions: [
        '+1 MHz에서 잽니다.',
        'SG RF Off 후 같은 위치의 noise marker를 읽어 SA 자체 noise floor와 비교합니다.',
      ],
      check: 'RF Off 값과 몇 dB 차이밖에 안 나면 그 offset의 측정은 SA noise floor에 막힌 것입니다.',
      record: { label: '1 MHz offset (RF Off 값과의 차이도 메모)', unit: 'dBc/Hz', predict: true },
    },
  ],
  scpi: [
    { command: ':CALCulate:MARKer2:MODE POSition', instrument: 'SA', purpose: 'marker 2 켜기', source: 'xsa-scpi' },
    { command: ':CALCulate:MARKer2:X <freq>', instrument: 'SA', purpose: 'offset 위치 지정', source: 'xsa-scpi' },
    { command: ':CALCulate:MARKer2:FUNCtion NOISe|BPOWer|BDENsity|OFF', instrument: 'SA', purpose: 'Noise marker 기능 (Preset OFF)', source: 'xsa-scpi' },
    { command: ':CALCulate:MARKer2:Y?', instrument: 'SA', purpose: 'Noise marker 결과 (dBm/Hz)', source: 'xsa-scpi' },
    { command: '[:SENSe]:BANDwidth[:RESolution] <freq>', instrument: 'SA', purpose: 'offset보다 좁은 RBW', source: 'xsa-scpi' },
    { command: ':TRACe[1]:TYPE AVERage / [:SENSe]:AVERage:COUNt <n>', instrument: 'SA', purpose: '잡음 평균', source: 'xsa-scpi' },
  ],
  testProgram: [
    'Phase noise는 대개 몇 개 offset의 dBc/Hz로 판정합니다. offset마다 RBW, span, 평균 횟수를 고정하고 기록합니다. Auto에 맡기면 offset을 바꿀 때 조건이 달라집니다.',
    '측정 체인(SA)의 phase noise와 noise floor가 판정 limit보다 충분히 낮은지 먼저 확인합니다. 그렇지 않으면 DUT가 아니라 장비가 fail을 만듭니다.',
    'Noise marker는 장비 내부 보정이 들어간 값이라 marker 일반 값과 다릅니다. 어떤 값을 썼는지 데이터에 남깁니다.',
    '정밀한 phase noise 측정은 전용 측정 앱(옵션)이나 phase noise 분석기를 씁니다. 이 항목은 SA로 빠르게 확인하는 방법과 그 한계를 다룹니다.',
  ],
  script: 'bench/labs/lab09_phase_noise.py',
}
