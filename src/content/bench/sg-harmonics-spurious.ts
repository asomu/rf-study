import type { BenchItem } from './types'

export const SG_HARMONICS_SPURIOUS: BenchItem = {
  id: 'sg-harmonics-spurious',
  number: 8,
  title: 'SG의 harmonic과 spurious 측정',
  summary: 'SG의 CW에도 기본파의 정수배(harmonic)와 그 밖의 원치 않는 성분(spurious)이 섞여 있습니다. 이 성분을 dBc로 재고, SA 자체가 만든 성분과 구분합니다.',
  principle: [
    '실제 신호원은 완벽한 사인파가 아니라서 2f, 3f 같은 harmonic이 나옵니다. 크기는 기본파 대비 dBc(dB relative to carrier)로 표시합니다. 예를 들어 기본파 −10 dBm, 2차 harmonic −45 dBm이면 −35 dBc입니다.',
    'Spurious는 harmonic이 아닌 원치 않는 성분입니다. 내부 클럭, 기준 신호, 혼합 과정에서 생깁니다. 보통 harmonic보다 훨씬 작아서, 넓은 span과 낮은 noise floor가 필요합니다.',
    'SA도 큰 신호를 받으면 자체 harmonic을 만듭니다(5번 항목). 측정한 harmonic이 SG 것인지는 SA 감쇠를 바꿔서 레벨이 변하지 않는지로 확인합니다.',
    'X-Series에는 Harmonics 측정 기능이 있어 기본파와 N차 harmonic까지 자동으로 찾아 dBc로 보여줍니다. 수동 marker 측정과 결과가 같은지 비교해 보면 기능이 무엇을 하는지 이해할 수 있습니다.',
  ],
  settings: [
    { name: 'Center / Span (harmonic별)', effect: '각 harmonic 주파수 주변만 좁게 보기', defaultValue: '—', pitfall: '넓은 span 한 화면에서 재면 RBW가 넓어져 작은 harmonic이 noise에 묻힘' },
    { name: 'Marker Delta', effect: '기본파 대비 dBc를 바로 읽기', defaultValue: '—', pitfall: '기준 marker를 기본파에 두지 않으면 dBc가 아님' },
    { name: 'Harmonics 측정 Number', effect: '자동 측정할 harmonic 차수', defaultValue: '측정 기본값', pitfall: 'SA 주파수 범위를 넘는 차수는 측정되지 않음' },
    { name: 'Attenuation', effect: 'SA 자체 harmonic 크기', defaultValue: 'Auto', pitfall: '감쇠를 너무 낮추면 SA가 만든 harmonic이 SG 것처럼 보임' },
  ],
  steps: [
    {
      id: 'fundamental',
      title: '기본파 레벨 기록',
      actions: ['SG: 1 GHz, 0 dBm(연습 상한) CW. SA: Center 1 GHz, Span 1 MHz, RBW 10 kHz, 감쇠 Auto. Peak Search.'],
      record: { label: '기본파 레벨', unit: 'dBm' },
    },
    {
      id: 'second-harmonic',
      title: '2차 harmonic을 dBc로',
      actions: [
        'Center를 2 GHz로 옮기고 Peak Search. 레벨을 읽어 기본파와의 차이를 계산합니다.',
        'SA 감쇠를 10 dB 올렸다 내려 레벨이 변하지 않는지 확인합니다.',
      ],
      check: '감쇠를 바꿔도 레벨이 그대로면 SG의 harmonic입니다. 변하면 감쇠를 올린 값으로 다시 잽니다.',
      record: { label: '2차 harmonic', unit: 'dBc', predict: true },
    },
    {
      id: 'third-harmonic',
      title: '3차 harmonic',
      actions: ['Center 3 GHz에서 같은 방법으로 잽니다.'],
      record: { label: '3차 harmonic', unit: 'dBc', predict: true },
    },
    {
      id: 'auto-harmonics',
      title: 'Harmonics 측정 기능과 비교',
      actions: [
        'Meas → Harmonics를 선택하고 기본파 1 GHz, harmonic 3차까지 설정합니다.',
        '결과 표의 2·3차 dBc를 수동 측정값과 비교합니다. 끝나면 Swept SA 측정으로 돌아갑니다.',
      ],
      check: '수동값과 1–2 dB 안쪽으로 비슷해야 합니다. 크게 다르면 RBW, 감쇠 설정 차이를 확인합니다.',
      record: { label: '자동 측정 2차 harmonic', unit: 'dBc', predict: true },
    },
    {
      id: 'spurious-scan',
      title: '넓은 범위 spurious 훑기',
      actions: [
        'Swept SA로 돌아와 Start 10 MHz, Stop 3.5 GHz, Detector Peak, Trace Max Hold로 몇 번 sweep합니다.',
        'Peak Search 후 Next Peak로 기본파와 harmonic이 아닌 성분이 있는지 찾습니다.',
      ],
      check: '이 넓은 span에서는 RBW가 넓어 noise floor가 높습니다. 의심 성분이 있으면 그 주변으로 span을 좁혀 다시 잽니다.',
      record: { label: '찾은 비harmonic 성분 (주파수, dBc 또는 "없음")' },
    },
  ],
  scpi: [
    { command: ':CALCulate:MARKer1:MAXimum / :MAXimum:NEXT', instrument: 'SA', purpose: 'Peak Search · 다음 peak', source: 'xsa-scpi' },
    { command: ':CALCulate:MARKer1:MODE DELTa', instrument: 'SA', purpose: '기준 대비 차이 읽기', source: 'xsa-scpi' },
    { command: ':TRACe[1]:TYPE MAXHold', instrument: 'SA', purpose: 'Max Hold', source: 'xsa-scpi' },
    { command: '[:SENSe]:DETector:TRACe[1] POSitive', instrument: 'SA', purpose: 'Peak detector', source: 'xsa-scpi' },
    { command: ':CONFigure:HARMonics', instrument: 'SA', purpose: 'Harmonics 측정 선택', source: 'xsa-scpi' },
    { command: '[:SENSe]:HARMonics:NUMBer <integer>', instrument: 'SA', purpose: '측정할 harmonic 차수', source: 'xsa-scpi' },
    { command: ':FETCh:HARMonics:AMPLitude:ALL?', instrument: 'SA', purpose: 'harmonic 레벨 결과 읽기', source: 'xsa-scpi' },
    { command: ':FETCh:HARMonics:FREQuency:ALL?', instrument: 'SA', purpose: 'harmonic 주파수 결과 읽기', source: 'xsa-scpi' },
    { command: '[:SENSe]:HARMonics:FREQuency:FUNDamental <freq> / :AUTO ON|OFF', instrument: 'SA', purpose: '기본파 주파수 지정 또는 자동 찾기', source: 'xsa-scpi' },
    { command: ':CONFigure:SANalyzer', instrument: 'SA', purpose: 'Swept SA 측정으로 돌아가기', source: 'xsa-scpi' },
  ],
  testProgram: [
    'Harmonic 판정 limit은 대부분 dBc 또는 절대 dBm입니다. 어느 쪽인지에 따라 기본파 측정과 경로 손실 보정(7번 항목)이 필요한지가 달라집니다. 주파수가 다르면 경로 손실도 다르므로 harmonic 주파수의 cal 값을 써야 합니다.',
    'SA 자체 왜곡이 결과에 섞이지 않는지는 개발 단계에서 감쇠를 바꿔 확인하고, 그 결과로 정한 감쇠를 고정합니다.',
    '내장 Harmonics 측정은 시퀀스를 짧게 만들지만, 내부 RBW와 sweep 설정을 이해하고 수동 측정과 한 번 비교한 뒤에 씁니다.',
    'Spurious 검색은 넓은 범위를 여러 구간으로 나누고 구간마다 RBW와 limit을 다르게 두는 경우가 많습니다. 시간과 noise floor의 균형(4번 항목)이 그대로 적용됩니다.',
  ],
  script: 'bench/labs/lab08_sg_harmonics.py',
}
