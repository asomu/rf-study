# M1 Review — GSM Burst / PvT Lab

**Spec:** [SPEC.md](SPEC.md)
**Reviewed:** 2026-07-15
**Verdict:** Pass — no open Blocker, High, or Medium findings

## Checklist

### Model and tests

- [x] `npm run test` passes (14/14 unit and component tests)
- [x] Golden scenarios assert pass, first/worst region, boundary, and violation groups
- [x] Deterministic sampling and invalid-input rejection covered
- [x] `npm run build` passes with route-level code splitting

### Learning flow

- [x] Prediction gate blocks evaluation until the learner predicts
- [x] Judgment (first/worst) is recorded separately from Prediction and deduplicated by parameter signature
- [x] Challenge diagnosis/evidence overwrite per scenario; retries do not inflate totals
- [x] Teach-back requires explicit confirmation, not just viewing a saved result
- [x] Teaching Snapshot includes profile ID/version, parameters, seed, and learner diagnosis/evidence

### Persistence

- [x] Stored progress is schema-validated with bounded parameters and finite values
- [x] Corrupt or out-of-range records reset safely; v1/v2 migrate to v3

### UI and accessibility

- [x] `npm run test:e2e` passes (4/4 Playwright suites)
- [x] No page-level overflow at 1440, 768, 375 px
- [x] Zero axe serious/critical violations on Learn, Lab, Challenge, Review
- [x] Keyboard-only Lab and Challenge operation
- [x] Reduced-motion preference applied from first render
- [x] Teaching Snapshot fits A4 landscape
- [x] Browser console has zero errors and warnings

### Deployable output

- [x] `npm run test:smoke` passes against production `dist` on all four hash routes
- [ ] GitHub Actions deploy succeeds — **failed on 2026-07-15 at the E2E step** (passes locally; CI logs expired)

### Content and boundary

- [x] Every chart declares units, reference, educational-mask status, first violation, worst margin
- [x] No screen uses conformance-verdict language
- [x] Korean explanations keep RF English terms

## Findings Fixed During Review

| Severity | Finding | Fix |
| --- | --- | --- |
| High | `late-ramp` and `ringing` trace regions/boundaries did not match their answer evidence | Rebuilt fixtures; assert pass, first/worst region, boundary, and violation groups for every scenario |
| High | Judgment duplicated Prediction; repeated Challenge submissions inflated Diagnosis | Post-reveal first/worst Judgment; per-scenario diagnosis/evidence records that overwrite |
| High | Shape-valid but out-of-range stored data could crash Review repeatedly | Shared bounded schema, finite validation, safe reset, v1/v2→v3 migration |
| Medium | Same Lab trace could inflate Judgment | Judgment keyed by parameter signature, gated behind an actual prediction/run |
| Medium | Reduced-motion preference read after first render | Initialized from `matchMedia` before first render, with E2E coverage |
| Medium | Teaching Snapshot lacked reproducibility data | Added profile ID/version, parameters, seed, learner diagnosis/evidence |
| Medium | Mobile controls and action order diverged from the spec | Explicit grid areas; 44 px mobile range targets |
| Medium | Dev-server tests did not prove the deployable bundle | Production `dist` preview smoke test |
| P1 | Challenge evidence select lacked an accessible name | `aria-labelledby` to its visible heading |
| P1 | Small labels missed WCAG AA contrast | Raised contrast on top strip, case tabs, headers, answer sheet |
| P1 | Mobile navigation clipped route names | Compressed brand lockup and route-label spacing at 375 px |
| P2 | No synchronized control/RF or cross-case comparison visuals | Added FIG. 02 control timeline and FIG. 03 failure atlas |
| P2 | Educational vs specification context not separated in Lab | Collapsible specification-family layer; REF START/END chart labels |
| P2 | Full chart stack loaded before route selection | Route-level lazy loading; Latin-only font assets |

## Learner-content Assessment

Appropriate for a first causal-learning module, as long as the educational/conformance boundary stays explicit.

- The sequence moves from frame → timeslot → Normal Burst to control timing, waveform symptoms, mask reading, diagnosis, and teach-back.
- Six cases cover baseline, early timing, late start, overshoot, underdamped ringing, and off-region floor rather than pass/fail alone.
- Typography is the weakest UI area: the 7–10 px instrument micro-labels are deliberately compact and need learner testing on low-density displays.

## Follow-ups

1. Fix the GitHub Actions E2E failure so Pages deploys.
2. Test micro-label readability with learners; enlarge if it slows reading.
3. Optional bench-correlation lesson with anonymized real traces and instrument/calibration/trigger/normalization metadata.
4. Pair fast and slow ramps with ORFS consequences to show the PvT–spectrum trade-off.
5. Add Vbat droop, PA bias/enable, detector/coupler, and switch-control traces as "next evidence" for fault isolation.
6. Add confidence and alternative-cause prompts; one symptom rarely proves one root cause.
7. Official numeric overlays only after the pinned context in SPEC §5 is locked and reviewed.

**M2 recommendation:** `GSM Phase Error Lab` if the goal is deeper GSM measurement reasoning; a smaller M1.1 real-trace import and provenance slice first if the near-term goal is bench applicability.
