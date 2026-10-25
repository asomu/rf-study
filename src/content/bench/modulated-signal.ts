import type { BenchItem } from './types'

export const MODULATED_SIGNAL: BenchItem = {
  id: 'modulated-signal',
  number: 12,
  title: '변조 신호: channel power · ACP',
  summary: '대역폭이 있는 신호의 전력은 한 점의 marker로 읽을 수 없습니다. 주파수 구간에 걸쳐 전력을 더하는 channel power와, 옆 채널로 새는 전력을 보는 ACP를 익힙니다.',
  principle: [
    'CW는 전력이 한 주파수에 모여 있어서 marker 하나로 충분합니다. 변조 신호는 전력이 대역폭에 퍼져 있어서, 어느 한 점의 값은 RBW에 들어온 일부일 뿐입니다. Channel power는 정한 대역(integration bandwidth) 안의 전력 밀도를 모두 더해 총 전력을 구합니다.',
    'ACP(Adjacent Channel Power, LTE/NR에서는 ACLR)는 주 채널 전력 대비 옆 채널에 들어간 전력입니다. PA가 비선형이면 변조 신호의 스펙트럼이 옆으로 퍼지며(spectral regrowth), ACP가 나빠집니다. PA 테스트의 핵심 항목입니다.',
    'AM 변조는 계산으로 예측하기 좋습니다. 변조 깊이 m인 AM의 각 측대파는 반송파 대비 20·log10(m/2) dB입니다. 30% AM이면 약 −16.5 dBc입니다.',
    'MXG의 AM은 옵션 UNT, ARB(LTE 같은 디지털 변조 파형 재생)는 옵션 656/657이 필요합니다. 옵션이 없어도 CW로 channel power와 ACP 측정의 동작 방식을 익힐 수 있습니다.',
  ],
  settings: [
    { name: 'Integration BW', effect: 'channel power를 더하는 대역 폭', defaultValue: '측정 기본값', pitfall: '신호 대역폭보다 좁게 두면 전력이 낮게 나옴' },
    { name: 'Carrier BW / Offset 목록 (ACP)', effect: '주 채널 폭, 옆 채널 위치와 폭', defaultValue: '측정 기본값 또는 표준 프리셋', pitfall: '규격의 채널 정의(폭, 간격, 필터)와 다르면 다른 값이 나옴' },
    { name: 'Detector / 평균 (측정 내부)', effect: '전력 계산 방식', defaultValue: '측정이 RMS로 설정', pitfall: 'Swept SA에서 marker로 대신 재면 detector에 따라 수 dB 차이' },
    { name: 'SG AM depth / rate (옵션 UNT)', effect: '측대파 크기와 위치', defaultValue: 'AM OFF (*RST)', pitfall: 'AM만 켜고 Mod On이 아니면 변조가 적용되지 않음' },
    { name: 'SG ARB (옵션 656/657)', effect: '저장된 디지털 변조 파형 재생', defaultValue: 'OFF', pitfall: '파형 파일과 샘플 레이트, RMS/peak 레벨 정의를 알아야 출력 레벨이 의미 있음' },
  ],
  steps: [
    {
      id: 'cw-channel-power',
      title: 'CW의 channel power',
      actions: [
        'SG: 1 GHz, −10 dBm CW. SA: Meas → Channel Power, Center 1 GHz, Integration BW 1 MHz.',
        '결과와 Swept SA marker로 읽은 CW 레벨을 비교합니다.',
      ],
      check: 'CW는 전력이 한 점에 있어서 channel power와 marker 값이 거의 같습니다.',
      record: { label: 'Channel power', unit: 'dBm', predict: true },
    },
    {
      id: 'am-sidebands',
      title: 'AM 측대파 예측 (옵션 UNT가 있을 때)',
      actions: [
        'SG: AM On, depth 30%, rate 10 kHz, Mod On. SA: Swept SA, Span 50 kHz, RBW 300 Hz.',
        '반송파 대비 ±10 kHz 측대파를 delta marker로 읽습니다.',
      ],
      check: '각 측대파가 약 −16.5 dBc입니다. 옵션이 없으면 건너뜁니다.',
      record: { label: '측대파 레벨', unit: 'dBc', predict: true },
    },
    {
      id: 'am-channel-power',
      title: 'AM 신호의 channel power',
      actions: ['AM을 켠 채로 Channel Power(Integration BW 1 MHz)를 다시 잽니다.'],
      check: '측대파 전력이 더해져 CW 때보다 약간 높아집니다(30% AM이면 약 +0.2 dB). 대역 안의 모든 전력을 더하기 때문입니다.',
      record: { label: 'AM channel power − CW channel power', unit: 'dB', predict: true },
    },
    {
      id: 'acp-cw',
      title: 'ACP 측정의 구조 보기',
      actions: [
        'AM을 끄고 Meas → ACP. Carrier BW 1 MHz, offset 2 MHz, offset BW 1 MHz로 둡니다.',
        '옆 채널 결과(dBc)를 읽습니다.',
      ],
      check: 'CW에는 옆으로 퍼지는 성분이 없어서 옆 채널 값은 사실상 SA noise floor입니다. 이것이 이 설정에서 잴 수 있는 ACP의 한계(dynamic range)입니다.',
      record: { label: '옆 채널 ACP', unit: 'dBc', predict: true },
    },
    {
      id: 'arb-optional',
      title: '디지털 변조 파형 (옵션 656/657이 있을 때)',
      actions: [
        'SG에 저장된 LTE 등 ARB 파형이 있으면 선택하고 ARB On, Mod On.',
        '파형 대역폭에 맞춰 Channel Power와 ACP를 다시 잽니다.',
      ],
      check: '변조 신호는 marker 값과 channel power가 크게 다릅니다. 옆 채널은 CW 때보다 높아질 수 있습니다(SG 자체의 spectral regrowth).',
      record: { label: '변조 신호 channel power − 같은 위치 marker 값', unit: 'dB', predict: true },
    },
  ],
  scpi: [
    { command: ':CONFigure:CHPower', instrument: 'SA', purpose: 'Channel Power 측정 선택', source: 'xsa-scpi' },
    { command: '[:SENSe]:CHPower:BANDwidth:INTegration <bandwidth>', instrument: 'SA', purpose: 'Integration BW', source: 'xsa-scpi' },
    { command: ':FETCh:CHPower:CHPower?', instrument: 'SA', purpose: 'Channel power 결과', source: 'xsa-scpi' },
    { command: ':CONFigure:ACPower', instrument: 'SA', purpose: 'ACP 측정 선택', source: 'xsa-scpi' },
    { command: '[:SENSe]:ACPower:CARRier[1]:LIST:BANDwidth[:INTegration] <freq>', instrument: 'SA', purpose: '주 채널 폭', source: 'xsa-scpi' },
    { command: '[:SENSe]:ACPower:OFFSet[1][:OUTer]:LIST[:FREQuency] <freq>,...', instrument: 'SA', purpose: '옆 채널 offset 목록', source: 'xsa-scpi' },
    { command: ':FETCh:ACPower?', instrument: 'SA', purpose: 'ACP 결과 (측정 결과 배열)', source: 'xsa-scpi' },
    { command: ':CONFigure:SANalyzer', instrument: 'SA', purpose: 'Swept SA로 돌아가기', source: 'xsa-scpi' },
    { command: '[:SOURce]:AM[1]:STATe ON|OFF', instrument: 'SG', purpose: 'AM 켜기 (옵션 UNT, *RST 0)', source: 'mxg-scpi' },
    { command: '[:SOURce]:AM[1][:DEPTh][:LINear] <value>', instrument: 'SG', purpose: 'AM 깊이 (%)', source: 'mxg-scpi' },
    { command: '[:SOURce]:AM[1]:INTernal:FUNCtion[1]:FREQuency <value>', instrument: 'SG', purpose: 'AM rate', source: 'mxg-scpi' },
    { command: '[:SOURce]:RADio:ARB[:STATe] ON|OFF', instrument: 'SG', purpose: 'ARB 재생 (옵션 656/657)', source: 'mxg-scpi' },
    { command: '[:SOURce]:RADio:ARB:WAVeform "WFM1:<file>"', instrument: 'SG', purpose: 'ARB 파형 선택', source: 'mxg-scpi' },
  ],
  testProgram: [
    '변조 신호의 출력 전력은 channel power(또는 표준 측정 앱)로 잽니다. marker 값은 RBW와 detector에 따라 달라서 판정에 쓰지 않습니다.',
    'ACP/ACLR은 채널 폭, offset, 측정 필터를 규격대로 정확히 맞춰야 합니다. 설정을 코드 상수로 흩어 두지 말고 테스트 조건 파일 하나에 모아 버전 관리합니다(7번 트랙 "Limit과 스펙 관리").',
    'DUT의 ACP를 재기 전에, SG만 연결한 상태(DUT 없음)로 같은 측정을 해서 측정 체인 자체의 ACP 한계를 기록합니다. DUT limit보다 충분히 낮아야 합니다.',
    '측정 앱(Channel Power, ACP)과 Swept SA를 오갈 때는 :CONFigure로 측정을 명시적으로 바꾸고, 결과는 :FETCh 또는 :READ로 받습니다. 화면 marker를 읽는 방식보다 안정적입니다.',
  ],
  script: 'bench/labs/lab12_modulated_signal.py',
}
