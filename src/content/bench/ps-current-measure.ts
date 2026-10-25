import type { BenchItem } from './types'
import { PS_SERIES, PS_SETUP } from './ps-limits-protection'

export const PS_CURRENT_MEASURE: BenchItem = {
  id: 'ps-current-measure',
  number: 3,
  title: '전류 측정: 범위 · 적분 시간 · 배열 측정',
  series: PS_SERIES,
  setup: PS_SETUP,
  summary: 'PA 테스트에서 전류는 효율(PAE) 계산과 이상 판정에 쓰입니다. 측정 범위, 한 번 측정의 시간(점 수 × 간격), 시간 배열 측정이 결과와 측정 시간에 어떻게 영향을 주는지 익힙니다.',
  principle: [
    'MEASure:CURRent?는 정해진 시간 동안 샘플을 모아 평균한 값을 줍니다. 기본 설정은 1 NPLC(전원 주파수 한 주기)입니다. 60 Hz에서는 3255점 × 5.12 µs ≈ 16.7 ms, 50 Hz에서는 3906점 × 5.12 µs ≈ 20 ms입니다. 한 주기를 평균하면 전원선 잡음(험)이 상쇄됩니다.',
    '점 수를 줄이면 측정이 빨라지지만 잡음과 험이 결과에 남습니다. 생산 테스트 시간과 측정 정확도 사이의 거래입니다.',
    '측정 범위는 예상 최대 전류 기준으로 고르면 가장 좋은 분해능을 얻습니다. 작은 전류(대기 전류, leakage)를 큰 범위로 재면 분해능이 부족합니다. 일부 모듈은 범위 자동 전환(seamless autoranging)을 지원합니다.',
    'MEASure:ARRay:CURRent?는 평균값 대신 시간에 따른 샘플 전체를 돌려줍니다. 펄스 전류(GSM PA의 burst 전류, TDD switching)를 보려면 이 기능이 필요합니다. 일부 모듈(N673x, N674x, N675x, N677x)은 이 기능에 옵션이 필요합니다.',
  ],
  settings: [
    { name: 'Sweep Points', effect: '한 측정의 샘플 수', defaultValue: '3255 (60 Hz) / 3906 (50 Hz) = 1 NPLC', pitfall: '줄이면 빠르지만 험이 남아 값이 흔들림' },
    { name: 'Sample Interval (TINTerval)', effect: '샘플 간격', defaultValue: '5.12 µs (*RST)', pitfall: '20.48 µs 단위로 반올림됨(그 이하 구간은 다른 단위)' },
    { name: 'Current Range', effect: '측정 분해능', defaultValue: '모듈에 따라 다름', pitfall: '작은 전류를 큰 범위로 재면 분해능 부족' },
    { name: 'Array 측정', effect: '시간 파형 전체 받기', defaultValue: '—', pitfall: '모듈에 따라 옵션 필요. 없으면 에러' },
  ],
  steps: [
    {
      id: 'nplc',
      title: '기본 측정 시간',
      actions: ['10 Ω 부하, 2 V, limit 0.3 A, 출력 On. 점 수와 간격을 질의하고 곱해서 측정 시간을 계산합니다.'],
      check: '전원 주파수 한 주기(16.7 ms 또는 20 ms)에 가깝습니다.',
      record: { label: '계산한 측정 시간', unit: 'ms', predict: true },
    },
    {
      id: 'fast-noisy',
      title: '빠르게 재면 흔들림',
      actions: ['점 수를 100으로 줄이고 MEASure:CURRent?를 10번 읽어 최대−최소를 적습니다. 점 수를 기본값으로 되돌려 같은 계산을 합니다.'],
      check: '점이 적을수록 흔들림이 큽니다.',
      record: { label: '100점일 때 10회 최대−최소', unit: 'mA', predict: true },
    },
    {
      id: 'range',
      title: '전류 범위',
      actions: ['현재 범위를 질의하고, 가능한 작은 범위로 바꿔 같은 전류를 재 봅니다(0.2 A보다 큰 범위여야 함).'],
      record: { label: '사용한 범위와 측정값' },
    },
    {
      id: 'array',
      title: '배열 측정 (모듈이 지원할 때)',
      actions: ['점 수 1000, 간격 20.48 µs로 두고 MEASure:ARRay:CURRent?로 약 20 ms 구간의 샘플을 받습니다.'],
      check: '일정한 부하라서 거의 평평합니다. 에러가 나면 모듈이 배열 측정을 지원하지 않거나 옵션이 없는 것입니다.',
      record: { label: '받은 샘플 수 또는 에러 메시지' },
    },
  ],
  scpi: [
    { command: 'SENSe:SWEep:POINts <n>,(@<ch>)', instrument: 'DC 전원', purpose: '샘플 수 (*RST 1 NPLC)', source: 'n6700c-osg' },
    { command: 'SENSe:SWEep:TINTerval <s>,(@<ch>)', instrument: 'DC 전원', purpose: '샘플 간격 (*RST 5.12 µs)', source: 'n6700c-osg' },
    { command: 'SENSe:CURRent[:DC]:RANGe[:UPPer] <A>,(@<ch>)', instrument: 'DC 전원', purpose: '측정 범위 (예상 최대 전류)', source: 'n6700c-osg' },
    { command: 'SENSe:CURRent[:DC]:RANGe:AUTO ON|OFF,(@<ch>)', instrument: 'DC 전원', purpose: 'seamless autoranging (지원 모듈)', source: 'n6700c-osg' },
    { command: 'MEASure[:SCALar]:CURRent[:DC]? (@<ch>)', instrument: 'DC 전원', purpose: '평균 전류', source: 'n6700c-osg' },
    { command: 'MEASure:ARRay:CURRent[:DC]? (@<ch>)', instrument: 'DC 전원', purpose: '시간 샘플 배열 (일부 모듈 옵션 필요)', source: 'n6700c-osg' },
  ],
  testProgram: [
    'PAE 계산의 전류와 전압은 RF 측정과 같은 조건(같은 순간, 같은 평균 구간)에서 재야 의미가 있습니다. 측정 순서와 대기 시간을 시퀀스에 명시합니다(다장비 동기화 항목).',
    '측정 시간은 점 수 × 간격으로 정해집니다. test time을 줄이려면 점 수를 줄이되, 험을 피하려면 NPLC의 정수배를 유지하는 방법을 검토합니다.',
    '대기 전류처럼 작은 전류 판정은 범위를 명시적으로 낮게 고정하고, 측정 전에 충분히 안정되는 시간을 둡니다.',
    '배열 측정 기능이 있는지는 모듈마다 다릅니다. 시퀀스 시작에서 모듈 모델을 확인하고, 필요한 기능이 없으면 명확한 에러로 멈춥니다.',
  ],
  script: 'bench/labs/lab_ps3_current_measure.py',
}
