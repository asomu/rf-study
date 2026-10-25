# Progress

Last updated: 2026-10-25

Progress is tracked in three places:

- **Roadmap items** — build status per item lives in [`src/content/roadmap.ts`](../src/content/roadmap.ts) and shows on the home page.
- **RF competency** — self-assessed level per track, below.
- **Sessions** — what happened and what is next, in [SESSION_LOG.md](SESSION_LOG.md).

## Current Snapshot

| Measure | Value |
| --- | --- |
| Roadmap items ready | 2 / 71 core (+7 deferred) |
| Modules built | M1 GSM Burst / PvT Lab |
| M1 learner evidence | Not started (challenges and teach-back pending) |
| Deploy | CI tests pass; deploy blocked because GitHub Pages is not enabled on the repository |

## RF Competency Scale

| Level | Meaning |
| ---: | --- |
| 0 | Not studied |
| 1 | Understands terms |
| 2 | Can explain principle |
| 3 | Can configure the measurement and judge the result |
| 4 | Can design the test and data flow around it |
| 5 | Can teach it and review others' test programs |

## RF Competency by Track

Levels are self-assessed. Fill in the current level the first time a track is studied, and update it with evidence.

| Track | Current | Target | Evidence / next proof |
| --- | ---: | ---: | --- |
| 1 RF 기초 언어 | — | 4 | |
| 2 모듈 해부 | — | 4 | |
| 3 신호와 표준 | — | 4 | M1 covers GSM normal burst |
| 4 측정 항목 | — | 5 | M1 covers switching transient / PvT |
| 5 계측기와 자동화 | — | 5 | |
| 6 판정과 신뢰성 | — | 5 | |
| 7 데이터와 리포트 | — | 5 | |
| 8 생산 테스트 최적화 | — | 4 | |
| 9 수신기와 프로토콜 | — | 2 | Deferred |

## App Feature States

| State | Meaning |
| --- | --- |
| Idea | Captured but not accepted into roadmap |
| Planned | Accepted into roadmap |
| Building | Implementation is in progress |
| Validated | Tested and reviewed |

## App Feature Tracker

| Feature | State | Notes |
| --- | --- | --- |
| Documentation system | Validated | Core docs plus one `SPEC.md` and one `REVIEW.md` per module |
| Roadmap home | Validated | Nine tracks from `roadmap.ts`; unit and E2E covered |
| GSM Burst/PvT Lab (M1) | Validated | Learn → Lab → Challenge → Review |
| Progress tracking in app | Validated | Local evidence for M1 only |
| Per-item learning progress on home | Idea | Home shows build status only |
