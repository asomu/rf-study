import type { BenchItem } from './types'

export const SCPI_PATTERNS: BenchItem = {
  id: 'scpi-patterns',
  number: 13,
  title: 'SCPI 자동화 패턴: 상태 관리 · 에러 처리 · 타임아웃',
  summary: '1–12번에서 따로 다룬 습관을 테스트 프로그램 구조로 묶습니다. 장비 상태를 알고 시작하고, 에러와 타임아웃을 놓치지 않고, 데이터를 빠르게 가져오는 방법입니다.',
  principle: [
    '안정적인 측정 프로그램은 장비 상태를 "알려진 상태"에서 시작합니다. 방법은 두 가지입니다. *RST나 Preset 뒤에 필요한 설정을 모두 명시적으로 보내거나, 검증된 상태 파일을 불러옵니다(*RCL, :MMEMory:LOAD:STATe). 앞쪽은 코드만 보면 조건을 알 수 있고, 뒤쪽은 빠르지만 파일 관리가 필요합니다.',
    'SCPI 에러는 예외로 오지 않고 장비 에러 큐에 조용히 쌓입니다. 설정 블록마다 큐를 비울 때까지 읽고, 0이 아니면 멈추는 것이 기본입니다(1번 항목). SA 과입력은 별도 설정을 해야 큐에 들어옵니다(5번 항목).',
    'Trace 전체를 가져올 때 ASCII는 사람이 읽기 쉽지만 느리고 큽니다. :FORMat:TRACe:DATA REAL,32로 바꾸면 점 하나가 4바이트 이진수로 와서 전송이 훨씬 빠릅니다. 바이트 순서(:FORMat:BORDer)를 PC와 맞춰야 값이 맞습니다.',
    '*OPT?로 옵션을 확인하고, *IDN?으로 모델과 펌웨어를 기록하고, 측정 시간을 재서 남기면 나중에 결과가 이상할 때 원인을 빨리 좁힐 수 있습니다.',
  ],
  settings: [
    { name: '*RST + 명시 설정', effect: '코드만으로 측정 조건이 정해짐', defaultValue: '—', pitfall: '*RST가 바꾸지 않는 설정(External Gain, Trigger Out 등)이 남음' },
    { name: '*SAV / *RCL', effect: '장비 내부 레지스터에 상태 저장·불러오기', defaultValue: '—', pitfall: '누가 언제 저장했는지 장비 밖에서는 알 수 없음' },
    { name: ':MMEMory:STORe/LOAD:STATe', effect: '파일로 상태 저장·불러오기', defaultValue: '—', pitfall: '파일 버전과 장비 펌웨어가 맞지 않으면 일부 설정이 다르게 적용' },
    { name: ':FORMat:TRACe:DATA', effect: 'Trace 전송 형식 (ASCii, REAL,32, ...)', defaultValue: 'ASCii', pitfall: '형식을 바꾸고 원래대로 돌리지 않으면 다른 프로그램이 이진 데이터를 받아 깨짐' },
    { name: ':FORMat:BORDer', effect: '이진 데이터 바이트 순서 (NORMal, SWAPped)', defaultValue: 'NORMal', pitfall: 'PC(little-endian)와 맞지 않으면 엉뚱한 큰 숫자가 나옴' },
  ],
  steps: [
    {
      id: 'opt',
      title: '두 장비 옵션 목록 기록',
      actions: ['*OPT?를 SG와 SA에 보내 결과를 적습니다. 5·10·12번 항목에서 필요한 옵션(preamp, UNW, UNT, 656/657)이 있는지 표시합니다.'],
      record: { label: 'SG와 SA 옵션 목록' },
    },
    {
      id: 'bad-command',
      title: '에러 큐가 조용히 쌓이는 것 보기',
      actions: [
        'SA에 일부러 틀린 명령(:SENSe:FREQuency:CENTRE 1e9)과 범위를 벗어난 값(:SENSe:SWEep:POINts 99999)을 보냅니다.',
        ':SYSTem:ERRor?를 0이 나올 때까지 읽습니다.',
      ],
      check: '명령을 보낼 때는 아무 반응이 없고, 에러 큐에 두 개의 에러(header 오류, 범위 오류)가 남아 있습니다.',
      record: { label: '에러 큐에서 읽은 내용' },
    },
    {
      id: 'ascii-vs-binary',
      title: 'ASCII와 이진 trace 전송 비교',
      actions: ['스크립트로 points 1001과 10001에서 :TRACe:DATA? TRACE1을 ASCII와 REAL,32로 각각 받아 시간과 크기를 비교합니다.'],
      check: '점이 많을수록 이진 형식이 크게 빠릅니다. 끝나면 형식을 ASCII로 되돌립니다.',
      record: { label: '10001점에서 ASCII 대비 REAL,32 시간 비율', predict: true },
    },
    {
      id: 'save-recall',
      title: '상태 저장과 복원',
      actions: [
        'SA를 원하는 측정 조건으로 맞추고 *SAV 1. Preset한 뒤 *RCL 1.',
        'Center, span, RBW, ref level이 돌아왔는지 질의로 확인합니다.',
      ],
      check: '설정이 모두 돌아옵니다. 다만 프로그램 코드에는 그 조건이 보이지 않는다는 점을 기억합니다.',
      record: { label: '복원 후 RBW 질의 값', unit: 'Hz' },
    },
  ],
  scpi: [
    { command: '*IDN? / *OPT?', instrument: 'SG · SA', purpose: '모델 · 펌웨어 · 옵션 기록', source: 'ieee-488.2' },
    { command: '*RST / *CLS', instrument: 'SG · SA', purpose: '알려진 상태로 · 상태와 에러 큐 초기화', source: 'ieee-488.2' },
    { command: '*SAV <n> / *RCL <n>', instrument: 'SG · SA', purpose: '내부 레지스터에 상태 저장 · 복원', source: 'ieee-488.2' },
    { command: ':MMEMory:STORe:STATe <filename>', instrument: 'SA', purpose: '상태를 파일로 저장', source: 'xsa-scpi' },
    { command: ':SYSTem:ERRor[:NEXT]?', instrument: 'SG · SA', purpose: '에러 큐 읽기', source: 'xsa-scpi' },
    { command: ':FORMat[:TRACe][:DATA] ASCii|REAL,32|REAL,64|INTeger,32', instrument: 'SA', purpose: 'Trace 전송 형식', source: 'xsa-scpi' },
    { command: ':FORMat:BORDer NORMal|SWAPped', instrument: 'SA', purpose: '이진 바이트 순서', source: 'xsa-scpi' },
    { command: ':TRACe[:DATA]? TRACE1', instrument: 'SA', purpose: 'Trace 1 전체 값 읽기', source: 'xsa-scpi' },
    { command: '[:SENSe]:SWEep:POINts <integer>', instrument: 'SA', purpose: 'Trace 점 개수', source: 'xsa-scpi' },
  ],
  testProgram: [
    '장비 제어 코드는 세 층으로 나눕니다. ① 장비 드라이버(연결, write/query, 에러 확인, 타임아웃), ② 측정 함수(조건을 받아 결과를 돌려줌, 동기화 포함), ③ 테스트 시퀀스(DUT, limit, 판정, 기록). 이 저장소의 bench/rfbench가 ①과 ②의 작은 예입니다.',
    '모든 측정 결과에 함께 남길 메타데이터: 장비 *IDN?(펌웨어 포함), 측정 조건(RBW, VBW, detector, 감쇠, offset), cal 버전, 측정 시각, 소요 시간, 에러 큐 상태.',
    '예외가 나면 반드시 실행되는 정리 단계를 둡니다: SG RF Off, SA :ABORt, *CLS, 에러 큐 비우기, 이진 형식을 ASCII로 복원.',
    '상태 파일(*SAV, MMEM)을 쓰면 빠르지만, 파일 내용이 코드 리뷰에 보이지 않습니다. 쓰는 경우에는 불러온 뒤 핵심 설정을 질의해 기대값과 비교하는 검증 단계를 둡니다.',
  ],
  script: 'bench/labs/lab13_scpi_patterns.py',
}
