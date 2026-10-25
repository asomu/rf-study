"""Bench item 04 — RBW, VBW, noise floor, sweep time. Matches #/bench/rbw-vbw-noise."""

import argparse
import time

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, level_at, peak, set_cw, setup_sa, single_sweep

NOISE_OFFSET_HZ = 300e3


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    f0 = args.freq
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        set_cw(sg, f0, args.level)
        setup_sa(sa, f0, 1e6)
        sa.write(':SENSe:BANDwidth:VIDeo:AUTO ON')
        sa.write(':SENSe:SWEep:TIME:AUTO ON')
        rows.append(('Span 1 MHz: auto RBW (Hz)', sa.query(':SENSe:BANDwidth:RESolution?')))
        sg.write(':OUTPut:STATe ON')
        sg.wait()

        for rbw in (100e3, 10e3, 1e3):
            sa.write(f':SENSe:BANDwidth:RESolution {rbw}')
            started = time.perf_counter()
            single_sweep(sa)
            elapsed_ms = (time.perf_counter() - started) * 1000
            label = f'RBW {rbw / 1e3:g} kHz'
            rows.append((f'{label}: peak (dBm)', peak(sa)[1]))
            rows.append((f'{label}: noise at +300 kHz (dBm)', level_at(sa, f0 + NOISE_OFFSET_HZ)))
            rows.append((f'{label}: sweep time reported (s)', sa.query(':SENSe:SWEep:TIME?')))
            rows.append((f'{label}: INIT + *OPC? measured (ms)', f'{elapsed_ms:.1f}'))
        sa.check_errors()

        sa.write(':SENSe:BANDwidth:RESolution 10e3')
        sa.write(':SENSe:BANDwidth:VIDeo 100')
        rows.append(('RBW 10 kHz, VBW 100 Hz: sweep time (s)', sa.query(':SENSe:SWEep:TIME?')))
        sa.write(':SENSe:BANDwidth:VIDeo:AUTO ON')
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 04', run, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
