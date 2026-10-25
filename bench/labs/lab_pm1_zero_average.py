"""Power sensor 01 — zero, frequency, averaging. Matches #/bench/pm-zero-average.

Run from bench/:  python3 -m labs.lab_pm1_zero_average [--live --sg <VISA> --pm <VISA>]
"""

import argparse
import time

from rfbench.cli import Rows, run_lab
from rfbench.pm import prepare, read_power, set_average, zero
from rfbench.session import arm_sg, set_cw

ROLES = ('sg', 'pm')


def spread(readings) -> str:
    try:
        values = [float(r) for r in readings]
    except ValueError:
        return '<needs live readings>'
    return f'{max(values) - min(values):.3f}'


def run(insts, args: argparse.Namespace) -> Rows:
    sg, pm = insts['sg'], insts['pm']
    rows: Rows = [('Sensor *IDN?', pm.query('*IDN?'))]
    try:
        arm_sg(sg, args.limit)
        prepare(pm)
        zero(pm)
        pm.write('SENSe1:AVERage:COUNt:AUTO ON')
        rows.append(('After zero, RF off (dBm)', read_power(pm, 1e9)))

        set_cw(sg, 3e9, args.level)
        sg.write(':OUTPut:STATe ON')
        sg.wait()
        right = read_power(pm, 3e9)
        wrong = read_power(pm, 50e6)
        rows += [('3 GHz signal, sensor set 3 GHz (dBm)', right), ('3 GHz signal, sensor set 50 MHz (dBm)', wrong)]

        set_cw(sg, 1e9, -50.0)
        sg.wait()
        for count in (1, 64):
            set_average(pm, count)
            started = time.perf_counter()
            readings = [read_power(pm, 1e9) for _ in range(5)]
            per_read_ms = (time.perf_counter() - started) * 1000 / 5
            rows.append((f'-50 dBm, average {count}: spread of 5 (dB) / ms per read', f'{spread(readings)} / {per_read_ms:.1f}'))
        pm.write('SENSe1:AVERage:COUNt:AUTO ON')
        pm.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Power sensor 01', run, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
