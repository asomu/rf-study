# RF Study Lab

RF Study Lab is a personal learning web app for building the RF knowledge a test-program engineer needs: what each measurement means, how instruments are set up, how results are judged, and how they become data and reports for PAMiD / FEM / PA / LNA modules.

## Project Goal

Write better RF test programs, test infrastructure, data processing, and report automation by understanding the RF behind them.

- Static web app (Vite, React, TypeScript), no backend
- Korean explanations with RF English terms preserved
- The home page (`#/`) shows the whole roadmap as nine tracks; items are filled one at a time
- First built module: `GSM Burst/PvT Lab` (M1)

## Run

```bash
npm install
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run test` | Unit and component tests |
| `npm run test:e2e` | Browser flow, overflow, and accessibility tests |
| `npm run check` | Tests plus production build |
| `npm run test:smoke` | Production `dist` route check |
| `cd bench && python3 -m unittest discover -s tests -t .` | Bench script tests (no instruments needed) |

## Source Of Truth

- Roadmap items and their status: [`src/content/roadmap.ts`](src/content/roadmap.ts)
- Everything else: Markdown in this repo

## Document Map

- [Roadmap](docs/ROADMAP.md): goal, nine tracks, recommended order, how to fill an item
- [Project Map](docs/PROJECT_MAP.md): learner context, track map, app and code map
- [Progress](docs/PROGRESS.md): snapshot, competency by track, feature states
- [Session Log](docs/SESSION_LOG.md): work-session history and next actions
- [Decisions](docs/DECISIONS.md): decisions that changed direction
- [Idea Backlog](docs/IDEA_BACKLOG.md): ideas not on the roadmap yet
- [M1 Spec](docs/m1/SPEC.md) · [M1 Review](docs/m1/REVIEW.md): `GSM Burst/PvT Lab`
- [Module templates](docs/templates/): `SPEC.md` and `REVIEW.md` to copy for each new module
- [Bench Spec](docs/bench/SPEC.md) · [Bench scripts](bench/README.md): SG + SA thru practice on the lab bench

## Current Status

- Roadmap: 9 tracks, 87 items (80 core, 7 deferred); 15 ready
- Bench practice: SG + SA thru series 01–13 ready as material; bench runs pending
- M1 GSM Burst/PvT Lab: validated locally
- Deploy: https://asomu.github.io/rf-study/ (public), via GitHub Actions on push to `main`

## Working Rules

1. New ideas go to `docs/IDEA_BACKLOG.md` first; accepted topics become items in `roadmap.ts`.
2. Fill one roadmap item at a time; set it to `building` when started and `ready` with an `href` when done.
3. Topics may come from the rf-wiki item list, but content is written fresh here; rf-wiki text, models and code are not reused.
4. Decisions that change direction go in `docs/DECISIONS.md`; every work session ends with a `docs/SESSION_LOG.md` entry.

## Module Workflow

A roadmap item that needs a model or lab becomes a module with exactly two documents in `docs/m<n>/`, copied from `docs/templates/`:

1. `SPEC.md` — write before building: learning contract, content, model, UI deltas, acceptance.
2. `REVIEW.md` — fill once the module is feature-complete: checklist, findings fixed, follow-ups.

Build against the spec, then run one independent review before marking it ready. Short explanation items do not need a module folder.

## Next Actions

1. Practise SG + SA items 01–13 on the lab bench and record the results.
2. Finish track 5: VNA, power sensor, DC supply, multi-instrument sync (need instrument models).
3. Extend accessibility checks to post-interaction states.
4. Complete M1 challenges and the 90-second teach-back as learner evidence.
