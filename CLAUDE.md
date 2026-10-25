# RF Study Lab — notes for Claude

Personal RF learning web app for one learner who builds RF test programs, test infrastructure, data processing and report automation at a PAMiD / FEM / PA / LNA module company. They do not measure by hand. Explain RF in terms of what a test program measures, configures, judges and reports. Reply in Korean, keep RF English terms.

## Start of a session

Read these before doing anything:

1. `docs/SESSION_LOG.md` — last entry's "Next actions" and "Blocked"
2. `src/content/roadmap.ts` — item statuses (`planned` / `building` / `ready`)
3. `docs/ROADMAP.md` — tracks, order, how to fill an item

## Rules

- Roadmap items live only in `src/content/roadmap.ts`. Do not copy the list into docs.
- Fill one item at a time. Set `building` when starting, `ready` plus `href` when done.
- rf-wiki (`../rf-wiki`) is a topic inventory only. Never copy its text, models or code; write content fresh.
- A lab-sized item gets `docs/m<n>/SPEC.md` and `REVIEW.md` from `docs/templates/`. No other plan or summary files.
- Pure RF math goes in `src/domain/<topic>/` with unit tests; screens in `src/pages/` and `src/components/`.
- Bench items follow `docs/bench/SPEC.md`: one data file in `src/content/bench/`, one dry-run-first script in `bench/labs/`. Every SCPI command cites a source document; verify new commands against the Keysight references before adding them. The instruments are on another PC: never assume live access.
- Educational models are labelled as approximations; no conformance verdict language.
- Before finishing: `npm run check`, `npm run test:e2e`, and the bench script tests pass, then add a `docs/SESSION_LOG.md` entry and update `docs/PROGRESS.md` snapshot if anything changed.

## Commands

`npm run dev` · `npm run test` · `npm run test:e2e` · `npm run check` · `npm run test:smoke`
