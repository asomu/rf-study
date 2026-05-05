# Decisions

Last updated: 2026-05-05

This file records decisions that shape project direction. Keep entries short and useful.

## Decision Format

```markdown
## D-YYYYMMDD-XX - Title

Status:

Decision:

Reason:

Impact:
```

## D-20260505-01 - Markdown Is The Source Of Truth

Status: Accepted

Decision:

Project documents in this repository are the source of truth. Notion may be used later as a dashboard, mirror, or capture tool, but repo Markdown remains the authoritative record.

Reason:

The project combines code, learning material, simulator specs, and progress records. Keeping the source of truth in Git makes changes traceable and keeps implementation aligned with planning.

Impact:

Before major implementation work, update or confirm the relevant Markdown documents.

## D-20260505-02 - Start With Living Core Documents

Status: Accepted

Decision:

Start with a compact set of living documents: README, Project Map, Roadmap, Progress, Idea Backlog, Decisions, and Session Log.

Reason:

The project will evolve over many sessions. A small maintained document system is more useful than a large static specification that becomes stale.

Impact:

Add detail when it supports near-term implementation or important project decisions.

## D-20260505-03 - First Module Is GSM Burst/PvT Lab

Status: Accepted

Decision:

The first learning/app module is `GSM Burst/PvT Lab`.

Reason:

GSM burst timing and PvT are concrete, visual, and closely connected to practical RF measurement judgment. They are a good first simulator-centered learning experience.

Impact:

The first app implementation should focus on time-domain burst behavior, ramp profile, mask pass/fail, and parameter challenge learning.

## D-20260505-04 - V1 Uses Educational Approximation

Status: Accepted

Decision:

The first simulator uses an educational approximation instead of full 3GPP conformance-level accuracy.

Reason:

The immediate goal is principle understanding. A simplified model will make cause and effect clearer and reduce initial implementation complexity.

Impact:

V1 should be clearly labeled as educational. Real conformance masks, measurement data import, and exact 3GPP limit handling can be added later.
