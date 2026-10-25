import type { BenchItem } from './types'
import { PM_SERIES } from './pm-zero-average'

export const PM_PATH_CAL: BenchItem = {
  id: 'pm-path-cal',
  number: 3,
  title: '파워센서 기준 경로 손실 cal',
  series: PM_SERIES,
  setup: 'N5182B MXG → 케이블 → (센서 또는 감쇠기 → N9020B MXA)',
  summary: 'SG·SA 07번에서는 두 장비의 오차가 섞인 손실을 쟀습니다. 파워센서를 기준으로 SG 실제 출력과 경로 손실을 따로 재서, SA 보정 표를 더 정확하게 만듭니다.',
  principle: [
    '경로 손실을 정확히 알려면, 경로 앞의 실제 전력을 알아야 합니다. SG 설정값은 SG 자체 레벨 오차가 있으므로, 센서로 케이블 끝의 실제 전력을 재서 기준으로 씁니다.',
    '순서: ① SG → 케이블 → 센서로 케이블 끝 전력 P1을 잽니다. ② 센서 자리에 감쇠기 → SA를 연결하고 SA가 읽은 값 P2를 잽니다. ③ P1 − P2가 "감쇠기 + SA 레벨 오차"를 합친 보정값입니다. 이 값을 SA에 넣으면 SA가 케이블 끝(DUT 입력 기준면)의 전력을 정확히 보여줍니다.',
    'SG 설정값 − P1은 SG 레벨 오차와 케이블 손실입니다. SG 출력 쪽 보정(user flatness)이 필요한지 판단하는 근거가 됩니다.',
    '센서 오프셋(GAIN2)은 센서 앞의 감쇠기나 커플러 손실을 넣어 센서가 그 앞의 전력을 보여주게 합니다. 손실은 음수로 넣습니다.',
  ],
  settings: [
    { name: 'Sensor Offset (GAIN2)', effect: '센서 앞 손실·이득 보정', defaultValue: 'OFF, 0 dB', pitfall: '손실은 음수로 입력. 상태가 남아 다음 측정에 영향' },
    { name: 'Frequency (센서)', effect: 'cal factor 선택', defaultValue: '—', pitfall: '여러 주파수 cal에서 주파수마다 바꾸지 않으면 표 전체가 틀림' },
    { name: 'SA CSET / Ext Gain', effect: '측정한 보정값 적용', defaultValue: 'OFF / 0', pitfall: 'SG·SA 07번과 이중으로 적용하지 않기' },
  ],
  steps: [
    {
      id: 'p1',
      title: '케이블 끝 실제 전력 P1',
      actions: ['SG −10 dBm, 센서를 케이블 끝에 연결. 100 MHz, 1 GHz, 2 GHz, 3 GHz에서 (센서 주파수도 함께 바꾸며) 읽습니다.'],
      record: { label: '1 GHz P1', unit: 'dBm' },
    },
    {
      id: 'p2',
      title: '같은 자리에서 SA가 읽는 값 P2',
      actions: ['센서를 빼고 감쇠기 → SA를 연결. 같은 네 주파수에서 SA marker를 읽습니다(SA 보정은 모두 0).'],
      record: { label: '1 GHz P2', unit: 'dBm' },
    },
    {
      id: 'cal-value',
      title: '보정값 계산과 적용',
      actions: [
        '주파수마다 P1 − P2를 계산해 SA CSET1 표에 넣고 켭니다(SG·SA 07번과 같은 방법).',
        '네 주파수에서 SA 값을 다시 읽어 P1과 비교합니다.',
      ],
      check: '보정 후 SA 값이 P1과 거의 같습니다. 남는 차이는 반복성 수준입니다.',
      record: { label: '보정 후 SA − P1 최대 차이', unit: 'dB', predict: true },
    },
    {
      id: 'sg-error',
      title: 'SG 레벨 오차 보기',
      actions: ['주파수마다 SG 설정값(−10 dBm) − P1을 계산합니다.'],
      check: '케이블 손실과 SG 레벨 오차의 합입니다. 주파수가 높을수록 커지는 경향이면 대부분 케이블 손실입니다.',
      record: { label: '3 GHz에서 SG 설정 − P1', unit: 'dB', predict: true },
    },
  ],
  scpi: [
    { command: '[SENSe[1]:]FREQuency[:CW] <Hz>', instrument: '파워센서', purpose: '주파수마다 cal factor', source: 'u2000-pg' },
    { command: '[SENSe[1]:]CORRection:GAIN2[:INPut][:MAGNitude] <dB>', instrument: '파워센서', purpose: '센서 앞 손실 (손실은 음수)', source: 'u2000-pg' },
    { command: '[SENSe[1]:]CORRection:GAIN2:STATe ON|OFF', instrument: '파워센서', purpose: '오프셋 켜기', source: 'u2000-pg' },
    { command: 'READ[1]?', instrument: '파워센서', purpose: '측정', source: 'u2000-pg' },
    { command: '[:SENSe]:CORRection:CSET1:DATA <freq>,<ampl>,...', instrument: 'SA', purpose: 'SA 보정 표', source: 'xsa-scpi' },
    { command: '[:SENSe]:CORRection:CSET1[:STATe] ON|OFF', instrument: 'SA', purpose: 'SA 보정 켜기', source: 'xsa-scpi' },
  ],
  testProgram: [
    '생산 station의 경로 cal은 보통 이 방식(파워센서 기준)으로 만듭니다. cal 결과는 주파수별 표로 저장하고, 버전·날짜·센서 시리얼·센서 cal 만료일을 함께 기록합니다.',
    'cal 표는 측정 프로그램 밖의 파일로 두고, 프로그램은 시작할 때 읽어 적용합니다. 표를 코드에 넣으면 station마다 다른 값을 관리할 수 없습니다.',
    'Cal 후에는 확인용 측정(이 실습 3단계처럼)을 자동으로 한 번 돌려 차이가 기준 안인지 보고 나서 station을 사용 가능 상태로 둡니다(6번 트랙 "DUT 연결 전 station 검증").',
  ],
  script: 'bench/labs/lab_pm3_path_cal.py',
}
