# Session Log

Last updated: 2026-10-25

Use this log to preserve continuity between work sessions.

## 2026-05-05 - Documentation System Kickoff

Goal:

- Create the project documentation system before implementing the first simulator.
- Establish a project map that can keep future ideas and features consistent.

Progress:

- Confirmed the project should use Markdown as the source of truth and Notion as a possible mirror/dashboard later.
- Defined the initial document set.
- Connected the 18-month RF growth goal to app features and learning modules.

Decisions:

- Source of truth is repo Markdown.
- Initial document set should stay compact and living.
- First app module is `GSM Burst/PvT Lab`.
- V1 simulator should use educational approximation.

New ideas:

- GSM Phase Error Lab
- EDGE IQ/EVM Lab
- ORFS/Spectrum Lab
- LTE/NR ACLR/EVM Lab
- Mode Switching State Machine Lab
- Production Test Flow Optimizer
- Teaching Mode
- Measurement Data Import

Blocked:

- None.

Next actions:

- Draft the implementation-ready spec for `GSM Burst/PvT Lab`.
- Choose the initial web app stack and folder structure.
- Define simulator inputs, outputs, graph behavior, and pass/fail evaluation rules.

## 2026-07-15 - M1 GSM Burst/PvT Lab Validation

Goal:

- Audit the project and RF learning content, then implement the agreed M1 vertical slice.

Progress:

- Built the Vite/React/TypeScript application with Learn, Lab, Challenge, and Review routes.
- Added a deterministic educational PvT model, mask evaluation, six diagnostic cases, and local learning evidence.
- Added hierarchy, control-sequence, failure-atlas, source-reference, and accessible chart/table explanations.
- Added unit/component tests, Playwright flow/responsive/print tests, and axe accessibility checks.
- Completed a six-pillar UI review with no blocking findings.

Decisions:

- Official conformance values remain out of scope until exact specification versions and sections are locked.
- M1 completion requires explicit teach-back confirmation, not merely viewing a saved result.
- Hash routing and relative assets keep the static build compatible with GitHub Pages.

Blocked:

- None for M1 V1.

Next actions:

- Gather learner evidence and RF engineer feedback.
- Decide whether M2 should be Phase Error or an M1 real-measurement import extension.

## 2026-10-25 - Status Check, Documentation Slimming, Roadmap Home

Goal:

- Check project state after a three-month pause and lighten the documentation workflow.

Progress:

- Confirmed locally: 14/14 unit tests, 4/4 E2E, and build pass.
- Found the 2026-07-15 GitHub Actions deploy failed at the E2E step; logs expired, so the cause is unknown.
- Published the `dist` build as a private Claude Artifact.
- Merged `.planning/` GSD artifacts and the three `docs/m1/M1-*` files into `docs/m1/SPEC.md` and `docs/m1/REVIEW.md`; added `docs/templates/`.

- Pushed to origin. The re-run deploy failed at E2E: axe `color-contrast` on Learn (15 elements, e.g. `.section-number`, `.cause-header`, `.tail`) and Lab. Passes locally.
- Reviewed rf-wiki (96 items) as a topic inventory.
- Rebuilt the roadmap as nine tracks (78 items) in `src/content/roadmap.ts` and added the roadmap home at `#/`; M1 routes unchanged, with a back link to the roadmap.
- Unit 23/23 and E2E 5/5 pass locally.

Decisions:

- D-20261025-01: one spec and one review per module.
- D-20261025-02: nine-track roadmap with a home map; rf-wiki contributes topic names only.

- Found the CI failure's root cause: the axe E2E only waited for `#main-content`, which is visible while a lazy route shows its loading fallback, so locally axe scanned the loading screen and always passed. With the wait fixed, Learn had 16 and Lab 26 real color-contrast violations. Fixed the test wait and the muted text colors; all five pages scan clean.

- CI run 40158505500 passed unit, E2E, build and smoke for the first time, then stopped at "Configure GitHub Pages": Pages is not enabled on `asomu/rf-study` (API 404).

- With the owner's approval (public site is fine), enabled Pages with source "GitHub Actions". Run 40160392636 passed and deployed; https://asomu.github.io/rf-study/ serves the roadmap home and M1 with no console errors.

Blocked:

- None.

Next actions:
- Pick the first roadmap item to fill and set it to `building` in `roadmap.ts`.
- Extend axe to post-interaction states (Lab after a run, Review with evidence).
- After the SG + SA series: waveforms on SG and SA (generation, measurement, signal types and principles). Logged in `docs/IDEA_BACKLOG.md`.

## 2026-10-25 - SG + SA Bench Series, Item 01

Goal:

- Start instrument mastery with hands-on SG + SA practice over the thru path, one item at a time.

Progress:

- Bench: N5182B MXG → cable → fixed attenuator → N9020B MXA, controlled from a separate lab PC.
- Wrote `docs/bench/SPEC.md`: item format (principle, settings, thru steps with predict/measure, SCPI, test-program view), safety contract, script conventions, 13-item order.
- Verified commands against Keysight documents: MXG SCPI Command Reference N5180-90057 (2016) and X-Series SA Mode Reference N9060-90027 (2014, N9020A; recheck on N9020B firmware). N9020B max safe input +30 dBm from Specifications Guide 9018-04846.
- Built `#/bench/:itemId` with item 01 "연결과 안전"; records saved under `rf-study:bench:v1`.
- Added `bench/` Python package: dry-run by default, SG user power max before RF on, RF off in `finally`, error queue checks. Six fake-transport tests, also run in CI.
- Track 5 now holds the 13-item SG + SA group; "측정 속도와 정확도" and "SCPI 자동화 패턴" were folded into it.

Decisions:

- Bench items are data files rendered by one page, not modules with their own SPEC/REVIEW.

Blocked:

- None. The script has not run on real instruments yet.

Next actions:

- Run `python3 -m labs.lab01_connection` (dry-run, then `--live`) on the lab PC and fill the app's record fields.

## 2026-10-25 - SG + SA Bench Series 02–13

Goal:

- The learner is away from the bench and wants all track 5 material ready before practising.

Progress:

- Built bench items 02–13 (CW/marker, SA axes, RBW/VBW, attenuation/overload, detector/averaging, power accuracy, SG harmonics, phase noise, zero span, trigger/sync, modulated signal, SCPI patterns) with a page and a dry-run script each.
- Every SCPI command was checked in N5180-90057 (MXG) or N9060-90027 (X-Series SA). Option-dependent parts check `*OPT?`: SA preamp, SG UNW (pulse), SG UNT (AM), SG 656/657 (ARB, front panel only).
- Notable facts for test programs: SA input overload is not in the SCPI error queue unless `:SYSTem:ERRor:OVERload ON`; External Gain for a pad is entered as a negative value and survives Preset; MXG `*RST` leaves Mod On.
- Moved shared script steps into `bench/rfbench` and added one safety test that every lab must pass (power limit before RF on, RF off at the end and after a failure, no PyVISA in dry run).
- E2E now scans all 13 bench pages for axe violations and mobile overflow.

Decisions:

- Material may be prepared ahead of bench practice (bench SPEC §6 updated).

Blocked:

- Remaining track 5 items (VNA, power sensor, DC supply, multi-instrument sync) need the learner's instrument models.

Next actions:

- Practise items 01–13 on the lab bench; paste results back to review.
- Get instrument models for the remaining track 5 items.
- Start M1 learner evidence: challenges and the 90-second teach-back.
