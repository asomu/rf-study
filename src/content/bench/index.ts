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
import { VNA_BASICS } from './vna-basics'
import { VNA_CALIBRATION } from './vna-calibration'
import { VNA_MEASURE_PAD } from './vna-measure-pad'
import { VNA_AUTOMATION } from './vna-automation'
import { PM_ZERO_AVERAGE } from './pm-zero-average'
import { PM_BURST_DUTY } from './pm-burst-duty'
import { PM_PATH_CAL } from './pm-path-cal'
import { PS_LIMITS_PROTECTION } from './ps-limits-protection'
import { PS_REMOTE_SENSE } from './ps-remote-sense'
import { PS_CURRENT_MEASURE } from './ps-current-measure'
import { INSTRUMENT_SYNC } from './instrument-sync'
import type { BenchItem, BenchSourceId } from './types'

export type { BenchItem } from './types'

export const BENCH_SOURCES: Record<BenchSourceId, string> = {
  'ieee-488.2': 'IEEE 488.2 공통 명령 (두 장비 매뉴얼에 모두 수록)',
  'mxg-scpi': 'Keysight X-Series Signal Generators SCPI Command Reference, N5180-90057 (2016)',
  'xsa-scpi': 'Keysight X-Series Signal Analyzer, Spectrum Analyzer Mode User\'s & Programmer\'s Reference, N9060-90027 (2014, N9020A 기준 — 펌웨어에서 재확인)',
  'mxa-spec': 'Keysight N9020B MXA Specifications Guide, 9018-04846',
  'e5071c-help': 'Keysight E5071C ENA online help, programming command reference (helpfiles.keysight.com/csg/e5071c)',
  'e5071c-spec': 'Keysight E5071C ENA Data Sheet, 5989-5479EN (2014)',
  'u2000-pg': 'Keysight U2000 Series USB Power Sensors Programming Guide, 9018-01701 — 같은 Keysight 파워센서 명령 체계, U2053XA에서 재확인',
  'u2050-spec': 'Keysight U2040/50/60 and L2050/60 X-Series Data Sheet, 5992-0040',
  'n6700c-osg': 'Keysight N6700C Low-Profile Modular Power System Operating and Service Guide',
}

export const SG_SA_SERIES = 'SG + SA 쓰루 실습'
export const SG_SA_SETUP = 'N5182B MXG → 케이블 → 감쇠기 → N9020B MXA'

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
  VNA_BASICS,
  VNA_CALIBRATION,
  VNA_MEASURE_PAD,
  VNA_AUTOMATION,
  PM_ZERO_AVERAGE,
  PM_BURST_DUTY,
  PM_PATH_CAL,
  PS_LIMITS_PROTECTION,
  PS_REMOTE_SENSE,
  PS_CURRENT_MEASURE,
  INSTRUMENT_SYNC,
]

export function getBenchItem(id: string | undefined): BenchItem | undefined {
  return BENCH_ITEMS.find((item) => item.id === id)
}
