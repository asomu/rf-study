import type { BenchItem } from './types'

export const PS_SERIES = 'DC 전원 실습 (N6700C)'
export const PS_SETUP = 'N6700C 채널 1 → 부하 저항(약 10 Ω, 1 W 이상) 또는 개방'

export const PS_LIMITS_PROTECTION: BenchItem = {
  id: 'ps-limits-protection',
  number: 1,
  title: '전압 · 전류 설정과 보호 (CV/CC, OVP, OCP)',
  series: PS_SERIES,
  setup: PS_SETUP,
  summary: 'PA 모듈에 바이어스를 주는 DC 전원은 DUT를 지키는 첫 번째 안전장치입니다. 전압과 전류 설정이 어떻게 동작하는지(CV/CC), 그리고 OVP와 OCP로 출력을 끊는 방법을 익힙니다.',
  principle: [
    'N6700C는 메인프레임이고, 실제 출력 성능(최대 전압, 전류, 측정 기능)은 꽂힌 모듈이 정합니다. 시퀀스 시작에서 :SYSTem:CHANnel:MODel?로 채널마다 모듈 모델을 읽어 기록합니다.',
    '전원은 설정 전압을 유지하려 하고(CV, constant voltage), 부하가 설정 전류보다 많이 끌어가려 하면 전류를 설정값에 묶고 전압을 낮춥니다(CC, constant current). 그래서 "전류 설정"은 평소에는 상한(limit) 역할을 합니다.',
    'CC로 들어가도 출력은 계속 켜져 있습니다. OCP(over-current protection)를 켜 두면 CC로 들어가는 순간(설정한 delay 뒤) 출력을 끕니다. OVP(over-voltage protection)는 출력 전압이 설정값을 넘으면 출력을 끕니다. 보호가 동작하면 OUTPut:PROTection:CLEar로 해제해야 다시 켤 수 있습니다.',
    '출력 켜기와 끄기에는 시간이 걸립니다. 매뉴얼 기준 OUTPut ON은 35–50 ms, OFF는 20–25 ms입니다. 시퀀스 시간 계산에 들어가야 하는 값입니다.',
  ],
  settings: [
    { name: 'Voltage', effect: 'CV 동작 전압', defaultValue: '0 (*RST)', pitfall: 'DUT 정격보다 높은 값을 넣으면 OVP가 없을 때 바로 손상' },
    { name: 'Current (limit)', effect: 'CC로 넘어가는 전류', defaultValue: '0 (*RST), 최대 모듈 정격의 102%', pitfall: '0이면 켜자마자 CC가 되어 DUT가 동작하지 않음. 반대로 너무 크게 두면 단락이나 DUT 불량 때 큰 전류가 그대로 흐름' },
    { name: 'OVP level', effect: '이 전압을 넘으면 출력 차단', defaultValue: 'MAX (*RST, 모듈 정격의 120%)', pitfall: '기본값은 사실상 보호가 없는 상태' },
    { name: 'OCP state', effect: 'CC 진입 시 출력 차단', defaultValue: 'OFF (*RST)', pitfall: '켜지 않으면 CC 상태로 계속 전류가 흐름' },
    { name: 'OCP delay', effect: '켜짐·설정 변경 직후 잠깐 보호를 미룸', defaultValue: '20 ms (*RST), 최대 255 ms', pitfall: 'PA의 inrush 전류로 OCP가 잘못 동작하면 delay를 조정. 너무 길면 보호가 늦음' },
  ],
  steps: [
    {
      id: 'module',
      title: '모듈 확인',
      actions: [':SYSTem:CHANnel:COUNt?와 :SYSTem:CHANnel:MODel? (@1)을 읽어 적습니다.'],
      record: { label: '채널 1 모듈 모델' },
    },
    {
      id: 'open-load',
      title: '부하 없이 켜기',
      actions: ['채널 1: OVP 3 V, 전압 2 V, 전류 limit 0.1 A, OCP 켜기, 출력 On. 전압과 전류를 측정합니다.'],
      check: '전압은 약 2 V, 전류는 거의 0입니다. 부하가 없으면 전류가 흐를 곳이 없습니다.',
      record: { label: '부하 없을 때 측정 전류', unit: 'A', predict: true },
    },
    {
      id: 'resistor-cv',
      title: '저항 부하에서 CV',
      actions: ['출력 Off 후 약 10 Ω 저항을 연결하고 OCP를 끈 채 전류 limit 0.3 A, 출력 On. 전류를 측정합니다.'],
      check: 'I = V/R ≈ 2 V / 10 Ω = 0.2 A. limit(0.3 A)보다 작으므로 CV입니다.',
      record: { label: '10 Ω에서 측정 전류', unit: 'A', predict: true },
    },
    {
      id: 'resistor-cc',
      title: 'Current limit으로 CC 만들기',
      actions: ['전류 limit을 0.1 A로 낮춥니다. 전압과 전류를 측정하고 화면의 CC 표시를 봅니다.'],
      check: '전류는 0.1 A에 묶이고 전압은 I·R ≈ 1 V로 내려갑니다.',
      record: { label: 'CC에서 측정 전압', unit: 'V', predict: true },
    },
    {
      id: 'ocp-trip',
      title: 'OCP로 출력 끊기',
      actions: [
        'OCP를 켭니다. 출력이 꺼지고 보호 표시가 나타나는지 봅니다.',
        ':STATus:QUEStionable:CONDition? (@1)을 읽고, 전류 limit을 0.3 A로 올린 뒤 OUTPut:PROTection:CLEar로 해제합니다.',
      ],
      check: 'CC 상태에서 OCP를 켜면 delay 후 출력이 꺼집니다. 원인을 없애기 전에는 해제해도 다시 걸립니다.',
      record: { label: 'OCP 동작 후 QUES:COND 값' },
    },
  ],
  scpi: [
    { command: ':SYSTem:CHANnel[:COUNt]? / :SYSTem:CHANnel:MODel? (@<ch>)', instrument: 'DC 전원', purpose: '채널 수 · 모듈 모델', source: 'n6700c-osg' },
    { command: '[SOURce:]VOLTage[:LEVel][:IMMediate][:AMPLitude] <V>,(@<ch>)', instrument: 'DC 전원', purpose: '출력 전압', source: 'n6700c-osg' },
    { command: '[SOURce:]CURRent[:LEVel][:IMMediate][:AMPLitude] <A>,(@<ch>)', instrument: 'DC 전원', purpose: '전류 limit', source: 'n6700c-osg' },
    { command: '[SOURce:]VOLTage:PROTection[:LEVel] <V>,(@<ch>)', instrument: 'DC 전원', purpose: 'OVP (*RST MAX)', source: 'n6700c-osg' },
    { command: '[SOURce:]CURRent:PROTection:STATe ON|OFF,(@<ch>)', instrument: 'DC 전원', purpose: 'OCP (*RST OFF)', source: 'n6700c-osg' },
    { command: '[SOURce:]CURRent:PROTection:DELay[:TIME] <s>,(@<ch>)', instrument: 'DC 전원', purpose: 'OCP delay (*RST 20 ms, 최대 255 ms)', source: 'n6700c-osg' },
    { command: 'OUTPut[:STATe] ON|OFF,(@<ch>)', instrument: 'DC 전원', purpose: '출력 켜기/끄기 (ON 35–50 ms 소요)', source: 'n6700c-osg' },
    { command: 'OUTPut:PROTection:CLEar (@<ch>)', instrument: 'DC 전원', purpose: '보호 동작 해제', source: 'n6700c-osg' },
    { command: 'MEASure[:SCALar]:VOLTage[:DC]? / :CURRent[:DC]? (@<ch>)', instrument: 'DC 전원', purpose: '전압 · 전류 측정', source: 'n6700c-osg' },
    { command: 'STATus:QUEStionable:CONDition? (@<ch>)', instrument: 'DC 전원', purpose: 'OV · OCP 등 보호 상태', source: 'n6700c-osg' },
  ],
  testProgram: [
    '출력을 켜기 전에 OVP, 전류 limit, OCP를 모두 설정하고 질의로 확인합니다. *RST 기본값(OVP MAX, OCP OFF)은 DUT 보호가 없는 상태이고, 전류 limit은 0이라 DUT가 동작하지도 않습니다. 시퀀스가 세 값을 모두 명시해야 합니다.',
    'OCP delay는 DUT의 inrush를 견디는 최소값으로 정하고 근거(측정한 inrush 파형)를 남깁니다.',
    '보호가 동작하면 시퀀스는 그 DUT를 FAIL로 기록하고 멈춥니다. 자동으로 CLEar하고 재시도하면 불량 DUT를 더 망가뜨릴 수 있습니다.',
    '채널마다 모듈 모델과 펌웨어를 기록합니다. 같은 N6700C라도 모듈이 바뀌면 측정 범위와 정확도가 바뀝니다.',
  ],
  script: 'bench/labs/lab_ps1_limits_protection.py',
}
