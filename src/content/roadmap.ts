// Single source of truth for the learning roadmap. Change an item's status here when it is built;
// the home page and docs/ROADMAP.md read from this list.

export type RoadmapLayer = 'foundation' | 'signal' | 'bench' | 'data' | 'later'
export type RoadmapItemStatus = 'ready' | 'building' | 'planned'
export type RoadmapItemOrigin = 'wiki' | 'new'

export interface RoadmapItem {
  id: string
  title: string
  status: RoadmapItemStatus
  /** 'wiki': topic taken from the rf-wiki item list (content is rebuilt here). 'new': topic added for test-program work. */
  origin: RoadmapItemOrigin
  group?: string
  href?: string
}

export interface RoadmapTrack {
  id: string
  number: number
  title: string
  question: string
  layer: RoadmapLayer
  items: RoadmapItem[]
}

export const ROADMAP_LAYERS: { id: RoadmapLayer; label: string }[] = [
  { id: 'foundation', label: '기초' },
  { id: 'signal', label: '신호 · 측정' },
  { id: 'bench', label: '장비 · 판정' },
  { id: 'data', label: '데이터 · 생산' },
  { id: 'later', label: '후순위 후보' },
]

const M1_HREF = '/modules/gsm-pvt/learn'

const planned = (id: string, title: string, origin: RoadmapItemOrigin, group?: string): RoadmapItem => ({ id, title, status: 'planned', origin, group })

export const ROADMAP_TRACKS: RoadmapTrack[] = [
  {
    id: 'rf-basics',
    number: 1,
    title: 'RF 기초 언어',
    question: '측정값의 단위와 기준면이 무엇인가',
    layer: 'foundation',
    items: [
      planned('db-units', 'dBm · dBc · dB와 50 Ω 기준', 'wiki'),
      planned('complex-iq', '복소수와 IQ: magnitude · phase · PSD · PAPR', 'wiki'),
      planned('sa-trace-vs-iq', 'Spectrum analyzer trace와 IQ capture', 'wiki'),
      planned('s-parameters', 'S-parameter · Smith chart · VSWR', 'wiki'),
      planned('power-flow', '포트 사이 전력 흐름: coupling · insertion · isolation · directivity', 'wiki'),
    ],
  },
  {
    id: 'module-anatomy',
    number: 2,
    title: '모듈 해부',
    question: '테스트하는 DUT 안에 무엇이 있나',
    layer: 'foundation',
    items: [
      planned('module-paths', 'GSM PA+ASM · FDD PAMiD · TDD TxM 신호 경로', 'wiki'),
      planned('block-signatures', 'PA · filter · duplexer · switch가 RF 결과에 남기는 흔적', 'wiki'),
      planned('port-power-budget', 'RFin · RFout · antenna · Rx 포트 power budget', 'wiki'),
      planned('gain-mode-bias', 'Gain mode와 bias state', 'wiki'),
      planned('mipi-rffe', 'MIPI RFFE: 레지스터가 RF 경로가 되는 시점', 'wiki'),
      planned('apt-et', 'APT와 ET: PA 전원 제어', 'wiki'),
      planned('dpd-cfr', 'DPD와 CFR', 'wiki'),
      planned('pa-load-pull', 'PA load-pull: PA가 원하는 임피던스', 'wiki'),
      planned('lna-rx-path', 'LNA와 Rx 경로: gain · NF · linearity · bypass', 'new'),
    ],
  },
  {
    id: 'signals',
    number: 3,
    title: '신호와 표준',
    question: '측정 조건(band · RB · modulation)은 왜 그렇게 정해지나',
    layer: 'signal',
    items: [
      planned('waveform-vocabulary', 'GMSK · OFDM · TDMA · FDD는 서로 다른 층위의 말', 'wiki', '공통'),
      planned('ue-spec-vs-module', '3GPP UE 규격과 PAMiD 목표 스펙의 차이', 'wiki', '공통'),
      planned('gsm-arfcn', 'ARFCN과 200 kHz carrier', 'wiki', 'GSM'),
      planned('gsm-tdma', 'TDMA frame과 timeslot', 'wiki', 'GSM'),
      { id: 'gsm-normal-burst', title: 'Normal burst 구조와 PvT (M1)', status: 'ready', origin: 'wiki', group: 'GSM', href: M1_HREF },
      planned('gsm-gmsk', 'GMSK constant envelope', 'wiki', 'GSM'),
      planned('edge-8psk', 'EDGE 8PSK가 PA에 요구하는 것', 'wiki', 'GSM'),
      planned('gsm-multislot', 'Multislot과 PA duty · 전류 펄스', 'wiki', 'GSM'),
      planned('lte-frame', 'Frame과 subframe 구조', 'wiki', 'LTE'),
      planned('lte-re-rb', 'Resource element와 resource block', 'wiki', 'LTE'),
      planned('lte-bw-rb-location', 'Bandwidth와 RB 위치에 따른 spectrum', 'wiki', 'LTE'),
      planned('lte-dft-s-ofdm', 'DFT-s-OFDM', 'wiki', 'LTE'),
      planned('lte-modulation-load', 'Modulation별 RF 부담', 'wiki', 'LTE'),
      planned('lte-power-psd', 'Total power · RB power · PSD', 'wiki', 'LTE'),
      planned('lte-papr-mpr', 'PAPR과 MPR', 'wiki', 'LTE'),
      planned('nr-numerology', 'Numerology와 SCS', 'wiki', 'NR'),
      planned('nr-point-a-bwp', 'Point A · BWP · PRB', 'wiki', 'NR'),
      planned('nr-cp-dft-ofdm', 'CP-OFDM과 DFT-s-OFDM', 'wiki', 'NR'),
      planned('nr-tdd', 'TDD switching', 'wiki', 'NR'),
      planned('nr-mpr', 'NR MPR', 'wiki', 'NR'),
    ],
  },
  {
    id: 'measurements',
    number: 4,
    title: '측정 항목',
    question: '무엇을 보고, 어떻게 재고, 언제 fail인가',
    layer: 'signal',
    items: [
      planned('pout-gain', 'Pout과 gain', 'wiki'),
      planned('current-pae', '소비 전류와 PAE', 'wiki'),
      planned('gsm-phase-freq-error', 'GSM phase error와 frequency error', 'new'),
      planned('evm', 'EVM', 'wiki'),
      planned('orfs', 'GSM ORFS: modulation과 switching spectrum', 'new'),
      planned('aclr-sem', 'ACLR과 SEM', 'wiki'),
      planned('harmonics', 'Harmonic', 'wiki'),
      planned('spurious', 'Spurious', 'wiki'),
      planned('tx-noise-desense', 'Tx noise와 Rx desense', 'wiki'),
      planned('gain-ripple', 'Gain ripple과 band-edge 성능', 'wiki'),
      { id: 'switching-transient', title: 'Switching transient와 PvT (M1)', status: 'ready', origin: 'wiki', href: M1_HREF },
      planned('state-errors', 'Mode · MIPI · calibration 오류를 증명하는 법', 'wiki'),
      planned('noise-figure', 'Noise figure 측정', 'new'),
      planned('lna-linearity', 'LNA gain · IIP3 · P1dB', 'new'),
    ],
  },
  {
    id: 'instruments',
    number: 5,
    title: '계측기와 자동화',
    question: '장비를 어떻게 설정하고 빠르고 정확하게 읽나',
    layer: 'bench',
    items: [
      planned('signal-generator', 'Signal generator', 'wiki'),
      planned('signal-analyzer', 'Spectrum / signal analyzer', 'wiki'),
      planned('vna-calibration', 'VNA · calibration · reference plane', 'wiki'),
      planned('power-sensor', 'Power sensor: average · peak · burst', 'wiki'),
      planned('dc-supply', 'DC power supply: bias · remote sense · 전류 측정', 'wiki'),
      planned('instrument-sync', '한 test point를 여러 장비가 함께 만드는 동기화', 'wiki'),
      planned('speed-vs-accuracy', '측정 속도와 정확도: RBW · averaging · sweep time', 'new'),
      planned('scpi-patterns', 'SCPI 자동화 패턴: 상태 관리 · 에러 처리 · 타임아웃', 'new'),
    ],
  },
  {
    id: 'judgment',
    number: 6,
    title: '판정과 신뢰성',
    question: '이 값을 믿고 PASS/FAIL을 내려도 되나',
    layer: 'bench',
    items: [
      planned('bench-capability', '이 bench로 무엇을 측정할 수 있나', 'wiki'),
      planned('station-qualification', 'DUT 연결 전 station 검증', 'wiki'),
      planned('uncertainty-guardband', '불확도와 guardband 판정', 'wiki'),
      planned('stimulus-comparison', 'CW · two-tone · 변조 신호 자극의 차이', 'wiki'),
      planned('fail-ownership', 'Fail의 책임 가르기: source · DUT · analyzer', 'wiki'),
      planned('gage-rr', 'GR&R: 반복성과 재현성', 'new'),
      planned('golden-correlation', 'Golden unit과 station 간 correlation', 'new'),
    ],
  },
  {
    id: 'data-reports',
    number: 7,
    title: '데이터와 리포트',
    question: '결과를 어떤 구조로 저장하고 어떻게 보여주나',
    layer: 'data',
    items: [
      planned('limit-management', 'Limit과 스펙 관리: 버전 · 조건별 limit', 'new'),
      planned('data-model', '측정 데이터 모델: 조건 · 결과 · 메타데이터 · 추적성', 'new'),
      planned('distribution-cpk', '분포 · Cpk · 수율 읽기', 'new'),
      planned('fail-pareto', 'Fail pareto와 원인 분류', 'new'),
      planned('report-automation', '리포트 자동화: 무엇을 어떤 순서로 보여주나', 'new'),
    ],
  },
  {
    id: 'production',
    number: 8,
    title: '생산 테스트 최적화',
    question: '시간을 줄이면서 품질을 지키려면',
    layer: 'data',
    items: [
      planned('test-time', 'Test time 분석과 단축', 'new'),
      planned('sequence-optimization', '측정 순서와 상태 전환 최적화', 'new'),
      planned('multimode-flow', '멀티모드(GSM/LTE/NR) 테스트 flow 설계', 'new'),
    ],
  },
  {
    id: 'receiver-protocol',
    number: 9,
    title: '수신기와 프로토콜',
    question: '관심 분야, 1–8번 트랙 뒤에 다룰 후보',
    layer: 'later',
    items: [
      planned('channel-coding', 'Channel coding · CRC · rate matching · scrambling', 'wiki'),
      planned('receiver-bit-recovery', 'Receiver가 RF와 IQ에서 bit를 복원하는 과정', 'wiki'),
      planned('gsm-multiframe', 'GSM 26/51 multiframe과 논리 채널', 'wiki'),
      planned('gsm-burst-types', 'GSM burst 종류별 차이', 'wiki'),
      planned('lte-downlink', 'LTE downlink OFDMA', 'wiki'),
      planned('dmrs-ptrs', 'DM-RS와 PT-RS', 'wiki'),
      planned('nr-layer-mapping', 'NR PUSCH layer mapping', 'wiki'),
    ],
  },
]

export function roadmapSummary() {
  const items = ROADMAP_TRACKS.flatMap((track) => track.items)
  const laterIds = new Set(ROADMAP_TRACKS.filter((track) => track.layer === 'later').flatMap((track) => track.items.map((item) => item.id)))
  return {
    total: items.length,
    later: laterIds.size,
    core: items.length - laterIds.size,
    ready: items.filter((item) => item.status === 'ready').length,
    building: items.filter((item) => item.status === 'building').length,
  }
}
