# Roadmap

Last updated: 2026-10-25

## Goal

Build the RF knowledge needed to write better RF test programs, test infrastructure, data processing, and report automation for PAMiD / FEM / PA / LNA modules.

The guiding question for every item: **what will I do better in a test program once I understand this?** That puts weight on what each measurement means, how it is configured and judged, and how results become data and reports, more than on RF circuit design.

## How the Roadmap Works

- The item list lives in [`src/content/roadmap.ts`](../src/content/roadmap.ts). It is the single source of truth; the home page (`#/`) renders it directly. Do not copy the list into this file.
- Each item has a status: `planned` → `building` → `ready`. A `ready` item has an `href` to its learning page.
- Each item has an origin: `wiki` means the topic was picked from the rf-wiki item list; `new` means it was added for test-program work. In both cases the content is written fresh here. rf-wiki text, models and code are not reused.
- Items are filled one at a time. Bundling several items into one module (like M1) is fine when they share a model.

## Tracks

Lower layers are the foundation for upper layers. Counts are as of 2026-10-25.

| # | Track | Question | Layer | Items | New |
| ---: | --- | --- | --- | ---: | ---: |
| 1 | RF 기초 언어 | 측정값의 단위와 기준면이 무엇인가 | 기초 | 5 | 0 |
| 2 | 모듈 해부 | 테스트하는 DUT 안에 무엇이 있나 | 기초 | 9 | 1 |
| 3 | 신호와 표준 | 측정 조건(band · RB · modulation)은 왜 그렇게 정해지나 | 신호 · 측정 | 20 | 0 |
| 4 | 측정 항목 | 무엇을 보고, 어떻게 재고, 언제 fail인가 | 신호 · 측정 | 14 | 4 |
| 5 | 계측기와 자동화 | 장비를 어떻게 설정하고 빠르고 정확하게 읽나 | 장비 · 판정 | 17 | 1 |
| 6 | 판정과 신뢰성 | 이 값을 믿고 PASS/FAIL을 내려도 되나 | 장비 · 판정 | 7 | 2 |
| 7 | 데이터와 리포트 | 결과를 어떤 구조로 저장하고 어떻게 보여주나 | 데이터 · 생산 | 5 | 5 |
| 8 | 생산 테스트 최적화 | 시간을 줄이면서 품질을 지키려면 | 데이터 · 생산 | 3 | 3 |
| 9 | 수신기와 프로토콜 | 관심 분야, 1–8번 트랙 뒤에 다룰 후보 | 후순위 후보 | 7 | 0 |

Total 87 items: 80 core, 7 deferred. Ready: 15 (two served by M1, thirteen SG + SA bench items).

Track 5 holds the SG + SA thru practice series (13 items, one built at a time per [bench/SPEC.md](bench/SPEC.md)) and four other-instrument items.

## Recommended Order

1. Tracks 1–2: units, reference planes, and what is inside the DUT.
2. Tracks 3–4: why test conditions are set the way they are, and what each measurement item means.
3. Tracks 5–6: instruments, automation, and whether a result can be trusted.
4. Tracks 7–8: data, reports, and production test time.
5. Track 9 only after 1–8, or earlier when curiosity is worth the detour.

Track 7 is closest to daily work and may be pulled forward. The order is a default, not a gate.

## Built Modules

| Module | Roadmap items | Status | Docs |
| --- | --- | --- | --- |
| M1 GSM Burst / PvT Lab | `gsm-normal-burst` (track 3), `switching-transient` (track 4) | Ready | [SPEC](m1/SPEC.md) · [REVIEW](m1/REVIEW.md) |
| SG + SA bench series 01–13 | 13 items in track 5 group "SG + SA 쓰루 실습" | Ready (material); not yet practised on the bench | [Bench SPEC](bench/SPEC.md) · scripts `bench/labs/lab01…lab13` |

## Filling the Next Item

1. Pick an item on the home page and set its status to `building` in `roadmap.ts`.
2. Decide its size: a short explanation page, or a lab module with a model. A lab module copies `docs/templates/SPEC.md` and `REVIEW.md` into `docs/m<n>/`.
3. Build, test, and review against the spec.
4. Set the status to `ready` with an `href`, and record the session in `docs/SESSION_LOG.md`.

## Boundaries

- Educational models stay labelled as approximations; no screen issues a conformance verdict.
- No backend. Progress stays in the browser.
- Official 3GPP numeric overlays need pinned release, version, section, band, power class, and measurement setup first.
