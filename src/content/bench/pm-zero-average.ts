import type { BenchItem } from './types'

export const PM_SERIES = '파워센서 실습 (U2053XA)'
export const PM_SETUP = 'N5182B MXG → 케이블 → U2053XA (USB로 실습 PC 연결)'

export const PM_ZERO_AVERAGE: BenchItem = {
  id: 'pm-zero-average',
  number: 1,
  title: '파워센서 연결 · zeroing · 주파수 · 평균',
  series: PM_SERIES,
  setup: PM_SETUP,
  summary: '파워센서는 RF 전력을 가장 정확하게 재는 기준 장비입니다. 정확한 값을 얻는 세 가지 습관인 zeroing, 주파수 입력, 평균 횟수를 익힙니다.',
  principle: [
    'U2053XA는 넓은 dynamic range를 가진 평균(average) 전력 센서입니다. 사양서 기준 측정 범위는 −70 ~ +26 dBm, 주파수는 10 MHz ~ 33 GHz입니다(5992-0040). 실습에서는 SG 출력 상한 0 dBm을 그대로 지킵니다.',
    'Zeroing은 신호가 없을 때 센서가 내는 작은 오프셋을 측정해서 빼는 과정입니다. 큰 신호에서는 차이가 작지만, 낮은 레벨(예: −50 dBm 이하)에서는 zero 상태가 결과를 크게 바꿉니다. X-Series 센서는 내부 zeroing을 지원합니다.',
    '센서의 감도는 주파수에 따라 조금씩 다릅니다. 센서 안에 저장된 주파수별 보정(cal factor)을 적용하려면 측정 주파수를 센서에 알려 줘야 합니다. 주파수를 넣지 않으면 기본 주파수의 보정이 적용되어, 다른 주파수에서는 오차가 생깁니다.',
    '평균 횟수(filter length)를 늘리면 측정 잡음이 줄지만 측정 시간이 늘어납니다. 낮은 레벨일수록 잡음이 커서 더 많은 평균이 필요합니다. Auto 평균은 레벨에 따라 횟수를 자동으로 고릅니다.',
  ],
  settings: [
    { name: 'Zero (internal)', effect: '센서 오프셋 제거', defaultValue: '—', pitfall: 'RF가 들어오는 중에 외부 zero를 하면 그 전력이 0으로 잡힘' },
    { name: 'Frequency', effect: '주파수별 보정(cal factor) 선택', defaultValue: '센서 기본값', pitfall: '측정 주파수와 다르면 주파수 응답 오차가 그대로 남음' },
    { name: 'Average Count', effect: '평균 횟수 1–1024', defaultValue: 'Auto', pitfall: '값을 넣으면 Auto가 꺼짐. 낮은 레벨에서 1회는 값이 흔들림' },
    { name: 'Units', effect: 'dBm 또는 W', defaultValue: 'dBm', pitfall: '파싱 코드가 단위를 가정하면 틀린 값이 기록됨' },
    { name: 'INIT:CONTinuous', effect: '연속 측정 여부', defaultValue: '—', pitfall: 'ON이면 READ?가 "INIT ignored" 에러(−213)를 냄' },
  ],
  steps: [
    {
      id: 'zero',
      title: 'Zeroing',
      actions: [
        'SG RF Off. 센서를 SG 출력 케이블 끝에 연결한 채로 둡니다(내부 zero는 RF가 없어야 정확).',
        '센서 zero를 실행하고(스크립트 또는 BenchVue), RF Off 상태에서 읽은 값을 적습니다.',
      ],
      check: 'Zero 후 RF Off 값은 센서 최저 범위 근처(아주 낮은 dBm)로 나옵니다.',
      record: { label: 'Zero 후 RF Off 읽음 값', unit: 'dBm', predict: true },
    },
    {
      id: 'frequency',
      title: '주파수를 넣었을 때와 안 넣었을 때',
      actions: [
        'SG 3 GHz, −10 dBm, RF On.',
        '센서 주파수를 3 GHz로 넣고 읽습니다. 그다음 50 MHz로 바꿔(틀린 값) 다시 읽습니다.',
      ],
      check: '두 값의 차이가 주파수 보정의 크기입니다. 판정 측정에서는 항상 실제 주파수를 넣습니다.',
      record: { label: '3 GHz 설정 − 50 MHz 설정 차이', unit: 'dB', predict: true },
    },
    {
      id: 'averaging',
      title: '낮은 레벨에서 평균 횟수',
      actions: [
        'SG를 −50 dBm으로 내리고(센서 주파수 맞춤) 평균 1회로 다섯 번 읽어 최대−최소를 적습니다.',
        '평균 64회로 다섯 번 읽어 같은 계산을 합니다. 한 번 읽는 시간도 봅니다.',
      ],
      check: '평균을 늘리면 흔들림이 크게 줄고 시간이 늘어납니다.',
      record: { label: '평균 64회일 때 다섯 번의 최대−최소', unit: 'dB', predict: true },
    },
    {
      id: 'compare-sa',
      title: '같은 신호를 SA와 비교',
      actions: ['SG 1 GHz, −10 dBm에서 센서 값과 SG·SA 02번 항목의 SA marker 값(같은 케이블 끝 기준)을 비교합니다.'],
      check: '센서는 SA보다 레벨 정확도가 높은 기준입니다. 차이는 SA의 레벨 오차와 연결 차이입니다. 3번 항목에서 이 차이를 cal로 씁니다.',
      record: { label: '센서 − SA 차이', unit: 'dB', predict: true },
    },
  ],
  scpi: [
    { command: 'CALibration[1]:ZERO:TYPE INTernal|EXTernal', instrument: '파워센서', purpose: 'zero 방식 선택', source: 'u2000-pg' },
    { command: 'CALibration[1]:ZERO:AUTO ONCE', instrument: '파워센서', purpose: 'zero 한 번 실행', source: 'u2000-pg' },
    { command: 'CALibration[1][:ALL]?', instrument: '파워센서', purpose: '보정(zero) 실행 후 결과 (0 = 성공)', source: 'u2000-pg' },
    { command: '[SENSe[1]:]FREQuency[:CW] <Hz>', instrument: '파워센서', purpose: '측정 주파수 (cal factor 선택)', source: 'u2000-pg' },
    { command: '[SENSe[1]:]AVERage:COUNt <1–1024>', instrument: '파워센서', purpose: '평균 횟수 (넣으면 Auto 꺼짐)', source: 'u2000-pg' },
    { command: '[SENSe[1]:]AVERage:COUNt:AUTO ON|OFF', instrument: '파워센서', purpose: '평균 횟수 자동', source: 'u2000-pg' },
    { command: 'UNIT[1]:POWer DBM|W', instrument: '파워센서', purpose: '결과 단위', source: 'u2000-pg' },
    { command: 'INITiate[1]:CONTinuous OFF', instrument: '파워센서', purpose: 'READ? 쓰기 전에 필요', source: 'u2000-pg' },
    { command: 'READ[1]?', instrument: '파워센서', purpose: '측정을 새로 시작하고 결과 반환', source: 'u2000-pg' },
  ],
  testProgram: [
    '파워센서 측정 함수는 항상 주파수를 인자로 받아 설정한 뒤 읽게 만듭니다. 주파수 설정을 빼먹는 버그는 결과가 그럴듯해서 오래 남습니다.',
    'Zero는 장비 켠 뒤, 온도가 바뀐 뒤, 낮은 레벨 측정 전에 합니다. 언제 zero했는지를 데이터에 남깁니다.',
    '평균 횟수는 레벨별로 표를 만들어 씁니다(높은 레벨은 적게, 낮은 레벨은 많이). Auto는 편하지만 측정 시간이 레벨에 따라 바뀌어 test time 예측이 어렵습니다.',
    'READ?는 측정을 새로 시작하므로 이전 값을 읽을 위험이 없습니다. INIT:CONT를 OFF로 두는 것을 시퀀스 시작에 넣습니다.',
  ],
  script: 'bench/labs/lab_pm1_zero_average.py',
}
