# Bench scripts — instrument practice (track 5)

Python scripts for the bench items in the app (`#/bench/...`). Rules live in [docs/bench/SPEC.md](../docs/bench/SPEC.md).

Bench: Keysight N5182B MXG → cable → fixed attenuator → N9020B MXA.

## On the lab PC

1. Install Python 3.9+ and a VISA library (Keysight IO Libraries Suite), then `pip install pyvisa`.
2. Copy this `bench/` folder to the lab PC.
3. Find each instrument's VISA address in Keysight Connection Expert.
4. From inside `bench/`:

```bash
python3 -m labs.lab01_connection
```

```bash
python3 -m labs.lab01_connection --live --sg "TCPIP0::<sg-ip>::inst0::INSTR" --sa "TCPIP0::<sa-ip>::inst0::INSTR"
```

The first command is a dry run: it prints every SCPI line and sends nothing. The second talks to the instruments.

| Script | App page | Needs option |
| --- | --- | --- |
| `labs.lab01_connection` | 연결과 안전 | — |
| `labs.lab02_cw_marker` | CW 출력과 marker | — |
| `labs.lab03_sa_axes` | SA 기본 축 (`--pad` = 감쇠기 dB) | — |
| `labs.lab04_rbw_vbw_noise` | RBW · VBW · noise floor | — |
| `labs.lab05_attenuation_overload` | 감쇠기 · preamp · 과입력 | SA preamp (skipped if absent) |
| `labs.lab06_detector_averaging` | Detector와 averaging | — |
| `labs.lab07_power_accuracy` | 전력 정확도와 경로 손실 (`--freqs`) | — |
| `labs.lab08_sg_harmonics` | SG harmonic과 spurious | — |
| `labs.lab09_phase_noise` | Phase noise | — |
| `labs.lab10_zero_span` | Zero span | SG UNW for the burst (skipped if absent) |
| `labs.lab11_trigger_sync` | Trigger와 *OPC? (`--timeout-demo`) | — |
| `labs.lab12_modulated_signal` | Channel power · ACP | SG UNT for AM (skipped if absent) |
| `labs.lab13_scpi_patterns` | SCPI 자동화 패턴 | — |

| `labs.lab_vna1_basics` | VNA S-parameter와 기본 설정 | — |
| `labs.lab_vna2_calibration` | Calibration (`--mechanical` 또는 `--ecal`) | cal kit / ECal |
| `labs.lab_vna3_measure_pad` | 감쇠기를 DUT로 | — |
| `labs.lab_vna4_automation` | VNA 자동화 (`--pad`) | — |
| `labs.lab_pm1_zero_average` | 파워센서 zero · 주파수 · 평균 | — |
| `labs.lab_pm2_burst_duty` | Burst와 duty cycle | SG UNW (skipped if absent) |
| `labs.lab_pm3_path_cal` | 센서 기준 경로 cal (`--freqs`) | — |
| `labs.lab_ps1_limits_protection` | 전압 · 전류 · 보호 (`--channel`) | 10 Ω load |
| `labs.lab_ps2_remote_sense` | Remote sense | 10 Ω load, DMM optional |
| `labs.lab_ps3_current_measure` | 전류 측정 | 10 Ω load; array needs module support |
| `labs.lab_sync_test_point` | 다장비 test point (`--use-sa`, `--fail-at sa`) | — |

Each script asks only for the instruments it uses: `--sg`, `--sa`, `--vna`, `--pm`, `--ps` (VISA addresses). All accept `--freq`, `--level` (SG level or VNA port power), and `--limit` (SG user power max, at most 0 dBm). Scripts that need a wiring change pause for Enter only in `--live` mode.

Paste the "results" table into the app's record fields or into chat.

## Safety built into every script

- SG: user power max set and enabled before RF can turn on; default 0 dBm, never above 0 dBm.
- VNA: port power set (≤ 0 dBm) before output on; output off on exit.
- DC supply: OVP, current limit, and OCP set before output on; output off on exit.
- Multi-instrument: DC bias before RF, RF off before DC off.
- Outputs are turned off on exit, including after an error.
- The error queue is checked after each configuration block; any error stops the run.

## Tests

```bash
python3 -m unittest discover -s tests -t .
```

Tests use a fake transport and do not need PyVISA or instruments.
