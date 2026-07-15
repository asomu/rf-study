# M1 Model Spec — Educational GSM PvT

**Status:** Validated V1 baseline
**Profile ID:** `dcs1800-ms-gmsk-normal-educational-v1`
**Reference context:** DCS 1800, MS uplink, GMSK Normal Burst
**Verdict language:** Educational pass/fail only

## Coordinate System

- Time is expressed in microseconds (`µs`).
- Power is relative to the nominal plateau amplitude before transient terms (`dBc`).
- The useful educational reference window starts at `0 µs` and ends at `542.8 µs` (`147 × 48/13 µs`, rounded).
- The chart covers `-32 µs` through `574.8 µs` to expose both off regions.
- Samples are generated every `1 µs`, with the exact mask corner points included.

The time window is deliberately normalized for instruction. It is not a complete reproduction of a test instrument setup.

## Parameters

| Field | Unit | Range | Default | Meaning |
| --- | --- | ---: | ---: | --- |
| `rampUpUs` | µs | 10–32 | 20 | Time from off level to nominal power |
| `rampDownUs` | µs | 10–32 | 20 | Time from nominal power to off level |
| `timingOffsetUs` | µs | -10–10 | 0 | Shift applied to the full burst |
| `overshootDb` | dB | 0–4 | 0.35 | Initial excess after ramp-up |
| `settlingUs` | µs | 4–48 | 12 | Exponential decay constant |
| `ringingDb` | dB | 0–3 | 0.15 | Damped oscillation amplitude |
| `noiseFloorDbc` | dBc | -72–-22 | -62 | Off-region deterministic noise floor |
| `seed` | integer | 1–9999 | 23 | Seed for deterministic noise |

## Educational Mask

The upper and lower mask are linear between these points:

| Time (µs) | Upper (dBc) | Lower (dBc) |
| ---: | ---: | ---: |
| -32 | -30 | — |
| -20 | -30 | — |
| -18 | -29 | — |
| -16 | -17 | — |
| -14 | -11 | -44 |
| -12 | -7 | -36 |
| -10 | -4 | -30 |
| -8 | -2 | -18 |
| -6 | 0 | -12 |
| -4 | 1 | -8 |
| 0 | 1 | -6 |
| 8 | 1 | -1 |
| 534.8 | 1 | -1 |
| 542.8 | 1 | -6 |
| 546.8 | 1 | -8 |
| 548.8 | 0 | -12 |
| 550.8 | -2 | -18 |
| 552.8 | -4 | -30 |
| 554.8 | -7 | -36 |
| 556.8 | -11 | -44 |
| 558.8 | -17 | — |
| 560.8 | -29 | — |
| 562.8 | -30 | — |
| 574.8 | -30 | — |

This mask is an educational corridor chosen to make parameter causality visible. The UI must never present these values as the official 3GPP conformance mask.

## Trace Generation

1. Shift burst start/end by `timingOffsetUs`.
2. Generate ramp-up and ramp-down in linear amplitude using a cubic smoothstep, then convert to dBc.
3. Add overshoot after the shifted burst start as an exponential decay.
4. Add damped sinusoidal ringing using the same settling constant.
5. Add seeded low-amplitude noise on the plateau and around `noiseFloorDbc` in off regions.
6. Clamp output to the chart range `-80…6 dBc`.

## Evaluation

For each sample:

- Upper margin = `upperMask - trace`.
- Lower margin = `trace - lowerMask` when a lower boundary exists.
- Point margin is the smaller applicable margin.
- A negative margin is a violation.

The result contains:

- `pass`
- `worstMarginDb`
- `worstTimeUs`
- `firstViolationTimeUs`
- contiguous `violations` with region and boundary
- ranked `possibleCauses`

Violation regions are `pre-burst`, `ramp-up`, `early-settling`, `plateau`, `ramp-down`, and `post-burst`.

## Golden Scenarios

| ID | Changed parameters | Expected teaching outcome |
| --- | --- | --- |
| `baseline` | defaults | Pass |
| `early-timing` | `timingOffsetUs: -8` | Pre-burst/ramp-up violation |
| `late-ramp` | `timingOffsetUs: 10`, `rampUpUs: 10` | First/worst lower ramp-up violation |
| `overshoot` | `overshootDb: 2.8`, `settlingUs: 18` | Early-settling upper violation |
| `ringing` | `overshootDb: 1`, `ringingDb: 1.8`, `settlingUs: 34` | Repeated early-settling upper violations |
| `high-noise` | `noiseFloorDbc: -24` | Off-region upper violation |

Each scenario becomes a unit-test fixture before it is exposed as a challenge.

## Validation Gate

- All golden scenarios return their expected pass/fail state and region.
- Default trace stays inside the educational corridor with positive margin.
- Identical parameters and seed return identical samples.
- Exact mask corner points exist in the sampled trace.
- Invalid or non-finite values are rejected before simulation.
