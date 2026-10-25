# M<n> Spec — <Module Name>

**Status:** Draft | Spec Ready | Validated (<date>)
**Primary learner:**
**Model boundary:** Educational approximation | <other>

Review results for this spec live in [REVIEW.md](REVIEW.md).

## 1. Learning Contract

What the learner can do when the module is complete. Using the simulator is not evidence by itself.

| Dimension | Completion evidence |
| --- | --- |
| Concept | |
| Prediction | |
| Judgment | |
| Diagnosis | |
| Communication | |

## 2. Content

Prerequisite check, lesson sequence, required diagrams, misconceptions to address.

## 3. Model

Units and coordinate system, parameters (unit, range, default), evaluation rules, golden scenarios. Each golden scenario becomes a unit-test fixture before it is used in a challenge.

## 4. UI

Only what differs from M1 ([docs/m1/SPEC.md](../m1/SPEC.md) §4): new routes, components, copy, chart rules.

## 5. Source Governance

Specification families referenced, and what must be pinned before any official numeric overlay.

## 6. Non-goals

## 7. Acceptance

- [ ] Golden scenarios pass as unit tests
- [ ] Learning flow gates (predict before reveal, evidence required)
- [ ] Four routes work directly and on refresh; keyboard-only operation
- [ ] No overflow at 1440 / 768 / 375 px; zero axe serious/critical
- [ ] Production `dist` smoke test passes
- [ ] Module-specific items:
