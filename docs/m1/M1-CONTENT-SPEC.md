# M1 Content Spec — GSM Burst / PvT Lab

**Status:** Validated V1 baseline
**Primary learner:** Mid-level RF Frontend Module engineer
**Secondary audience:** Junior engineers using the teaching view
**Language:** Korean explanations with RF English terms preserved
**Model boundary:** Educational approximation; not a conformance test system

## Learning Contract

The learner completes M1 only when they can:

1. Predict how a parameter change will move a GSM burst trace before running the simulation.
2. Identify the first mask violation, worst margin, and affected time region.
3. Connect the waveform symptom to likely PA/FEM control or settling causes.
4. Explain the diagnosis to a junior engineer in a short teach-back.

Building or operating the simulator alone is not evidence of mastery.

## Prerequisite Diagnostic

The module opens with five short questions covering:

- `dBm` versus `dBc`
- TDMA frame, timeslot, and burst hierarchy
- Why GMSK is treated as a constant-envelope modulation
- Why a PA cannot switch instantaneously between off and nominal power
- What a pass/fail mask means on a time-domain plot

Answers do not block entry. Incorrect answers add the relevant explanation card to the learner's Review queue.

## Lesson Sequence

### 1. Find the Burst

Visualize the hierarchy from TDMA frame to timeslot to Normal Burst. Establish the timing reference and distinguish the useful burst region from ramp and guard regions.

### 2. Why the PA Ramps

Connect GMSK, PA enable/bias control, switching transients, and spectral consequences. The learner should understand that a clean plateau does not guarantee a clean ramp.

### 3. Read a PvT Mask

Explain absolute power (`dBm`), relative power (`dBc`), the 0 dB reference, upper/lower boundaries, first violation, and worst margin. Every diagram must label axes and units.

### 4. Cause and Effect

Introduce one parameter at a time:

| Parameter | Visible effect | Likely engineering connection |
| --- | --- | --- |
| Ramp-up time | Slow/fast leading edge | Bias sequencing, control slew, PA enable path |
| Ramp-down time | Slow/fast trailing edge | Discharge path, switch timing, bias turn-off |
| Timing offset | Whole trace shifts | Trigger alignment, control sequence timing |
| Overshoot | Peak after turn-on | Loop response, control step, supply transient |
| Settling | Extended decay | Bias/supply loop bandwidth, thermal/electrical settling |
| Ringing | Repeated peaks | Underdamped control path, matching/control interaction |
| Noise floor | Off-region power rises | Leakage, measurement floor, switch isolation |

### 5. Guided Lab

The learner changes one parameter, predicts the result, and only then reveals the new trace. Feedback explains the changed region and not only the final pass/fail result.

### 6. Troubleshooting Challenge

Six scenarios train diagnosis: baseline pass, early timing, late PA start, overshoot, underdamped ringing, and high off-region noise. A response requires a diagnosis and evidence selection.

### 7. Teach-back

The review page provides a printable one-page snapshot with profile metadata, parameter values, learner diagnosis/evidence, chart, finding, and a prompt: “Why did this trace pass or fail?”

## Required Diagrams

1. Frame → Timeslot → Normal Burst hierarchy.
2. Annotated educational PvT mask with time regions and reference power.
3. Synchronized PA enable, bias, RF output, and mask timeline.
4. Parameter → waveform symptom → mask region → probable root cause map.
5. Small-multiple comparison of pass, timing, overshoot, settling, and noise failures.

## Misconceptions to Address

- `0 dBc` is not the same as `0 dBm`.
- A higher plateau power does not by itself explain a relative-mask failure.
- A pass/fail result is meaningless without a declared profile, reference, and units.
- Overshoot and timing offset can create similar first-glance failures but move different parts of the trace.
- This educational model demonstrates causality; it does not replace calibrated equipment or official conformance procedures.

## Source Governance

V1 maps the following source families but intentionally does not expose an official numeric reference profile:

- 3GPP TS 45.002 — GSM/EDGE multiplexing and multiple access on the radio path.
- 3GPP TS 45.004 — GSM/EDGE modulation.
- 3GPP TS 45.005 — GSM/EDGE radio transmission and reception.
- 3GPP TS 51.010-1 — Mobile Station conformance procedures, including power-versus-time measurement.

Before a future official reference profile is implemented, its exact release, version, section, band, power class, measurement setup, and normative/informative status must be pinned. The application shows `Educational model` and `Specification reference` as separate labels. No screen calls the current result a conformance verdict.

## Completion Evidence

| Dimension | Completion evidence |
| --- | --- |
| Concept | At least 4/5 diagnostic concepts correct after review |
| Prediction | At least 4/6 parameter-change predictions correct |
| Judgment | First violation and worst-region selection correct in 4/5 cases |
| Diagnosis | Root cause and evidence correct in 4/6 challenges |
| Communication | Teach-back checklist completed with chart and reasoning |
