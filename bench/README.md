# Bench scripts — SG + SA thru practice

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

Paste the "results" table into the app's record fields or into chat.

## Safety built into every script

- SG user power max is set and enabled before RF can turn on; default 0 dBm, never above 0 dBm.
- RF output is turned off on exit, including after an error.
- The error queue is checked after each configuration block; any error stops the run.

## Tests

```bash
python3 -m unittest discover -s tests -t .
```

Tests use a fake transport and do not need PyVISA or instruments.
