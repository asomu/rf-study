"""Bench item 11 — trigger and *OPC? synchronisation. Matches #/bench/trigger-sync.

--timeout-demo sets a 5 s sweep against a 2 s VISA timeout to show how a timeout is caught.
"""

import argparse
import time

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, peak, set_cw, setup_sa, single_sweep


def add_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--timeout-demo', action='store_true', help='show a VISA timeout on purpose (sweep 5 s, timeout 2 s)')


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    f0 = args.freq
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        set_cw(sg, f0, args.level)
        setup_sa(sa, f0, 1e6, rbw_hz=1e3)
        sg.write(':OUTPut:STATe ON')
        sg.wait()

        # Stale read: continuous sweep, change level, read immediately
        sa.write(':INITiate:CONTinuous ON')
        set_cw(sg, f0, args.level - 10)
        sa.write(':CALCulate:MARKer1:MAXimum')
        rows.append(('Continuous, read right after change (dBm)', sa.query(':CALCulate:MARKer1:Y?')))

        # Fixed: single sweep and *OPC?
        sa.write(':INITiate:CONTinuous OFF')
        sg.wait()
        single_sweep(sa)
        rows.append(('Single sweep + *OPC? (dBm)', peak(sa)[1]))
        sa.check_errors()

        for rbw in (100e3, 10e3, 1e3):
            sa.write(f':SENSe:BANDwidth:RESolution {rbw}')
            started = time.perf_counter()
            single_sweep(sa)
            elapsed = (time.perf_counter() - started) * 1000
            rows.append((f'RBW {rbw / 1e3:g} kHz: reported sweep (s) / measured (ms)',
                         f"{sa.query(':SENSe:SWEep:TIME?')} / {elapsed:.1f}"))
        sa.check_errors()

        if args.timeout_demo:
            sa.write(':SENSe:SWEep:TIME 5')
            sa.set_timeout(2000)
            try:
                single_sweep(sa)
                rows.append(('Timeout demo', 'no timeout (dry run or slow PC)'))
            except Exception as error:  # PyVISA raises VisaIOError on timeout
                rows.append(('Timeout demo', f'caught: {type(error).__name__}'))
                sa.write(':ABORt')
                sa.write('*CLS')
            finally:
                sa.set_timeout(10000)
                sa.write(':SENSe:SWEep:TIME:AUTO ON')
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 11', run, add_arguments, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
