import { CONNECTION_SAFETY } from './connection-safety'
import { CW_MARKER } from './cw-marker'
import { SA_AXES } from './sa-axes'
import { RBW_VBW_NOISE } from './rbw-vbw-noise'
import { ATTENUATION_OVERLOAD } from './attenuation-overload'
import { DETECTOR_AVERAGING } from './detector-averaging'
import { POWER_ACCURACY } from './power-accuracy'
import { SG_HARMONICS_SPURIOUS } from './sg-harmonics-spurious'
import { PHASE_NOISE } from './phase-noise'
import { ZERO_SPAN } from './zero-span'
import { TRIGGER_SYNC } from './trigger-sync'
import { MODULATED_SIGNAL } from './modulated-signal'
import { SCPI_PATTERNS } from './scpi-patterns'
import type { BenchItem, BenchSourceId } from './types'

export type { BenchItem } from './types'

export const BENCH_SOURCES: Record<BenchSourceId, string> = {
  'ieee-488.2': 'IEEE 488.2 공통 명령 (두 장비 매뉴얼에 모두 수록)',
  'mxg-scpi': 'Keysight X-Series Signal Generators SCPI Command Reference, N5180-90057 (2016)',
  'xsa-scpi': 'Keysight X-Series Signal Analyzer, Spectrum Analyzer Mode User\'s & Programmer\'s Reference, N9060-90027 (2014, N9020A 기준 — 펌웨어에서 재확인)',
  'mxa-spec': 'Keysight N9020B MXA Specifications Guide, 9018-04846',
}

export const BENCH_ITEMS: BenchItem[] = [
  CONNECTION_SAFETY,
  CW_MARKER,
  SA_AXES,
  RBW_VBW_NOISE,
  ATTENUATION_OVERLOAD,
  DETECTOR_AVERAGING,
  POWER_ACCURACY,
  SG_HARMONICS_SPURIOUS,
  PHASE_NOISE,
  ZERO_SPAN,
  TRIGGER_SYNC,
  MODULATED_SIGNAL,
  SCPI_PATTERNS,
]

export function getBenchItem(id: string | undefined): BenchItem | undefined {
  return BENCH_ITEMS.find((item) => item.id === id)
}
