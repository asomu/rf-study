export type BenchInstrument = 'SG' | 'SA' | 'SG · SA' | 'VNA' | '파워센서' | 'DC 전원' | '공통'
export type BenchSourceId =
  | 'ieee-488.2'
  | 'mxg-scpi'
  | 'xsa-scpi'
  | 'mxa-spec'
  | 'e5071c-help'
  | 'e5071c-spec'
  | 'u2000-pg'
  | 'u2050-spec'
  | 'n6700c-osg'

export interface BenchSetting {
  name: string
  effect: string
  defaultValue: string
  pitfall: string
}

export interface BenchRecordField {
  label: string
  unit?: string
  /** Ask for a prediction before the measured value. */
  predict?: boolean
}

export interface BenchStep {
  id: string
  title: string
  actions: string[]
  /** Shown under the record fields; what a correct result looks like. */
  check?: string
  record?: BenchRecordField
}

export interface BenchScpi {
  command: string
  instrument: BenchInstrument
  purpose: string
  source: BenchSourceId
}

export interface BenchItem {
  id: string
  number: number
  title: string
  /** Series name shown above the title. Defaults to the SG + SA thru series. */
  series?: string
  /** Bench wiring shown in the header. Defaults to the SG + SA thru path. */
  setup?: string
  summary: string
  principle: string[]
  settings: BenchSetting[]
  steps: BenchStep[]
  scpi: BenchScpi[]
  testProgram: string[]
  script?: string
}
