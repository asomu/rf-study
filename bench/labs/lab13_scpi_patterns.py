"""Bench item 13 — SCPI automation patterns. Matches #/bench/scpi-patterns.

Records options, shows how the error queue collects bad commands, compares ASCII and
REAL,32 trace transfer, and checks *SAV/*RCL. The trace format is always restored to ASCII.
"""

import argparse
import time

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, set_cw, setup_sa, single_sweep


def timed_ascii(sa: Instrument) -> tuple:
    started = time.perf_counter()
    reply = sa.query(':TRACe:DATA? TRACE1')
    return (time.perf_counter() - started) * 1000, len(reply)


def timed_binary(sa: Instrument) -> tuple:
    started = time.perf_counter()
    values = sa.query_binary_floats(':TRACe:DATA? TRACE1')
    return (time.perf_counter() - started) * 1000, len(values) * 4


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        rows.append(('SG *OPT?', sg.query('*OPT?')))
        rows.append(('SA *OPT?', sa.query('*OPT?')))

        # Bad commands are silent until the error queue is read
        sa.write('*CLS')
        sa.write(':SENSe:FREQuency:CENTRE 1e9')
        sa.write(':SENSe:SWEep:POINts 99999')
        rows.append(('Errors after two bad commands', '; '.join(sa.drain_errors()) or 'none'))

        set_cw(sg, args.freq, args.level)
        setup_sa(sa, args.freq, 10e6)
        sg.write(':OUTPut:STATe ON')
        sg.wait()
        try:
            for points in (1001, 10001):
                sa.write(f':SENSe:SWEep:POINts {points}')
                single_sweep(sa)
                sa.write(':FORMat:TRACe:DATA ASCii')
                ascii_ms, ascii_bytes = timed_ascii(sa)
                sa.write(':FORMat:TRACe:DATA REAL,32')
                sa.write(':FORMat:BORDer SWAPped')
                binary_ms, binary_bytes = timed_binary(sa)
                rows.append((f'{points} points: ASCII ms/bytes', f'{ascii_ms:.1f} / {ascii_bytes}'))
                rows.append((f'{points} points: REAL,32 ms/bytes', f'{binary_ms:.1f} / {binary_bytes}'))
        finally:
            sa.write(':FORMat:TRACe:DATA ASCii')
            sa.write(':FORMat:BORDer NORMal')
            sa.write(':SENSe:SWEep:POINts 1001')
        sa.check_errors()

        sa.write(':SENSe:BANDwidth:RESolution 30e3')
        sa.write('*SAV 1')
        sa.write(':SYSTem:PRESet')
        sa.wait()
        sa.write('*RCL 1')
        sa.wait()
        rows.append(('RBW after *SAV 1, preset, *RCL 1 (Hz)', sa.query(':SENSe:BANDwidth:RESolution?')))
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 13', run, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
