# RF Study Lab

RF Study Lab is a long-running learning and tool-building project for becoming a senior-level RF Frontend Module engineer across GSM/EDGE/LTE/NR mid/high bands.

The project combines three tracks:

- RF learning material
- Visual simulators and understanding tests
- Practical RF workflow tools for measurement, judgment, and explanation

## Project Goal

Within 18 months, reach an advanced engineer level for Multi-Mode(GSM/EDGE/LTE/NR) Mid/High Band RF Frontend Module work, including the ability to explain, design, troubleshoot, and teach core concepts.

Initial product direction:

- Web App
- GSM/EDGE first
- Simulator-centered learning
- Korean explanations with RF English terms preserved
- First module: `GSM Burst/PvT Lab`

## Source Of Truth

Markdown files in this repo are the source of truth.

Notion may be used later as a dashboard, mirror, or idea capture surface, but project decisions, roadmap state, progress, and implementation-ready specs should be reflected back into this repo.

## Document Map

- [Project Map](docs/PROJECT_MAP.md): whole-project map, RF competency map, app feature map, module relationships
- [Roadmap](docs/ROADMAP.md): 18-month phases and near-term execution plan
- [Progress](docs/PROGRESS.md): RF competency, app feature, and session progress tracking
- [Idea Backlog](docs/IDEA_BACKLOG.md): new ideas before they are accepted into the roadmap
- [Decisions](docs/DECISIONS.md): important project and technical decisions
- [Session Log](docs/SESSION_LOG.md): work-session history and next actions
- [M1 Spec](docs/m1/SPEC.md): learning contract, content, model, UI, and acceptance for `GSM Burst/PvT Lab`
- [M1 Review](docs/m1/REVIEW.md): review checklist, fixed findings, learner-content assessment, and follow-ups
- [Module templates](docs/templates/): `SPEC.md` and `REVIEW.md` to copy for each new module

## Current Status

- Repository status: M1 validated implementation
- Current phase: Phase 1 - Multi-Mode fundamentals
- Current focus: use `GSM Burst/PvT Lab` to collect learning evidence and scope M2
- First validated module: `GSM Burst/PvT Lab`

## Working Rules

1. Before implementing a new feature, update or confirm the relevant project document.
2. New ideas go to `docs/IDEA_BACKLOG.md` first.
3. Ideas move to `docs/ROADMAP.md` only after they match the learning goal, implementation timing, and current phase.
4. Progress is tracked in three dimensions: RF competency, app feature state, and session history.
5. Decisions that change direction are recorded in `docs/DECISIONS.md`.

## Module Workflow

Each module keeps exactly two documents in `docs/m<n>/`, copied from `docs/templates/`:

1. `SPEC.md` — write before building: learning contract, content, model, UI deltas, acceptance.
2. `REVIEW.md` — fill once the module is feature-complete: checklist, findings fixed, follow-ups.

Build against the spec, then run one independent review before marking the module Validated. Record session history in `docs/SESSION_LOG.md` and state in `docs/PROGRESS.md`; no separate plan or summary files.

## Next Actions

1. Complete M1 challenges and a 90-second teach-back as learner evidence.
2. Run a short user review with RF engineers and capture confusing terms or interactions.
3. Lock the source version/section metadata before adding any numeric specification-reference profile.
4. Scope `GSM Phase Error Lab` as the next vertical module.
