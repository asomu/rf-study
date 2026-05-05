# Idea Backlog

Last updated: 2026-05-05

This file captures ideas before they become roadmap work.

An idea should move to `docs/ROADMAP.md` only when:

- it supports the 18-month RF growth goal
- it has a clear learning outcome or practical workflow value
- it fits the current or next implementation phase
- it can be tested or reviewed

## Backlog States

| State | Meaning |
| --- | --- |
| Raw | Captured without evaluation |
| Shaping | Needs clarification or smaller scope |
| Candidate | Likely useful and waiting for roadmap timing |
| Accepted | Moved to roadmap |
| Parked | Valuable but not near-term |

## Ideas

| Idea | State | Why it matters | Notes |
| --- | --- | --- | --- |
| GSM Phase Error Lab | Candidate | Builds on GSM burst understanding and explains GMSK modulation quality | Likely after `GSM Burst/PvT Lab` |
| EDGE IQ/EVM Lab | Candidate | Shows why EDGE needs linear PA behavior unlike GSM GMSK | Good visual constellation module |
| ORFS/Spectrum Lab | Candidate | Connects burst behavior and modulation to spectrum failures | Can reuse GSM/EDGE concepts |
| LTE/NR ACLR/EVM Lab | Raw | Extends measurement thinking to OFDM-style modes | Keep V1 smaller first |
| Mode Switching State Machine Lab | Raw | Explains glitch, sequencing, bias settling, and control timing | Strong Phase 2 candidate |
| Production Test Flow Optimizer | Raw | Connects learning to Mark's strength in automation and production test | Needs app/data scope later |
| Teaching Mode | Raw | Helps convert simulator screens into junior-engineer teaching material | Useful after first labs exist |
| Measurement Data Import | Parked | Allows comparison with real CSV/log data | Wait until educational models are stable |

## Intake Template

```markdown
## Idea: <name>

State:

Learning outcome:

Practical value:

Possible app artifact:

Risks / scope notes:

Decision:
```
