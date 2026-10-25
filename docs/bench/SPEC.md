# Bench Spec — Instrument Practice (Track 5)

**Status:** All 24 items built (2026-10-25); bench practice pending
**Instruments:** N5182B MXG (SG), N9020B MXA (SA), E5071C ENA (VNA), U2053XA USB power sensor, N6700C modular power system
**SG + SA bench:** N5182B → cable → fixed attenuator → N9020B
**Control:** a separate lab PC runs the scripts; this repo only ships them
**Roadmap:** track 5, groups SG + SA 쓰루 실습 · VNA · 파워센서 · DC 전원 · 다장비 동기화

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
- Each lab declares `ROLES` (`sg`, `sa`, `vna`, `pm`, `ps`); the shared test checks every role's rule below.

### Per-instrument safety

| Role | Rule | Source |
| --- | --- | --- |
| SG | User power max ≤ 0 dBm enabled before RF on; RF off last | N5180-90057 |
| SA | Input ≤ 0 dBm in practice (max safe +30 dBm) | 9018-04846 |
| VNA | Port power ≤ 0 dBm set before output on (E5071C preset is RF ON at 0 dBm); output off last. Max test port input +10 dBm, damage +26 dBm | E5071C help, 5989-5479EN |
| Power sensor | Read-only; practice input ≤ 0 dBm (range −70 to +26 dBm) | 5992-0040 |
| DC supply | OVP, current limit, OCP set before output on (*RST: OVP MAX, OCP OFF, current 0); practice ≤ 5 V, ≤ 0.5 A; output off last | N6700C Operating and Service Guide |
| Multi-instrument | DC on before RF on; RF off before DC off, also on errors | — |

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

Other instruments: VNA 1–4 (basics, calibration, attenuator as DUT, automation), power sensor 1–3 (zero/average, burst duty cycle, sensor-referenced path cal), DC supply 1–3 (limits and protection, remote sense, current measurement), sync 1 (test point).

Items are built one at a time. Since 2026-10-25 the learner prepares material ahead of bench time: items may be built before earlier ones are practised, and practice results come back later through the record fields.

## 7. Acceptance per Item

- [ ] Data file passes the bench content tests (unique ids, every SCPI row has a source)
- [ ] Page renders all five sections; prediction/measurement fields persist across reload
- [ ] Dry-run script prints the expected SCPI sequence; fake-transport tests pass
- [ ] Roadmap item set to `ready` with its `href`
