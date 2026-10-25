import type { BenchItem } from './types'
import { VNA_SERIES, VNA_SETUP } from './vna-basics'

export const VNA_AUTOMATION: BenchItem = {
  id: 'vna-automation',
  number: 4,
  title: 'VNA 자동화: trigger · 데이터 · limit test',
  series: VNA_SERIES,
  setup: VNA_SETUP,
  summary: '프로그램에서 VNA를 쓸 때의 기본 흐름입니다. 원하는 순간에 한 번만 sweep시키고, 끝날 때까지 기다리고, 전체 trace를 가져오고, 장비 안의 limit test로 PASS/FAIL을 받습니다.',
  principle: [
    'E5071C는 채널마다 sweep을 시작하는 조건(trigger)이 있습니다. Preset의 Internal trigger는 계속 sweep합니다. 프로그램에서는 trigger source를 BUS로 두고 :TRIGger:SINGle로 한 번만 sweep한 뒤 *OPC?로 끝을 기다리는 방식이 확실합니다.',
    ':CALC:DATA:FDATa?는 화면에 보이는 형식(format)의 값 전체를 점 수 × 2개의 숫자로 돌려줍니다. Log Mag에서는 점마다 (dB, 0) 쌍입니다. 주파수 값은 별도로 읽거나 start/stop/points로 계산합니다.',
    'Limit test는 장비 안에 상한·하한 선을 정의해 두고, sweep마다 PASS/FAIL을 계산합니다. 프로그램은 :CALC:LIM:FAIL? 하나로 결과를 받을 수 있지만, 실제 값도 함께 저장해야 나중에 분석할 수 있습니다.',
    '데이터 전송 형식은 ASCII(기본)와 REAL32/REAL(이진)입니다. 점이 많을수록 이진이 빠릅니다(SG·SA 13번 항목과 같은 원리).',
  ],
  settings: [
    { name: 'Trigger Source', effect: 'Internal, External, Manual, Bus', defaultValue: 'Internal (Preset)', pitfall: 'Internal에서 FDATA를 읽으면 진행 중인 sweep의 값일 수 있음' },
    { name: 'Continuous Initiation', effect: '채널을 trigger 대기 상태로 유지', defaultValue: '채널마다 다름', pitfall: 'OFF(Hold)면 trigger를 보내도 sweep이 안 됨' },
    { name: 'Data Format', effect: 'ASCii, REAL(64-bit), REAL32', defaultValue: 'ASCii (Preset)', pitfall: '형식을 바꾼 뒤 되돌리지 않으면 다른 프로그램이 깨짐' },
    { name: 'Limit Line Table', effect: '최대 100개 선, 선마다 종류·주파수 범위·값', defaultValue: 'OFF, 비어 있음', pitfall: 'Limit test가 OFF면 FAIL?은 항상 0(PASS)을 돌려줌' },
  ],
  steps: [
    {
      id: 'bus-trigger',
      title: 'BUS trigger로 한 번만 sweep',
      actions: [
        'Trigger Source를 Bus로 둡니다. 화면 sweep이 멈춥니다.',
        '스크립트나 SCPI로 :TRIGger:SINGle 후 *OPC?를 보내면 한 번만 갱신됩니다.',
      ],
      check: '*OPC?는 sweep이 끝난 뒤에 1을 돌려줍니다.',
      record: { label: 'IFBW 1 kHz, 401점에서 :TRIG:SING + *OPC? 시간', unit: 'ms', predict: true },
    },
    {
      id: 'fdata',
      title: '전체 trace 가져오기',
      actions: ['S21 Log Mag 상태에서 :CALC1:DATA:FDAT?를 읽고 값 개수를 셉니다.'],
      check: '점 수가 401이면 802개 숫자가 옵니다. 짝수 번째(0부터)만 dB 값입니다.',
      record: { label: '받은 숫자 개수', predict: true },
    },
    {
      id: 'limit',
      title: 'Limit test로 PASS/FAIL',
      actions: [
        '감쇠기 S21에 대해 상한 (표기값 + 1 dB), 하한 (표기값 − 1 dB)을 10 MHz–3 GHz에 넣고 Limit Test를 켭니다.',
        ':CALC1:LIM:FAIL?을 읽습니다. 하한을 표기값 − 0.1 dB로 좁혀 다시 읽습니다.',
      ],
      check: '넓은 limit에서는 0(PASS), 좁힌 limit에서는 1(FAIL)이 나올 가능성이 큽니다.',
      record: { label: '좁힌 limit에서 FAIL? 결과', predict: true },
    },
  ],
  scpi: [
    { command: ':TRIGger[:SEQuence]:SOURce INTernal|EXTernal|MANual|BUS', instrument: 'VNA', purpose: 'trigger 소스 (Preset INT)', source: 'e5071c-help' },
    { command: ':INITiate1:CONTinuous ON|OFF', instrument: 'VNA', purpose: '연속 initiate', source: 'e5071c-help' },
    { command: ':TRIGger[:SEQuence]:SINGle', instrument: 'VNA', purpose: 'sweep 한 번 (끝나면 *OPC? 응답)', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:DATA:FDATa?', instrument: 'VNA', purpose: '형식 적용된 trace 전체 (점 수 × 2)', source: 'e5071c-help' },
    { command: ':FORMat:DATA ASCii|REAL|REAL32', instrument: 'VNA', purpose: '전송 형식 (Preset ASCii)', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:LIMit:DATA <n>,<type>,<start>,<stop>,<v1>,<v2>,...', instrument: 'VNA', purpose: 'Limit 선 표 (type 1 상한, 2 하한)', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:LIMit[:STATe] ON|OFF', instrument: 'VNA', purpose: 'Limit test 켜기 (Preset OFF)', source: 'e5071c-help' },
    { command: ':CALCulate1[:SELected]:LIMit:FAIL?', instrument: 'VNA', purpose: '1 = FAIL, 0 = PASS (OFF면 항상 0)', source: 'e5071c-help' },
    { command: '*OPC?', instrument: 'VNA', purpose: 'sweep 완료 대기', source: 'ieee-488.2' },
  ],
  testProgram: [
    '판정은 장비 limit test와 프로그램 계산 중 하나를 기준으로 정하고, 다른 하나는 검증용으로 씁니다. 두 결과가 다르면 limit 표가 바뀌었거나 데이터 해석이 틀린 것입니다.',
    'Limit test가 꺼져 있으면 FAIL?이 0을 돌려줍니다. 시퀀스는 :CALC:LIM?으로 켜져 있는지 확인한 뒤 결과를 믿습니다.',
    '전체 trace 데이터를 저장하면 limit이 바뀌어도 과거 데이터를 다시 판정할 수 있습니다(7번 트랙 "데이터 모델"). 저장할 때 주파수 축, 형식, cal ID를 함께 남깁니다.',
    'BUS trigger + *OPC?로 각 측정을 묶으면 측정 시간을 정확히 잴 수 있고, 생산 test time 분석(8번 트랙)의 기초 데이터가 됩니다.',
  ],
  script: 'bench/labs/lab_vna4_automation.py',
}
