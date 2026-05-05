# Progress

Last updated: 2026-05-05

Progress is tracked in three dimensions:

- RF competency
- App feature state
- Session history

## RF Competency Scale

| Level | Meaning |
| ---: | --- |
| 0 | Not studied |
| 1 | Understands terms |
| 2 | Can explain principle |
| 3 | Can measure and judge |
| 4 | Can explain design trade-offs |
| 5 | Can teach and lead others |

## RF Competency Tracker

Initial values are working baselines and should be revised as evidence is collected.

| Competency | Current | Target | Evidence / next proof |
| --- | ---: | ---: | --- |
| GSM burst timing and PvT | 2 | 5 | Build and explain `GSM Burst/PvT Lab` |
| GSM Phase Error and Frequency Error | 1 | 5 | Create phase trajectory explanation and examples |
| EDGE 8-PSK and EVM | 1 | 5 | Build constellation/EVM lab |
| ORFS and spectrum mask behavior | 1 | 4 | Link switching and modulation effects to spectrum plots |
| LTE/NR EVM, ACLR, SEM | 2 | 5 | Compare measurement items across mode and bandwidth |
| PAPR, DPD, APT, ET | 1 | 4 | Explain efficiency/linearity trade-offs visually |
| Mode switching and control sequence | 1 | 4 | Build timing/state-machine visualizer |
| Production test optimization | 3 | 5 | Draft multi-mode test flow and time-saving strategy |
| Teaching and communication | 1 | 5 | Produce reusable visual teaching material |

## App Feature States

| State | Meaning |
| --- | --- |
| Idea | Captured but not accepted into roadmap |
| Planned | Accepted into roadmap |
| Spec Ready | Implementation decisions are complete |
| Building | Implementation is in progress |
| Validated | Tested and reviewed |
| Released | Usable as part of the project baseline |

## App Feature Tracker

| Feature | State | Notes |
| --- | --- | --- |
| Documentation system | Building | Initial Markdown source-of-truth system is being created |
| GSM Burst/PvT Lab | Planned | First simulator-centered learning module |
| GSM Phase Error Lab | Idea | Candidate second GSM module |
| EDGE IQ/EVM Lab | Idea | Candidate EDGE module |
| ORFS/Spectrum Lab | Idea | Candidate spectrum module |
| LTE/NR ACLR/EVM Lab | Idea | Candidate LTE/NR measurement module |
| Mode Switching Lab | Idea | Candidate integrated design module |
| Progress tracking in app | Idea | Later app feature after learning modules stabilize |

## Session Progress Template

Use this format in `docs/SESSION_LOG.md`:

```markdown
## YYYY-MM-DD - Session Title

Goal:

- ...

Progress:

- ...

Decisions:

- ...

New ideas:

- ...

Blocked:

- ...

Next actions:

- ...
```
