import type { BenchItem } from './types'

export const POWER_ACCURACY: BenchItem = {
  id: 'power-accuracy',
  number: 7,
  title: '전력 정확도와 경로 손실',
  summary: 'SG 설정값과 SA 측정값의 차이를 주파수별로 재서 경로 손실 표를 만들고, 그 표를 SA에 보정값으로 넣어 "DUT 기준면"의 레벨을 읽는 방법을 익힙니다.',
  principle: [
    'SG에 −10 dBm을 설정해도 SA 입력에 도착하는 레벨은 케이블과 감쇠기 손실만큼 낮습니다. 손실은 주파수에 따라 다르며, 보통 주파수가 높을수록 커집니다.',
    'SG 설정값 − SA 측정값 = 경로 손실 + SG 레벨 오차 + SA 레벨 오차입니다. 이 방법으로 잰 손실에는 두 장비의 오차가 섞여 있습니다. 더 정확한 손실이 필요하면 파워센서(5번 트랙의 다른 항목)를 기준으로 씁니다.',
    '보정 방법은 세 가지입니다. Ref Level Offset은 모든 주파수에 같은 값을 더하고, External Gain은 외부 감쇠·이득을 입력해 표시값을 DUT 쪽 기준으로 바꾸며(10 dB 감쇠는 −10 dB로 입력), Amplitude Correction(CSET)은 주파수별 표를 적용합니다.',
    '보정값이 들어가면 화면 숫자가 "어디의 레벨"인지가 바뀝니다. 같은 숫자라도 SA 입력 기준인지, 감쇠기 앞 기준인지, DUT 출력 기준인지를 항상 알고 있어야 합니다. 이것을 기준면(reference plane)이라고 합니다.',
  ],
  settings: [
    { name: 'Ref Level Offset', effect: '모든 표시 레벨에 같은 dB 더하기', defaultValue: '0 dB (Preset)', pitfall: '주파수별 손실 차이를 반영하지 못함. Preset으로 사라짐' },
    { name: 'External Gain', effect: '외부 이득/손실을 입력해 표시값을 DUT 쪽 기준으로', defaultValue: '0 dB (Preset에 영향 없음, Restore Input/Output Defaults에서 초기화)', pitfall: '손실은 음수로 입력. Preset으로 안 지워져서 다음 테스트에 남아 있을 수 있음' },
    { name: 'Amplitude Correction (CSET)', effect: '주파수별 보정 표 적용', defaultValue: 'OFF', pitfall: '표 범위 밖 주파수에서는 보정이 의도와 다를 수 있음. 표를 바꾸면 버전을 기록' },
    { name: 'SG User Flatness', effect: 'SG 출력 쪽 주파수별 보정', defaultValue: 'OFF (*RST)', pitfall: 'SG와 SA 양쪽에 같은 손실을 이중으로 보정하기 쉬움' },
  ],
  steps: [
    {
      id: 'loss-table',
      title: '주파수별 경로 손실 재기',
      actions: [
        'SG −10 dBm CW. SA는 Span 1 MHz, RBW 10 kHz, Ref Level Offset 0, External Gain 0.',
        '100 MHz, 1 GHz, 2 GHz, 3 GHz에서 marker 레벨을 읽고 "−10 − 측정값"으로 손실을 계산해 적습니다.',
      ],
      check: '손실은 감쇠기 표기값 근처이고, 주파수가 올라갈수록 커지는 경향입니다.',
      record: { label: '3 GHz 경로 손실 (100 MHz와의 차이도 메모)', unit: 'dB', predict: true },
    },
    {
      id: 'offset-one',
      title: 'Ref Level Offset 하나로 보정',
      actions: ['1 GHz 손실 값을 Ref Level Offset에 넣고, 1 GHz와 3 GHz에서 marker 레벨을 읽습니다.'],
      check: '1 GHz에서는 −10 dBm에 가깝고, 3 GHz에서는 손실 차이만큼 어긋납니다. 값 하나로는 넓은 대역을 보정할 수 없습니다.',
      record: { label: 'Offset 적용 후 3 GHz marker 레벨', unit: 'dBm', predict: true },
    },
    {
      id: 'external-gain',
      title: 'External Gain으로 같은 보정',
      actions: ['Ref Level Offset을 0으로 되돌리고 External Gain에 1 GHz 손실을 음수로 넣습니다(예: −10.4 dB).'],
      check: '1 GHz marker가 Offset 때와 같은 값이 됩니다. Auto 감쇠가 External Gain에 맞춰 조정되는지도 확인합니다.',
      record: { label: 'External Gain 적용 후 1 GHz marker 레벨', unit: 'dBm', predict: true },
    },
    {
      id: 'cset',
      title: '주파수별 보정 표 적용',
      actions: [
        'External Gain을 0으로 되돌립니다. Input/Output → Corrections에서 Correction 1에 네 주파수의 손실 값을 입력하고 켭니다.',
        '네 주파수에서 marker 레벨을 다시 읽습니다.',
      ],
      check: '네 주파수 모두 −10 dBm 근처가 됩니다. 남는 차이는 두 장비 자체의 레벨 정확도입니다. 표의 부호 규칙은 화면에서 적용 결과로 확인합니다.',
      record: { label: '보정 후 4개 주파수 중 가장 큰 오차', unit: 'dB', predict: true },
    },
  ],
  scpi: [
    { command: ':DISPlay:WINDow[1]:TRACe:Y[:SCALe]:RLEVel:OFFSet <rel_ampl>', instrument: 'SA', purpose: 'Ref Level Offset', source: 'xsa-scpi' },
    { command: '[:SENSe]:CORRection:SA[:RF]:GAIN <rel_ampl>', instrument: 'SA', purpose: 'External Gain (10 dB 감쇠는 −10)', source: 'xsa-scpi' },
    { command: '[:SENSe]:CORRection:CSET[1]|2|...|8:DATA <freq>,<ampl>,...', instrument: 'SA', purpose: '주파수별 보정 표 입력', source: 'xsa-scpi' },
    { command: '[:SENSe]:CORRection:CSET[1]|2|...|8[:STATe] ON|OFF', instrument: 'SA', purpose: '보정 표 켜기', source: 'xsa-scpi' },
    { command: '[:SOURce]:CORRection:FLATness:PAIR <freq>,<corr>', instrument: 'SG', purpose: 'SG user flatness 보정 쌍 (최대 3201점)', source: 'mxg-scpi' },
    { command: '[:SOURce]:CORRection[:STATe] ON|OFF', instrument: 'SG', purpose: 'SG user flatness 켜기 (*RST 0)', source: 'mxg-scpi' },
    { command: '[:SOURce]:POWer[:LEVel][:IMMediate]:OFFSet <value>', instrument: 'SG', purpose: 'SG 표시 레벨 offset (*RST 0)', source: 'mxg-scpi' },
  ],
  testProgram: [
    '경로 손실(cal) 표는 측정 데이터와 같은 수준으로 관리합니다. 언제, 어떤 기준(파워센서 또는 SG/SA)으로, 어떤 주파수 점에서 쟀는지를 버전과 함께 저장하고, 측정 결과에 사용한 cal 버전을 기록합니다.',
    '보정은 한 곳에서만 합니다. SA offset, SA CSET, SG flatness, 프로그램 내부 계산 중 하나를 고르고 나머지는 0으로 확인합니다. 이중 보정은 결과가 그럴듯해 보여서 찾기 어렵습니다.',
    'External Gain은 Preset으로 지워지지 않습니다. 시퀀스 시작에서 명시적으로 설정하고 질의로 확인합니다.',
    'SG/SA 비교로 잰 손실에는 두 장비의 오차가 섞입니다. 절대 레벨 판정의 마진이 작다면 파워센서 기준 cal이 필요합니다(6번 트랙 "불확도와 guardband").',
  ],
  script: 'bench/labs/lab07_power_accuracy.py',
}
