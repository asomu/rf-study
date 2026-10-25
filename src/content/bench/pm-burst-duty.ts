import type { BenchItem } from './types'
import { PM_SERIES, PM_SETUP } from './pm-zero-average'

export const PM_BURST_DUTY: BenchItem = {
  id: 'pm-burst-duty',
  number: 2,
  title: '평균 센서로 burst 재기: duty cycle 보정',
  series: PM_SERIES,
  setup: PM_SETUP,
  summary: 'U2053XA는 평균 전력 센서라 burst 신호의 on 구간 전력을 직접 재지 못합니다. 평균 전력과 duty cycle로 burst 전력을 계산하는 방법과 그 한계를 익힙니다.',
  principle: [
    '평균 센서는 시간에 따라 켜졌다 꺼지는 신호도 긴 시간 평균으로 봅니다. burst가 전체 시간의 일부(duty cycle D)만 켜져 있으면, 평균 전력 = burst 전력 × D입니다. dB로는 평균 = burst + 10·log10(D)입니다.',
    'GSM처럼 8개 timeslot 중 1개만 켜지는 신호는 D = 1/8이라서 평균이 burst보다 약 9.0 dB 낮게 나옵니다.',
    'Duty cycle 보정을 켜면 센서가 측정한 평균을 D로 나눠 "pulse power"로 보여줍니다. 이 값은 실제 측정이 아니라 계산값이라서, burst 모양(ramp, overshoot)이나 D가 정확하지 않으면 오차가 그대로 들어갑니다.',
    'burst의 on 구간 전력이나 PvT 모양을 직접 보려면 peak 센서나 SA zero span(SG·SA 10번 항목)이 필요합니다. 평균 센서는 평균 전력 판정과 cal 기준으로 씁니다.',
  ],
  settings: [
    { name: 'Duty Cycle 보정', effect: '평균 ÷ D로 pulse power 표시', defaultValue: 'OFF', pitfall: '값을 넣으면 자동으로 켜짐. 다른 신호로 바꿀 때 끄지 않으면 CW 값이 틀리게 나옴' },
    { name: 'Average Count', effect: 'burst 신호의 평균 안정성', defaultValue: 'Auto', pitfall: 'burst 주기에 비해 측정 시간이 짧으면 값이 흔들림' },
    { name: 'SG Pulse (옵션 UNW)', effect: 'burst 만들기', defaultValue: 'OFF', pitfall: '옵션이 없으면 이 실습은 계산 연습으로 대신' },
  ],
  steps: [
    {
      id: 'cw-reference',
      title: 'CW 기준값',
      actions: ['SG 1 GHz, −10 dBm CW. 센서 주파수 1 GHz. 평균 전력을 읽습니다.'],
      record: { label: 'CW 평균 전력', unit: 'dBm' },
    },
    {
      id: 'burst-average',
      title: 'Burst로 바꾸고 평균 읽기 (UNW 옵션)',
      actions: ['SG Pulse: period 4.615 ms, width 577 µs(D ≈ 0.125), Pulse On, Mod On. 센서 값을 읽습니다.'],
      check: 'CW보다 약 9.0 dB 낮게 나옵니다(10·log10(0.125)).',
      record: { label: 'Burst 평균 전력', unit: 'dBm', predict: true },
    },
    {
      id: 'duty-correction',
      title: 'Duty cycle 보정 켜기',
      actions: ['센서 duty cycle을 12.5%로 넣고 값을 읽습니다.'],
      check: 'CW 기준값과 거의 같은 값이 됩니다. 계산값이라는 점을 기억합니다.',
      record: { label: '보정 후 pulse power', unit: 'dBm', predict: true },
    },
    {
      id: 'wrong-duty',
      title: 'D를 잘못 넣으면',
      actions: ['duty cycle을 10%로 넣고(실제보다 작게) 값을 읽은 뒤, 보정을 끕니다.'],
      check: '10·log10(0.125/0.1) ≈ 1 dB만큼 높게 나옵니다. D의 오차가 그대로 결과 오차가 됩니다.',
      record: { label: 'D 10%로 넣었을 때 값', unit: 'dBm', predict: true },
    },
  ],
  scpi: [
    { command: '[SENSe[1]:]CORRection:DCYCle[:INPut][:MAGNitude] <percent>', instrument: '파워센서', purpose: 'duty cycle 입력 (자동으로 보정 ON)', source: 'u2000-pg' },
    { command: '[SENSe[1]:]CORRection:DCYCle:STATe ON|OFF', instrument: '파워센서', purpose: 'duty cycle 보정 켜기/끄기', source: 'u2000-pg' },
    { command: 'READ[1]?', instrument: '파워센서', purpose: '측정', source: 'u2000-pg' },
    { command: '[:SOURce]:PULM:INTernal:PERiod / :PWIDth / :STATe', instrument: 'SG', purpose: 'burst 만들기 (옵션 UNW)', source: 'mxg-scpi' },
    { command: ':OUTPut:MODulation[:STATe] ON', instrument: 'SG', purpose: '변조 적용', source: 'mxg-scpi' },
  ],
  testProgram: [
    'GSM이나 TDD처럼 burst 신호의 출력 전력을 평균 센서로 판정할 때는 duty cycle을 측정 조건과 함께 기록하고, 계산값이라는 점을 데이터에 표시합니다.',
    'Duty cycle 보정은 센서 상태로 남습니다. 측정 함수 시작에서 보정 상태를 명시적으로 설정하지 않으면 이전 테스트의 D가 다음 CW 측정에 적용됩니다.',
    'burst 모양이 중요한 항목(PvT, ramp)은 평균 센서로 판정하지 않습니다. 장비 선택 자체가 측정 설계의 일부입니다.',
  ],
  script: 'bench/labs/lab_pm2_burst_duty.py',
}
