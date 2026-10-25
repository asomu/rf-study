import { CONNECTION_SAFETY } from './connection-safety'
import type { BenchItem, BenchSourceId } from './types'

export type { BenchItem } from './types'

export const BENCH_SOURCES: Record<BenchSourceId, string> = {
  'ieee-488.2': 'IEEE 488.2 공통 명령 (두 장비 매뉴얼에 모두 수록)',
  'mxg-scpi': 'Keysight X-Series Signal Generators SCPI Command Reference, N5180-90057 (2016)',
  'xsa-scpi': 'Keysight X-Series Signal Analyzer, Spectrum Analyzer Mode User\'s & Programmer\'s Reference, N9060-90027 (2014, N9020A 기준 — 펌웨어에서 재확인)',
  'mxa-spec': 'Keysight N9020B MXA Specifications Guide, 9018-04846',
}

export const BENCH_ITEMS: BenchItem[] = [CONNECTION_SAFETY]

export function getBenchItem(id: string | undefined): BenchItem | undefined {
  return BENCH_ITEMS.find((item) => item.id === id)
}
