export const DIAGNOSTIC_ITEMS = [
  {
    id: 'units',
    question: '0 dBc와 0 dBm은 같은 전력인가요?',
    answer: false,
    explanation: 'dBm은 1 mW 기준 절대 전력이고, dBc는 선언된 carrier/reference 대비 상대 전력입니다.',
  },
  {
    id: 'hierarchy',
    question: 'Normal Burst는 timeslot 안에서 전송되는 물리 계층 구조인가요?',
    answer: true,
    explanation: 'Frame 안의 timeslot이 burst 전송 기회를 제공하며, Normal Burst는 그 안의 대표 구조입니다.',
  },
  {
    id: 'envelope',
    question: 'GMSK plateau가 일정하면 ramp 구간도 자동으로 깨끗한가요?',
    answer: false,
    explanation: 'Ramp는 PA enable, bias, supply/control response에 의해 별도의 transient 문제를 만들 수 있습니다.',
  },
  {
    id: 'instant',
    question: 'PA power는 이상적인 step처럼 즉시 on/off 되어야 하나요?',
    answer: false,
    explanation: '너무 빠른 switching도 spectrum 문제를 만들 수 있어 제어된 ramp와 timing이 필요합니다.',
  },
  {
    id: 'mask',
    question: 'PvT 판정은 trace가 선언된 상·하한 corridor 안에 있는지 확인하나요?',
    answer: true,
    explanation: 'Profile과 reference가 정해진 뒤 각 시간 sample의 margin을 계산해 판정합니다.',
  },
] as const

export const CAUSE_EFFECT_ROWS = [
  ['Timing offset', '전체 trace 이동', 'PRE / RAMP', 'Trigger · PA enable timing'],
  ['Overshoot', 'Turn-on 직후 peak', 'EARLY SETTLE', 'Control step · supply transient'],
  ['Settling', '초기 plateau decay', 'EARLY / PLATEAU', 'Bias/supply loop bandwidth'],
  ['Ringing', '반복되는 peak', 'EARLY / PLATEAU', 'Underdamped control path'],
  ['Noise floor', 'Burst 밖 power 상승', 'PRE / POST', 'Leakage · isolation · 측정 floor'],
] as const

export const DIAGNOSIS_OPTIONS = [
  '정상 기준 파형',
  'PA enable 또는 trigger가 너무 이름',
  'Ramp-up 또는 bias sequence가 늦음',
  'Turn-on overshoot가 큼',
  'Control path가 underdamped 상태',
  'Off-region leakage 또는 noise floor가 높음',
] as const

export const EVIDENCE_OPTIONS = [
  '모든 sample의 margin이 0 dB 이상',
  'pre-burst/ramp-up 영역의 upper boundary 이탈',
  'ramp-up 영역의 lower boundary 이탈',
  'early-settling 영역의 upper boundary 이탈',
  'early-settling 영역에 반복 upper violation',
  'pre/post-burst upper boundary 이탈',
] as const
