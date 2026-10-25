import type { BenchItem } from './types'
import { VNA_SERIES } from './vna-basics'

export const VNA_CALIBRATION: BenchItem = {
  id: 'vna-calibration',
  number: 2,
  title: 'Calibration과 기준면',
  series: VNA_SERIES,
  setup: 'E5071C 포트 1·2 → 케이블 → 보유한 cal kit(기계식 SOLT 또는 ECal)',
  summary: '보정 전 VNA 결과에는 케이블과 VNA 내부의 오차가 섞여 있습니다. 2-port SOLT 보정으로 이 오차를 걷어내고, 측정 기준면을 케이블 끝으로 옮깁니다.',
  principle: [
    'VNA 오차는 반복되는 체계적 오차입니다. 방향성 결합기가 완벽하지 않아서 생기는 directivity, 포트가 50 Ω과 완전히 맞지 않아서 생기는 source/load match, 경로마다 다른 손실과 위상인 tracking 등이 있습니다. 2-port 보정은 이것들을 12개의 오차 항으로 모델링합니다.',
    'SOLT 보정은 특성을 정확히 아는 표준(Short, Open, Load, Thru)을 차례로 연결해 재고, 그 결과로 오차 항을 계산합니다. 보정 후에는 표준을 연결했던 위치, 즉 케이블 끝이 측정의 기준면(reference plane)이 됩니다.',
    '보정은 그때의 주파수 범위, 점 수, IFBW, 포트 전력에 묶여 있습니다. 보정 후에 범위를 넓히면 보정이 꺼지거나 보간된 값을 씁니다. 그래서 측정 조건을 먼저 정하고 보정합니다.',
    'Port extension과 electrical delay는 표준을 다시 연결하지 않고 기준면을 수학적으로 옮기는 방법입니다. 손실 없는 짧은 연장에는 쓸 만하지만, 진짜 보정을 대신하지는 않습니다.',
  ],
  settings: [
    { name: 'Cal Kit', effect: '표준의 정의(지연, 손실, 커넥터 형식)', defaultValue: '장비에 저장된 kit 목록에서 선택', pitfall: '가지고 있는 kit과 다른 kit을 선택하면 보정이 조용히 틀림' },
    { name: 'Calibration Type', effect: '1-port, response, full 2-port(SOLT) 등', defaultValue: '—', pitfall: 'S21만 볼 때 response(thru) 보정만 하면 정합 오차가 남음' },
    { name: 'Correction State', effect: '보정 적용 켜기/끄기', defaultValue: 'OFF (Preset)', pitfall: '화면 왼쪽 위 Cor 표시를 확인. 조건을 바꾸면 C?(보간)나 꺼짐으로 바뀜' },
    { name: 'Port Extension', effect: '포트별 기준면을 시간 지연만큼 이동', defaultValue: 'OFF, 0 s (Preset)', pitfall: '손실이 큰 fixture에는 위상만 맞고 크기는 안 맞음' },
    { name: 'Electrical Delay', effect: 'trace에서 선형 위상을 빼서 phase를 평평하게', defaultValue: '0 s (Preset)', pitfall: '표시용 보정이라 데이터 해석 시 delay 값을 알고 있어야 함' },
  ],
  steps: [
    {
      id: 'conditions',
      title: '측정 조건 먼저 고정',
      actions: ['Start 10 MHz, Stop 3 GHz, Points 401, IFBW 1 kHz, 포트 전력 −10 dBm으로 둡니다.'],
      check: '이 조건으로 보정합니다. 나중에 바꾸면 보정이 맞지 않게 됩니다.',
    },
    {
      id: 'solt',
      title: '2-port SOLT 보정',
      actions: [
        'Cal → Cal Kit에서 보유한 kit을 선택합니다. ECal이 있으면 ECal 메뉴를 써도 됩니다.',
        'Calibrate → 2-Port Cal(포트 1, 2). 포트 1과 2에 Open, Short, Load를 차례로 연결해 재고, 두 케이블 끝을 맞대어 Thru를 잽니다. Done을 누릅니다.',
      ],
      check: '화면에 Cor 표시가 나타납니다.',
      record: { label: '보정에 쓴 kit 이름(또는 ECal 모델)' },
    },
    {
      id: 'verify-thru',
      title: '보정 확인: Thru 다시 보기',
      actions: ['두 케이블 끝을 다시 맞대고 S21 Log Mag, S11 Log Mag를 봅니다.'],
      check: 'S21은 0 dB 근처의 평평한 선(±0.1 dB 안팎), S11은 매우 낮은 값입니다. 보정 전과 비교하면 출렁임이 사라집니다.',
      record: { label: '보정 후 Thru S21 최대 편차', unit: 'dB', predict: true },
    },
    {
      id: 'cal-dependency',
      title: '조건을 바꾸면 보정이 어떻게 되나',
      actions: ['Stop을 4 GHz로 바꿔 화면의 보정 표시를 봅니다. 확인 후 3 GHz로 되돌립니다.'],
      check: '보정 범위를 벗어나면 보정이 꺼지거나 경고가 표시됩니다.',
      record: { label: 'Stop 4 GHz에서 보정 표시' },
    },
    {
      id: 'electrical-delay',
      title: 'Electrical delay로 phase 평평하게',
      actions: ['케이블 하나를 더 끼워 S21 Phase를 보고, Electrical Delay를 조정해 phase가 평평해지는 값을 찾습니다.'],
      check: '찾은 delay가 추가한 케이블의 지연입니다. 동축 케이블은 대략 4–5 ns/m입니다.',
      record: { label: '추가 케이블 delay', unit: 'ns', predict: true },
    },
  ],
  scpi: [
    { command: ':SENSe1:CORRection:COLLect:METHod:SOLT2 1,2', instrument: 'VNA', purpose: '2-port SOLT 보정 종류 선택', source: 'e5071c-help' },
    { command: ':SENSe1:CORRection:COLLect[:ACQuire]:OPEN <port>', instrument: 'VNA', purpose: 'Open 표준 측정 (뒤에 *OPC?)', source: 'e5071c-help' },
    { command: ':SENSe1:CORRection:COLLect[:ACQuire]:SHORt <port>', instrument: 'VNA', purpose: 'Short 표준 측정', source: 'e5071c-help' },
    { command: ':SENSe1:CORRection:COLLect[:ACQuire]:LOAD <port>', instrument: 'VNA', purpose: 'Load 표준 측정', source: 'e5071c-help' },
    { command: ':SENSe1:CORRection:COLLect[:ACQuire]:THRU <in>,<out>', instrument: 'VNA', purpose: 'Thru 측정 (양방향 모두)', source: 'e5071c-help' },
    { command: ':SENSe1:CORRection:COLLect:SAVE', instrument: 'VNA', purpose: '보정 계수 계산 · 적용', source: 'e5071c-help' },
    { command: ':SENSe1:CORRection:COLLect:ECAL:SOLT2 1,2', instrument: 'VNA', purpose: 'ECal로 2-port 보정', source: 'e5071c-help' },
    { command: ':SENSe1:CORRection:STATe?', instrument: 'VNA', purpose: '보정 적용 상태 (Preset OFF)', source: 'e5071c-help' },
    { command: ':SENSe1:CORRection:EXTension[:STATe] ON|OFF', instrument: 'VNA', purpose: 'Port extension (Preset OFF)', source: 'e5071c-help' },
    { command: ':SENSe1:CORRection:EXTension:PORT1:TIME <s>', instrument: 'VNA', purpose: '포트 1 extension 지연 (Preset 0)', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:CORRection:EDELay:TIME <s>', instrument: 'VNA', purpose: 'Electrical delay (Preset 0, ±10 s)', source: 'e5071c-help' },
    { command: '*OPC?', instrument: 'VNA', purpose: '표준 측정 완료 대기', source: 'ieee-488.2' },
  ],
  testProgram: [
    '보정은 측정 데이터와 같은 수준의 이력 관리가 필요합니다. 누가, 언제, 어떤 kit으로, 어떤 조건에서 보정했는지를 cal 파일과 함께 남기고, 측정 결과에 그 cal ID를 기록합니다.',
    '시퀀스 시작에서 :SENS:CORR:STAT?가 1인지, 주파수와 점 수가 cal 조건과 같은지 확인하고 다르면 측정하지 않습니다. 보정이 꺼진 채 측정한 값은 그럴듯해 보여서 위험합니다.',
    '보정 확인용 기준 부품(이 실습의 감쇠기처럼 값을 아는 부품)을 정기적으로 재서 trend를 남기면, 케이블 손상이나 커넥터 마모를 일찍 찾습니다.',
    'Port extension이나 de-embedding 값은 fixture마다 다릅니다. fixture ID와 묶어서 관리합니다.',
  ],
  script: 'bench/labs/lab_vna2_calibration.py',
}
