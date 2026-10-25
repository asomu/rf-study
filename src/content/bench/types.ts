export type BenchInstrument = 'SG' | 'SA' | 'SG · SA'
export type BenchSourceId = 'ieee-488.2' | 'mxg-scpi' | 'xsa-scpi' | 'mxa-spec'

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
  summary: string
  principle: string[]
  settings: BenchSetting[]
  steps: BenchStep[]
  scpi: BenchScpi[]
  testProgram: string[]
  script?: string
}
