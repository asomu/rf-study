import type { BenchItem } from './types'
import { PS_SERIES } from './ps-limits-protection'

export const PS_REMOTE_SENSE: BenchItem = {
  id: 'ps-remote-sense',
  number: 2,
  title: 'Remote sense와 선로 전압 강하',
  series: PS_SERIES,
  setup: 'N6700C 채널 1 → 긴 부하선 → 10 Ω 저항, (있으면) DMM을 저항 양단에',
  summary: 'PA 모듈은 큰 전류를 끌어가서 전원선 저항만큼 전압이 떨어집니다. 전원 단자 전압이 아니라 DUT 단자 전압을 맞추는 remote sense를 익힙니다.',
  principle: [
    '부하선에도 저항이 있습니다. 전류 I가 흐르면 양쪽 선에서 I × R_선만큼씩 전압이 떨어져, DUT에는 설정보다 낮은 전압이 걸립니다. PA는 수백 mA~수 A를 끌어가므로 이 차이가 측정 결과(출력 전력, 효율)를 바꿉니다.',
    'Remote sense는 별도의 얇은 선(sense lead)으로 DUT 단자 전압을 전원에 돌려보내, 전원이 그 지점의 전압을 설정값으로 맞추게 합니다. sense 선에는 전류가 거의 흐르지 않아 전압 강하가 없습니다.',
    'N6700C 모듈에서 remote sense는 SCPI 명령이 아니라 배선입니다. 출력 단자와 sense 단자 사이의 점퍼를 빼고 sense 선을 DUT 쪽에 연결합니다. 매뉴얼은 sense 선 저항을 선당 약 0.5 Ω 이하로 권장합니다.',
    'Remote sense는 CV에서만 의미가 있습니다. CC 동작에서는 효과가 없습니다. 전원의 MEASure:VOLTage?는 sense 단자 전압을 재므로, remote sense를 쓰면 DUT 단자 전압을 읽게 됩니다.',
  ],
  settings: [
    { name: 'Sense 배선 (점퍼)', effect: 'Local: 전원 단자 기준, Remote: DUT 단자 기준', defaultValue: 'Local (점퍼 연결 상태로 출하)', pitfall: '점퍼를 뺀 채 sense 선을 연결하지 않으면 전압 조절이 비정상' },
    { name: 'Sense 선', effect: 'DUT 단자 전압 전달', defaultValue: '—', pitfall: '부하선과 같이 묶으면 잡음이 들어옴. 따로 꼬아서 배선' },
    { name: 'Voltage 측정', effect: 'sense 단자 기준 전압', defaultValue: '—', pitfall: 'Local sense에서는 DUT 전압이 아니라 전원 단자 전압' },
  ],
  steps: [
    {
      id: 'local',
      title: 'Local sense에서 선로 강하 보기',
      actions: [
        '점퍼를 연결한 상태(local)로 긴 부하선 끝에 10 Ω 저항. 전압 2 V, 전류 limit 0.3 A, 출력 On.',
        '전원의 측정 전압과, DMM이 있으면 저항 양단 전압을 읽습니다.',
      ],
      check: '전원 측정값은 2 V, 저항 양단은 그보다 조금 낮습니다. 차이 = 전류 × 왕복 선 저항입니다.',
      record: { label: '저항 양단 전압 (DMM)', unit: 'V', predict: true },
    },
    {
      id: 'lead-resistance',
      title: '선 저항 계산',
      actions: ['(전원 측정 전압 − 저항 양단 전압) ÷ 측정 전류로 왕복 선 저항을 계산합니다.'],
      record: { label: '왕복 선 저항', unit: 'Ω', predict: true },
    },
    {
      id: 'remote',
      title: 'Remote sense 연결',
      actions: [
        '출력 Off. 점퍼를 빼고 sense 선을 저항 양단에 연결합니다(+는 +, −는 −).',
        '출력 On 후 같은 두 전압을 다시 읽습니다.',
      ],
      check: '이제 저항 양단이 2 V가 되고, 전원 출력 단자는 선로 강하만큼 더 높은 전압을 냅니다.',
      record: { label: 'Remote sense에서 저항 양단 전압', unit: 'V', predict: true },
    },
  ],
  scpi: [
    { command: '[SOURce:]VOLTage[:LEVel][:IMMediate][:AMPLitude] <V>,(@<ch>)', instrument: 'DC 전원', purpose: '전압 설정 (remote sense면 DUT 단자 기준)', source: 'n6700c-osg' },
    { command: 'MEASure[:SCALar]:VOLTage[:DC]? (@<ch>)', instrument: 'DC 전원', purpose: 'sense 단자 전압 측정', source: 'n6700c-osg' },
    { command: 'MEASure[:SCALar]:CURRent[:DC]? (@<ch>)', instrument: 'DC 전원', purpose: '출력 전류 측정', source: 'n6700c-osg' },
    { command: 'OUTPut[:STATe] ON|OFF,(@<ch>)', instrument: 'DC 전원', purpose: '배선 바꾸기 전 반드시 Off', source: 'n6700c-osg' },
  ],
  testProgram: [
    'PA 바이어스처럼 전류가 큰 전원은 remote sense를 DUT(또는 fixture) 단자까지 배선하는 것을 기본으로 합니다. 그렇지 않으면 전류에 따라 실제 바이어스가 달라져 측정 결과에 오차가 섞입니다.',
    'sense가 제대로 연결됐는지 확인하는 단계를 둡니다. 예: 알려진 부하에서 전원 측정 전압과 fixture 쪽 측정 전압을 비교해 차이가 기준 안인지 봅니다.',
    'remote sense 선이 끊기면 전원은 출력 단자 전압을 크게 올릴 수 있습니다. OVP를 DUT 정격에 맞게 설정하는 것이 이 경우의 안전장치입니다.',
  ],
  script: 'bench/labs/lab_ps2_remote_sense.py',
}
