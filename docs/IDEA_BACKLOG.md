# Idea Backlog

Last updated: 2026-10-25

Ideas land here first. Accepted topics become items in [`src/content/roadmap.ts`](../src/content/roadmap.ts); this file keeps only what is not on the roadmap yet.

## Backlog States

| State | Meaning |
| --- | --- |
| Raw | Captured without evaluation |
| Shaping | Needs clarification or smaller scope |
| Candidate | Likely useful and waiting for timing |
| Parked | Valuable but not near-term |

## Ideas

| Idea | State | Why it matters | Notes |
| --- | --- | --- | --- |
| Waveforms on SG and SA (requested 2026-10-25, after the SG+SA bench series) | Candidate | How the N5182B generates waveforms (CW, analog modulation, ARB/IQ playback) and how the N9020B measures them; signal types and their principles | Next series after SG+SA bench basics; likely bench items plus links to track 3 signal items |
| Per-item learning progress on home | Candidate | Shows learned vs only built | Needs a progress model shared across modules |
| Measurement data import | Parked | Compare models with real CSV/log data | Natural fit with track 7 once the data model item exists |
| Teaching snapshot for every module | Candidate | Reusable explanation material | M1 has a print snapshot; reuse the pattern |
| Mode switching state-machine lab | Raw | Glitch, sequencing, bias settling | May become a lab for `mipi-rffe` and `gain-mode-bias` |

## Intake Template

```markdown
## Idea: <name>

State:

Test-program value:

Possible app artifact:

Risks / scope notes:

Decision:
```
