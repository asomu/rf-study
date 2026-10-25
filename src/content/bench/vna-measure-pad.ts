import type { BenchItem } from './types'
import { VNA_SERIES, VNA_SETUP } from './vna-basics'

export const VNA_MEASURE_PAD: BenchItem = {
  id: 'vna-measure-pad',
  number: 3,
  title: '감쇠기를 DUT로: 손실 · 정합 · 지연',
  series: VNA_SERIES,
  setup: VNA_SETUP,
  summary: '보정된 VNA로 쓰루에 쓰던 감쇠기를 DUT처럼 잽니다. 수동 부품 하나로 S21(삽입 손실), S11(return loss, VSWR), 위상과 group delay를 모두 읽는 연습입니다.',
  principle: [
    '감쇠기는 모든 주파수에서 같은 비율로 신호를 줄이도록 만든 부품입니다. 좋은 감쇠기는 S21이 표기값 근처에서 평평하고, 양쪽 포트가 50 Ω에 잘 맞아 S11과 S22가 매우 낮습니다.',
    'S21(dB)이 음수면 손실입니다. 주파수에 따라 조금씩 기울거나 출렁이는 모양은 부품과 커넥터의 특성입니다. 감쇠기 표기값과 실제 측정값의 차이는 SG·SA 07번 항목의 경로 손실 계산에 그대로 쓰입니다.',
    'S11은 Log Mag로 보면 정합 정도, Smith chart로 보면 임피던스입니다. 잘 맞는 부품은 Smith chart 중심(50 Ω) 근처에 작게 모입니다.',
    '위상은 신호가 부품을 지나는 데 걸리는 시간 때문에 주파수에 따라 직선으로 변합니다. Group delay는 그 기울기(−dφ/dω)로, 신호가 통과하는 데 걸리는 시간입니다.',
  ],
  settings: [
    { name: 'Marker (stimulus)', effect: '지정 주파수의 값을 읽기', defaultValue: 'OFF (Preset)', pitfall: 'Smith chart에서는 marker 값이 두 개(실수·허수 또는 R·X)' },
    { name: 'Marker Search', effect: 'MAX, MIN, PEAK, TARGET 찾기', defaultValue: 'MAXimum', pitfall: '검색 범위를 지정하지 않으면 전체 trace에서 찾음' },
    { name: 'Smoothing / Averaging', effect: 'trace 잡음 줄이기', defaultValue: 'OFF (Preset)', pitfall: 'smoothing은 좁은 특징(공진)을 뭉갬. 판정용 측정에는 신중히' },
    { name: 'Format SWR / Smith', effect: '반사를 VSWR이나 임피던스로 보기', defaultValue: '—', pitfall: '형식을 바꾸면 FDATA로 읽는 값의 의미도 바뀜' },
  ],
  steps: [
    {
      id: 's21',
      title: '감쇠기 S21',
      actions: ['2번 항목의 보정 상태로, 케이블 사이에 감쇠기를 넣습니다. S21 Log Mag에서 100 MHz, 1 GHz, 3 GHz에 marker를 둡니다.'],
      check: '세 값 모두 감쇠기 표기값 근처입니다. SG·SA 07번에서 잰 경로 손실과 비교해 봅니다.',
      record: { label: '1 GHz S21', unit: 'dB', predict: true },
    },
    {
      id: 's11',
      title: '감쇠기 S11과 VSWR',
      actions: ['S11 Log Mag에서 3 GHz 값을 읽고, Format을 SWR로 바꿔 같은 주파수를 읽습니다.'],
      check: 'S11이 −20 dB면 return loss 20 dB, VSWR 약 1.22입니다. 값이 낮을수록 정합이 좋습니다.',
      record: { label: '3 GHz S11', unit: 'dB', predict: true },
    },
    {
      id: 'smith',
      title: 'Smith chart로 보기',
      actions: ['S11 Format을 Smith(R+jX)로 바꿉니다. 1 GHz marker의 R과 X를 읽습니다.'],
      check: '50 Ω 근처, X는 0 근처입니다. Short를 달면 왼쪽 끝, Open을 달면 오른쪽 끝으로 갑니다(한 번 해 보면 좋습니다).',
      record: { label: '1 GHz 임피던스 R + jX', unit: 'Ω', predict: true },
    },
    {
      id: 'delay',
      title: '감쇠기의 group delay',
      actions: ['S21 Format을 Group Delay로 바꾸고 1 GHz 값을 읽습니다.'],
      check: '작은 감쇠기는 수십~수백 ps 수준입니다. 케이블보다 훨씬 짧습니다.',
      record: { label: '1 GHz group delay', unit: 'ps', predict: true },
    },
  ],
  scpi: [
    { command: ':CALCulate1:PARameter1:DEFine S21', instrument: 'VNA', purpose: 'trace가 볼 S-parameter', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:FORMat MLOGarithmic|SWR|SMITh|GDELay|PHASe', instrument: 'VNA', purpose: '표시 형식', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:MARKer1[:STATe] ON', instrument: 'VNA', purpose: 'marker 켜기 (Preset OFF)', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:MARKer1:X <freq>', instrument: 'VNA', purpose: 'marker 주파수', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:MARKer1:Y?', instrument: 'VNA', purpose: 'marker 값 (두 개: 주값, 부값)', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:MARKer1:FUNCtion:TYPE MAXimum|MINimum|PEAK|TARGet', instrument: 'VNA', purpose: '검색 종류 (Preset MAX)', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:MARKer1:FUNCtion:EXECute', instrument: 'VNA', purpose: '검색 실행', source: 'e5071c-help' },
    { command: ':SENSe1:AVERage[:STATe] ON|OFF', instrument: 'VNA', purpose: 'sweep averaging (Preset OFF)', source: 'e5071c-help' },
  ],
  testProgram: [
    '수동 부품의 판정은 보통 주파수 대역별 S21 범위와 S11 최댓값입니다. marker 몇 개보다는 대역 전체 데이터를 읽어 최댓값·최솟값을 계산하는 편이 놓치는 점이 없습니다(4번 항목).',
    'Marker Y?는 값 두 개를 돌려줍니다. Log Mag에서는 두 번째가 0입니다. 파싱 코드는 첫 번째 값만 쓰도록 명확히 합니다.',
    'PA 모듈을 재는 경우에도 같은 원리입니다. 다만 출력이 반대 포트 최대 입력(+10 dBm)을 넘지 않도록 포트 전력과 외부 감쇠기를 정해야 합니다.',
    '기준 감쇠기 같은 확인용 부품을 매일 재서 trend를 남기면 VNA, 케이블, 보정 상태를 함께 감시할 수 있습니다.',
  ],
  script: 'bench/labs/lab_vna3_measure_pad.py',
}
