"""Bench item 07 — power accuracy and path loss. Matches #/bench/power-accuracy.

Measures path loss (SG setting minus SA reading) at several frequencies, then
applies it as an SA amplitude correction table and reads again.
"""

import argparse
from typing import Dict

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, difference, peak, set_cw, setup_sa, single_sweep

DEFAULT_FREQS = '100e6,1e9,2e9,3e9'


def add_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--freqs', default=DEFAULT_FREQS, help=f'comma separated Hz (default {DEFAULT_FREQS})')


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    freqs = [float(f) for f in args.freqs.split(',')]
    rows: Rows = []
    loss: Dict[float, str] = {}
    try:
        arm_sg(sg, args.limit)
        sa.write(':DISPlay:WINDow:TRACe:Y:SCALe:RLEVel:OFFSet 0')
        sa.write(':SENSe:CORRection:SA:RF:GAIN 0')
        sa.write(':SENSe:CORRection:CSET1:STATe OFF')
        sg.write(':OUTPut:STATe ON')
        for f in freqs:
            set_cw(sg, f, args.level)
            sg.wait()
            setup_sa(sa, f, 1e6, rbw_hz=10e3)
            single_sweep(sa)
            reading = peak(sa)[1]
            loss[f] = difference(str(args.level), reading)
            rows.append((f'{f / 1e6:g} MHz: reading (dBm) / loss (dB)', f'{reading} / {loss[f]}'))
        sa.check_errors()

        numeric = {f: v for f, v in loss.items() if not v.startswith('<')}
        if numeric:
            pairs = ','.join(f'{f},{v}' for f, v in numeric.items())
            sa.write(f':SENSe:CORRection:CSET1:DATA {pairs}')
            sa.write(':SENSe:CORRection:CSET1:STATe ON')
            sa.check_errors()
            for f in freqs:
                set_cw(sg, f, args.level)
                sg.wait()
                sa.write(f':SENSe:FREQuency:CENTer {f}')
                single_sweep(sa)
                rows.append((f'{f / 1e6:g} MHz with CSET1 (dBm)', peak(sa)[1]))
            rows.append(('Note', 'check the CSET sign on screen: readings should move toward the SG level'))
            sa.write(':SENSe:CORRection:CSET1:STATe OFF')
        else:
            rows.append(('CSET1', 'skipped: needs live readings'))
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 07', run, add_arguments, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
