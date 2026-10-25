import type { BenchItem } from './types'

export const DETECTOR_AVERAGING: BenchItem = {
  id: 'detector-averaging',
  number: 6,
  title: 'Detector와 averaging',
  summary: 'trace 점 하나에는 여러 측정값이 들어 있습니다. detector는 그중 무엇을 보여줄지 정하고, averaging은 여러 sweep을 어떻게 합칠지 정합니다. 잡음과 변조 신호에서 결과가 크게 달라집니다.',
  principle: [
    '한 trace 점은 span ÷ (points − 1) 폭의 구간(bucket)을 대표합니다. 그 구간에서 실제로는 많은 값이 측정되는데, detector가 하나를 고릅니다. Peak(Positive)는 최댓값, Negative는 최솟값, Sample은 구간의 한 값, Normal은 상황에 따라 peak와 negative를 번갈아, Average는 구간 평균입니다.',
    'CW처럼 안정된 신호는 어떤 detector로 봐도 거의 같은 레벨입니다. 잡음이나 변조 신호처럼 값이 흔들리는 신호는 detector마다 다릅니다. Peak는 높게, Sample은 들쭉날쭉하게, Average(RMS)는 실제 전력에 맞게 보여줍니다.',
    'Average detector의 평균 방식(Average Type)도 결과를 바꿉니다. Power(RMS)는 전력을 평균하므로 잡음과 변조 신호의 실제 전력을 줍니다. Log-Power는 dB 값을 평균하므로 잡음을 약 2.5 dB 낮게 보여줍니다. 잡음의 진폭 분포 때문에 생기는 차이입니다.',
    'Trace Type은 여러 sweep을 합치는 방식입니다. Clear/Write는 매번 새로, Average는 N번 평균, Max Hold는 최댓값을 계속 유지합니다. Max Hold는 간헐적으로 나타나는 spur를 잡을 때 씁니다.',
  ],
  settings: [
    { name: 'Detector', effect: 'bucket 안의 어떤 값을 trace 점으로 쓸지', defaultValue: 'Auto (Normal이 일반적)', pitfall: '잡음이나 변조 신호를 Peak로 읽으면 실제 전력보다 높게 나옴' },
    { name: 'Average Type', effect: 'Average detector와 trace averaging의 평균 방식', defaultValue: 'Auto, Log-Pwr (Preset LOG)', pitfall: '잡음 전력을 LOG 평균으로 재면 약 2.5 dB 낮게 나옴' },
    { name: 'Trace Type', effect: 'Clear/Write, Average, Max Hold, Min Hold', defaultValue: 'Clear/Write', pitfall: 'Max Hold를 켠 채 조건을 바꾸면 이전 조건의 최댓값이 남아 있음' },
    { name: 'Average Count', effect: 'Trace Average에서 합칠 sweep 수', defaultValue: '장비 기본값', pitfall: '횟수만큼 측정 시간이 곱해짐' },
  ],
  steps: [
    {
      id: 'cw-detectors',
      title: 'CW에서는 detector가 거의 상관없음',
      actions: [
        'SG: 1 GHz, −10 dBm CW. SA: Center 1 GHz, Span 1 MHz, RBW 10 kHz.',
        'Detector를 Peak, Sample, Average 순서로 바꾸며 신호 peak 레벨을 읽습니다.',
      ],
      check: '세 값이 0.1 dB 안쪽으로 거의 같습니다.',
      record: { label: 'Peak와 Average detector의 CW 레벨 차이', unit: 'dB', predict: true },
    },
    {
      id: 'noise-detectors',
      title: '잡음에서는 detector가 크게 다름',
      actions: [
        'SG RF Off. marker를 1 GHz에 고정합니다.',
        'Detector Peak, Sample, Average(Power RMS)에서 marker 레벨을 각각 읽습니다.',
      ],
      check: 'Peak가 가장 높고, Sample은 sweep마다 흔들리고, Average(RMS)가 그 사이에 안정적으로 나옵니다.',
      record: { label: 'Peak − Average(RMS) 차이', unit: 'dB', predict: true },
    },
    {
      id: 'log-vs-rms',
      title: 'LOG 평균과 RMS 평균 비교',
      actions: [
        'Average detector에서 Average Type을 Power(RMS)와 Log-Pwr로 바꿔가며 같은 위치의 잡음 레벨을 읽습니다. Trace Average 20회를 켜서 값을 안정시킵니다.',
      ],
      check: 'RMS가 LOG보다 약 2.5 dB 높게 나옵니다.',
      record: { label: 'RMS − LOG 차이', unit: 'dB', predict: true },
    },
    {
      id: 'max-hold',
      title: 'Max Hold로 흔들리는 신호 붙잡기',
      actions: [
        'SG RF On, Trace Type을 Max Hold로 둡니다.',
        'SG 주파수를 1 GHz → 1.0002 GHz → 0.9998 GHz로 바꿨다가 되돌립니다.',
      ],
      check: '지나간 세 위치가 모두 화면에 남습니다. Clear/Write로 바꾸면 현재 위치만 남습니다.',
      record: { label: 'Max Hold에 남은 peak 개수', predict: true },
    },
  ],
  scpi: [
    { command: '[:SENSe]:DETector:TRACe[1] AVERage|NEGative|NORMal|POSitive|SAMPle', instrument: 'SA', purpose: 'trace 1 detector 선택', source: 'xsa-scpi' },
    { command: '[:SENSe]:DETector:TRACe[1]:AUTO ON|OFF', instrument: 'SA', purpose: 'detector Auto 선택', source: 'xsa-scpi' },
    { command: '[:SENSe]:AVERage:TYPE RMS|LOG|SCALar', instrument: 'SA', purpose: '평균 방식 (Preset LOG)', source: 'xsa-scpi' },
    { command: '[:SENSe]:AVERage:TYPE:AUTO ON|OFF', instrument: 'SA', purpose: '평균 방식 Auto (Preset ON)', source: 'xsa-scpi' },
    { command: ':TRACe[1]:TYPE WRITe|AVERage|MAXHold|MINHold', instrument: 'SA', purpose: 'trace 합치는 방식', source: 'xsa-scpi' },
    { command: '[:SENSe]:AVERage:COUNt <integer>', instrument: 'SA', purpose: 'trace averaging 횟수', source: 'xsa-scpi' },
  ],
  testProgram: [
    'Channel power, ACLR, noise처럼 전력을 재는 항목은 Average detector와 Power(RMS) 평균을 명시합니다. Auto나 Log 평균에 맡기면 수 dB 차이가 날 수 있습니다.',
    'Spurious 검색처럼 "어떤 성분이라도 limit을 넘는지"를 보는 항목은 Peak detector가 보수적입니다. 측정 목적이 판정 방식을 정합니다.',
    'Trace averaging은 반복성을 높이지만 측정 시간이 횟수만큼 늘어납니다. GR&R(6번 트랙) 데이터를 보고 필요한 최소 횟수를 정합니다.',
    'Max Hold는 시작 전에 trace를 지워야 합니다. 이전 측정의 최댓값이 남아 다음 DUT 결과에 섞이는 버그가 흔합니다.',
  ],
  script: 'bench/labs/lab06_detector_averaging.py',
}
