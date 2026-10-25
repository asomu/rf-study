import type { BenchItem } from './types'

export const ATTENUATION_OVERLOAD: BenchItem = {
  id: 'attenuation-overload',
  number: 5,
  title: '감쇠기 · preamp · 과입력',
  summary: 'SA 입력 감쇠는 noise floor와 SA 자체 왜곡 사이의 균형입니다. 화면에 보이는 왜곡이 DUT 것인지 SA 것인지 가려내는 방법을 익힙니다.',
  principle: [
    '입력 신호는 감쇠기를 지나 mixer로 갑니다. mixer에 들어가는 레벨은 "입력 − 감쇠"입니다. mixer에 너무 큰 신호가 들어가면 SA 자체가 harmonic과 intermod를 만들고, 더 커지면 레벨이 눌립니다(compression).',
    '감쇠를 늘리면 mixer는 편해지지만, SA는 감쇠만큼 이득을 다시 올려 표시하므로 내부 잡음도 같이 올라갑니다. 그래서 감쇠를 10 dB 늘리면 신호 레벨 표시는 그대로이고 noise floor가 약 10 dB 올라갑니다.',
    '판별법: 감쇠를 10 dB 바꿨을 때 어떤 성분의 표시 레벨이 따라 변하면 SA 내부에서 생긴 것이고, 그대로면 입력 신호에 원래 있던 것입니다. 2차 harmonic은 mixer 레벨 1 dB당 2 dB씩 변합니다.',
    'Preamp는 mixer 앞에서 신호를 키워 noise floor를 낮춥니다. 대신 작은 입력에서도 포화되기 쉬워집니다. Auto 감쇠는 Max Mixer Level(Preset −10 dBm)을 넘지 않도록 감쇠를 고릅니다.',
  ],
  settings: [
    { name: 'Attenuation', effect: 'mixer 입력 레벨, noise floor', defaultValue: 'Auto (ref level과 Max Mixer Level에 결합). MXA는 2 dB 단계', pitfall: '0 dB로 두면 noise는 좋지만 큰 신호에서 SA 자체 왜곡이 생김. 커넥터 보호 측면에서도 위험' },
    { name: 'Max Mixer Level', effect: 'Auto 감쇠가 허용하는 최대 mixer 레벨', defaultValue: '−10 dBm (Preset), −50 ~ −10 dBm', pitfall: '낮추면 왜곡은 줄지만 감쇠가 늘어 noise floor가 올라감' },
    { name: 'Internal Preamp', effect: 'noise floor를 낮춤', defaultValue: 'OFF (Preset), Band LOW', pitfall: '옵션이 없으면 메뉴가 안 보임. 큰 신호에서 켜면 바로 포화' },
    { name: 'Input Overload 보고', effect: 'ADC/IF 과입력을 SCPI 에러 큐에 넣을지', defaultValue: 'OFF: 상태 비트로만 알림', pitfall: '기본값에서는 :SYSTem:ERRor?로 과입력을 알 수 없음' },
  ],
  steps: [
    {
      id: 'atten-noise',
      title: '감쇠를 바꾸며 noise와 신호 보기',
      actions: [
        'SG: 1 GHz, −10 dBm CW. SA: Center 1 GHz, Span 1 MHz, RBW 10 kHz 고정.',
        '감쇠를 10, 20, 30 dB로 수동 설정하며 신호 peak와 신호에서 300 kHz 떨어진 noise를 읽습니다.',
      ],
      check: '신호 레벨은 거의 그대로이고 noise floor만 감쇠 10 dB당 약 10 dB씩 올라갑니다.',
      record: { label: '감쇠 10 → 30 dB일 때 noise 변화', unit: 'dB', predict: true },
    },
    {
      id: 'who-made-harmonic',
      title: 'Harmonic이 누구 것인지 가리기',
      actions: [
        'SG를 연습 상한(0 dBm 이하)까지 올립니다. SA Center를 2 GHz(2차 harmonic)로 옮기고 Span 1 MHz.',
        '감쇠를 0 dB(가능하면)와 10 dB, 20 dB로 바꾸며 2 GHz 성분 레벨을 읽습니다.',
      ],
      check: '감쇠에 따라 레벨이 변하면 SA가 만든 harmonic, 그대로면 SG가 만든 harmonic입니다. 8번 항목의 harmonic 측정 전에 이 점검을 먼저 합니다.',
      record: { label: '감쇠 0 → 10 dB일 때 2 GHz 성분 변화', unit: 'dB', predict: true },
    },
    {
      id: 'preamp',
      title: 'Preamp로 noise floor 낮추기 (옵션이 있을 때)',
      actions: [
        'SG RF Off. SA Center 1 GHz, 감쇠 0 dB, RBW 10 kHz에서 noise를 읽습니다.',
        'Internal Preamp On 후 다시 읽습니다. 메뉴가 없으면 옵션이 없는 것이므로 건너뜁니다.',
      ],
      check: 'Preamp를 켜면 noise floor가 크게 내려갑니다. 신호를 다시 켜기 전에 Preamp를 끕니다.',
      record: { label: 'Preamp On일 때 noise 변화', unit: 'dB', predict: true },
    },
    {
      id: 'overload-report',
      title: '과입력이 에러 큐에 안 잡히는 것 확인',
      actions: [
        ':SYSTem:ERRor:OVERload?로 현재 설정을 질의합니다.',
        '화면에 과입력 경고가 뜨는 조건(작은 ref level, 감쇠 0 dB, 큰 신호)을 잠시 만들고 :SYSTem:ERRor?를 읽은 뒤, 즉시 감쇠를 되돌립니다.',
      ],
      check: '기본 설정에서는 화면에 경고가 떠도 에러 큐에는 아무것도 없을 수 있습니다. :SYSTem:ERRor:OVERload ON 후 같은 조건에서 다시 확인합니다.',
      record: { label: 'OVERload OFF일 때 에러 큐 내용' },
    },
  ],
  scpi: [
    { command: '[:SENSe]:POWer[:RF]:ATTenuation <rel_ampl>', instrument: 'SA', purpose: '입력 감쇠 수동 설정 (Auto는 꺼짐)', source: 'xsa-scpi' },
    { command: '[:SENSe]:POWer[:RF]:ATTenuation:AUTO ON|OFF', instrument: 'SA', purpose: '감쇠 Auto 결합', source: 'xsa-scpi' },
    { command: '[:SENSe]:POWer[:RF]:MIXer:RANGe[:UPPer] <real>', instrument: 'SA', purpose: 'Max Mixer Level (Preset −10 dBm)', source: 'xsa-scpi' },
    { command: '[:SENSe]:POWer[:RF]:GAIN[:STATe] ON|OFF', instrument: 'SA', purpose: 'Internal preamp (Preset OFF, 옵션 필요)', source: 'xsa-scpi' },
    { command: '[:SENSe]:POWer[:RF]:GAIN:BAND LOW|FULL', instrument: 'SA', purpose: 'Preamp 대역 (Preset LOW)', source: 'xsa-scpi' },
    { command: ':SYSTem:ERRor:OVERload ON|OFF', instrument: 'SA', purpose: '과입력을 SCPI 에러 큐에도 보고', source: 'xsa-scpi' },
    { command: '*OPT?', instrument: 'SG · SA', purpose: '설치된 옵션 목록 (preamp 등 확인)', source: 'ieee-488.2' },
  ],
  testProgram: [
    '측정 시퀀스에 :SYSTem:ERRor:OVERload ON을 넣거나 상태 레지스터를 읽어서, SA가 과입력 상태에서 낸 값을 PASS로 기록하지 않게 합니다. 기본값으로는 에러 큐가 조용합니다.',
    'Harmonic, spurious, ACLR처럼 작은 성분을 재는 항목은 SA 자체 왜곡이 결과를 오염시킬 수 있습니다. 개발 단계에서 감쇠를 바꿔 결과가 변하지 않는지 한 번 확인하고, 그 감쇠 값을 고정해 생산 시퀀스에 넣습니다.',
    'Auto 감쇠는 ref level을 바꿀 때마다 같이 바뀝니다. 측정 사이에 감쇠가 바뀌면 noise floor 기준이 달라지므로, 판정용 측정은 감쇠를 명시적으로 고정합니다.',
    'Preamp는 옵션입니다. 시퀀스가 preamp를 쓰면 시작할 때 *OPT?로 옵션을 확인하고 없으면 명확한 에러로 멈춥니다.',
  ],
  script: 'bench/labs/lab05_attenuation_overload.py',
}
