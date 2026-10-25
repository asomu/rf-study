# Bench Spec — SG + SA Thru Practice

**Status:** Spec Ready (2026-10-25)
**Bench:** Keysight N5182B MXG (SG) → cable → fixed attenuator → N9020B MXA (SA)
**Control:** a separate lab PC runs the scripts; this repo only ships them
**Roadmap:** track 5, group "SG + SA 쓰루 실습"

## 1. Learning Contract

For each bench item the learner can:

1. Explain what the instrument does internally for that setting (principle).
2. Say what each setting changes in the result, and the common mistakes.
3. Predict a reading, take it on the bench, and explain any gap.
4. Reproduce the front-panel steps with SCPI from Python.
5. Say how the setting affects test time, accuracy, or pass/fail in a test program.

## 2. Item Format

Every item is one data file in `src/content/bench/` and renders at `#/bench/<item-id>` through one shared page. Sections, in order:

| Section | Content |
| --- | --- |
| 원리 | Short explanation; an optional small simulation where seeing it helps |
| 설정 값의 의미 | Table: setting · what it changes · default · common mistake |
| 쓰루 실습 | Ordered steps. Each step has front-panel actions; measurement steps also have a prediction field and a measured-value field |
| SCPI 커맨드 | Table: command · instrument · purpose · source document |
| 테스트 프로그램 관점 | What this means for test time, accuracy, and judgment |

Predictions and measured values are saved in the browser under `rf-study:bench:v1`, validated on load, and reset safely if corrupt.

## 3. Safety Contract

- SA maximum safe input: **+30 dBm average total power**, with or without preamp (N9020B Specifications Guide 9018-04846).
- Practice level at the SA input stays at or below **0 dBm**. The pad gives extra margin, but scripts do not rely on it.
- Scripts set an SG user power limit with `:POWer:USER:MAX` and `:POWer:USER:ENABle ON` before any RF output. Default limit: **0 dBm**.
- Scripts turn RF off (`:OUTPut OFF`) on exit, including on errors.
- Scripts check `:SYSTem:ERRor?` after configuration steps and stop on any non-zero error.

## 4. Script Conventions (`bench/`)

- Python 3.9+, PyVISA only on the lab PC. The package imports `pyvisa` lazily so tests run without it.
- Default is **dry-run**: print every SCPI line that would be sent; touch nothing.
- `--live --sg <VISA address> --sa <VISA address>` controls real instruments. Addresses are never hard-coded.
- Each lab script prints a plain results table to paste back into the app or into chat.
- Unit tests use a fake transport and run with `python3 -m unittest` from `bench/`.

## 5. Sources

| Topic | Document |
| --- | --- |
| MXG SCPI | Keysight X-Series Signal Generators SCPI Command Reference, N5180-90057, Edition 1, April 2016 (covers N5181B/82B/83B) |
| X-Series SA SCPI | Keysight X-Series Signal Analyzer Spectrum Analyzer Mode User's & Programmer's Reference, N9060-90027 (2014; documents N9020A). N9020B uses the same X-Series command tree; recheck on your firmware |
| N9020B limits | Keysight N9020B MXA Specifications Guide, 9018-04846 |

Each item's SCPI table cites one of these. A command not found in them is marked "verify on instrument".

## 6. Item Order

1. 연결과 안전
2. CW 출력과 marker
3. SA 기본 축: center · span · ref level · scale
4. RBW · VBW · noise floor · sweep time
5. 감쇠기 · preamp · 과입력
6. Detector와 averaging
7. 전력 정확도와 경로 손실
8. Harmonic과 spurious
9. Phase noise와 noise marker
10. Zero span
11. Trigger와 동기화
12. 변조 신호 (options permitting)
13. SCPI 자동화 패턴

Items are built one at a time. Since 2026-10-25 the learner prepares material ahead of bench time: items may be built before earlier ones are practised, and practice results come back later through the record fields.

## 7. Acceptance per Item

- [ ] Data file passes the bench content tests (unique ids, every SCPI row has a source)
- [ ] Page renders all five sections; prediction/measurement fields persist across reload
- [ ] Dry-run script prints the expected SCPI sequence; fake-transport tests pass
- [ ] Roadmap item set to `ready` with its `href`
