# M1 Spec — GSM Burst / PvT Lab

**Status:** Validated V1 baseline (2026-07-15)
**Primary learner:** Mid-level RF Frontend Module engineer
**Secondary audience:** Junior engineers using the teaching view
**Language:** Korean explanations with RF English terms preserved
**Profile ID:** `dcs1800-ms-gmsk-normal-educational-v1` — DCS 1800, MS uplink, GMSK Normal Burst
**Model boundary:** Educational approximation; not a conformance test system

Review results for this spec live in [REVIEW.md](REVIEW.md).

## 1. Learning Contract

Deliver one complete learning loop: concept orientation → prediction → simulation → fault diagnosis → teach-back.

The learner completes M1 only when they can:

1. Predict how a parameter change will move a GSM burst trace before running the simulation.
2. Identify the first mask violation, worst margin, and affected time region.
3. Connect the waveform symptom to likely PA/FEM control or settling causes.
4. Explain the diagnosis to a junior engineer in a short teach-back.

Building or operating the simulator alone is not evidence of mastery.

| Dimension | Completion evidence |
| --- | --- |
| Concept | At least 4/5 diagnostic concepts correct after review |
| Prediction | At least 4/6 parameter-change predictions correct |
| Judgment | First violation and worst-region selection correct in 4/5 cases |
| Diagnosis | Root cause and evidence correct in 4/6 challenges |
| Communication | Teach-back checklist completed with chart and reasoning |

## 2. Content

### Prerequisite Diagnostic

Five short questions:

- `dBm` versus `dBc`
- TDMA frame, timeslot, and burst hierarchy
- Why GMSK is treated as a constant-envelope modulation
- Why a PA cannot switch instantaneously between off and nominal power
- What a pass/fail mask means on a time-domain plot

Answers do not block entry. Incorrect answers add the relevant explanation card to the learner's Review queue.

### Lesson Sequence

1. **Find the Burst** — TDMA frame → timeslot → Normal Burst (148 bits + 8.25-bit guard). Establish the timing reference and separate the useful burst region from ramp and guard regions.
2. **Why the PA Ramps** — GMSK, PA enable/bias control, switching transients, and spectral consequences. A clean plateau does not guarantee a clean ramp.
3. **Read a PvT Mask** — absolute power (`dBm`), relative power (`dBc`), the 0 dB reference, upper/lower boundaries, first violation, worst margin. Every diagram labels axes and units.
4. **Cause and Effect** — one parameter at a time:

   | Parameter | Visible effect | Likely engineering connection |
   | --- | --- | --- |
   | Ramp-up time | Slow/fast leading edge | Bias sequencing, control slew, PA enable path |
   | Ramp-down time | Slow/fast trailing edge | Discharge path, switch timing, bias turn-off |
   | Timing offset | Whole trace shifts | Trigger alignment, control sequence timing |
   | Overshoot | Peak after turn-on | Loop response, control step, supply transient |
   | Settling | Extended decay | Bias/supply loop bandwidth, thermal/electrical settling |
   | Ringing | Repeated peaks | Underdamped control path, matching/control interaction |
   | Noise floor | Off-region power rises | Leakage, measurement floor, switch isolation |

5. **Guided Lab** — change one parameter, predict, then reveal. Feedback explains the changed region, not only pass/fail.
6. **Troubleshooting Challenge** — six scenarios (see Golden Scenarios). A response requires a diagnosis and evidence selection.
7. **Teach-back** — printable one-page snapshot with profile metadata, parameter values, learner diagnosis/evidence, chart, finding, and the prompt “Why did this trace pass or fail?”

### Required Diagrams

1. Frame → Timeslot → Normal Burst hierarchy.
2. Annotated educational PvT mask with time regions and reference power.
3. Synchronized PA enable, bias, RF output, and mask timeline.
4. Parameter → waveform symptom → mask region → probable root cause map.
5. Small-multiple comparison of pass, timing, overshoot, settling, and noise failures.

### Misconceptions to Address

- `0 dBc` is not the same as `0 dBm`.
- A higher plateau power does not by itself explain a relative-mask failure.
- A pass/fail result is meaningless without a declared profile, reference, and units.
- Overshoot and timing offset can create similar first-glance failures but move different parts of the trace.
- This educational model demonstrates causality; it does not replace calibrated equipment or official conformance procedures.

## 3. Model

### Coordinate System

- Time is in microseconds (`µs`).
- Power is relative to the nominal plateau amplitude before transient terms (`dBc`).
- The educational reference window runs from `0 µs` to `542.8 µs` (`147 × 48/13 µs`, rounded).
- The chart covers `-32 µs` through `574.8 µs` to expose both off regions.
- Samples are generated every `1 µs`, with the exact mask corner points included.

The time window is normalized for instruction. It is not a reproduction of a test instrument setup.

### Parameters

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

### Educational Mask

Upper and lower mask are linear between these points:

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

This corridor is chosen to make parameter causality visible. The UI must never present these values as the official 3GPP conformance mask.

### Trace Generation

1. Shift burst start/end by `timingOffsetUs`.
2. Generate ramp-up and ramp-down in linear amplitude using a cubic smoothstep, then convert to dBc.
3. Add overshoot after the shifted burst start as an exponential decay.
4. Add damped sinusoidal ringing using the same settling constant.
5. Add seeded low-amplitude noise on the plateau and around `noiseFloorDbc` in off regions.
6. Clamp output to the chart range `-80…6 dBc`.

### Evaluation

Per sample: upper margin = `upperMask - trace`; lower margin = `trace - lowerMask` where a lower boundary exists; point margin is the smaller applicable margin; a negative margin is a violation.

The result contains `pass`, `worstMarginDb`, `worstTimeUs`, `firstViolationTimeUs`, contiguous `violations` with region and boundary, and ranked `possibleCauses`.

Violation regions: `pre-burst`, `ramp-up`, `early-settling`, `plateau`, `ramp-down`, `post-burst`.

### Golden Scenarios

| ID | Changed parameters | Expected teaching outcome |
| --- | --- | --- |
| `baseline` | defaults | Pass |
| `early-timing` | `timingOffsetUs: -8` | Pre-burst/ramp-up violation |
| `late-ramp` | `timingOffsetUs: 10`, `rampUpUs: 10` | First/worst lower ramp-up violation |
| `overshoot` | `overshootDb: 2.8`, `settlingUs: 18` | Early-settling upper violation |
| `ringing` | `overshootDb: 1`, `ringingDb: 1.8`, `settlingUs: 34` | Repeated early-settling upper violations |
| `high-noise` | `noiseFloorDbc: -24` | Off-region upper violation |

Each scenario becomes a unit-test fixture before it is exposed as a challenge.

## 4. UI

**Aesthetic:** Industrial RF bench × annotated engineering notebook. Primary viewport 1440×900; also 768×1024 and 375×812.

### Routes and Layout

- Hash routes: `#/modules/gsm-pvt/{learn,lab,challenge,review}`. The shell keeps module identity, step progress, and the educational-model warning visible.
- Desktop: 228 px navigation rail, flexible workspace with the plot as focal point, 320 px control/diagnosis rail in Lab and Challenge, 760 px reading measure.
- Tablet: compact top rail; chart full width, controls below in two columns.
- Mobile: one column — chart/reference → controls → prediction/run → first/worst judgment → verdict/reasoning. Full-width labelled inputs; no precision interaction depends on dragging. The plot may scroll internally, with a data-table alternative.

### Tokens

| Role | Value |
| --- | --- |
| Instrument background | `#0b1113` |
| Raised panel | `#131c1f` |
| Notebook surface | `#ece4d2` |
| Primary ink | `#172024` |
| Signal teal | `#5ed5c3` |
| Mask amber | `#f4b942` |
| Failure coral | `#ff6b5d` |
| Muted steel | `#809296` |

IBM Plex Mono for display/labels, Chivo for reading, tabular numerals for values. Spacing 4/8/12/16/24/32/48/64 px. Radius 2 px controls, 6 px panels.

### Interaction Rules

- Dirty parameters hide the chart preview until a prediction is submitted.
- After the trace is revealed, the learner records first result and worst region before the explanation appears.
- Undo restores the previous evaluated parameter set; invalid input shows an inline error with the valid range and keeps the prior result.
- Challenge answers (correct or not) show rationale and never block progression.

### Copy

| Use | Text |
| --- | --- |
| Primary action | `예측을 제출하고 실행` |
| Reveal | `결과와 원인 보기` |
| Reset | `기준 파형으로 복원` |
| Pass / Fail | `교육용 마스크 통과` / `교육용 마스크 이탈` |
| Warning | `이 결과는 학습용 근사이며 적합성 판정이 아닙니다.` |
| Empty review | `아직 저장된 진단이 없습니다. Lab에서 첫 실험을 완료해 보세요.` |
| Storage recovery | `저장된 학습 기록을 읽을 수 없어 안전하게 초기화했습니다.` |

### Chart

- Both axes always show units; pass/fail never relies on color alone.
- Upper/lower mask: amber dashed lines with direct labels. Violations: coral bands plus a text list. Baseline: muted dotted line.
- Tooltip: time, trace power, applicable mask, margin.
- Screen readers get a summary and an expandable table of significant points.

### Accessibility

WCAG 2.2 AA contrast, full keyboard operation with visible focus, 44×44 px mobile targets, `prefers-reduced-motion` removes sweep/reveal animation, SVG has a text alternative with the same data in HTML.

## 5. Source Governance

V1 maps these source families but exposes no official numeric reference profile:

- 3GPP TS 45.002 — multiplexing and multiple access on the radio path.
- 3GPP TS 45.004 — modulation.
- 3GPP TS 45.005 — radio transmission and reception.
- 3GPP TS 51.010-1 — MS conformance procedures, including power-versus-time.

A future official profile needs its release, version, section, band, power class, measurement setup, normalization rule, and normative/informative status pinned, plus RF expert review. The app labels `Educational model` and `Specification reference` separately and never calls a result a conformance verdict.

## 6. Non-goals

- Official 3GPP conformance limits or verdicts.
- Calibrated instrument correlation.
- Backend accounts, cloud sync, or real measurement import.

## 7. Acceptance

- [ ] All golden scenarios return their expected pass/fail, first/worst region, and boundary.
- [ ] Default trace stays inside the corridor with positive margin; identical parameters and seed give identical samples; exact mask corners are sampled.
- [ ] Invalid or non-finite values are rejected before simulation.
- [ ] Parameter changes are not evaluated until the learner predicts.
- [ ] Challenge answers require diagnosis and trace evidence; Review separates the five evidence dimensions.
- [ ] All four routes work directly and on refresh; Lab is completable by keyboard only.
- [ ] No page-level horizontal overflow at 1440, 768, 375 px.
- [ ] No axe serious/critical violations on the four routes.
- [ ] Verdict and first violation are readable without opening a tooltip.
- [ ] Teaching Snapshot fits one A4 landscape page.

All items passed on 2026-07-15 — see [REVIEW.md](REVIEW.md).
