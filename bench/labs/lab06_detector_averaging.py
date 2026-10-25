"""Bench item 06 — detectors and averaging. Matches #/bench/detector-averaging."""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, difference, level_at, peak, set_cw, setup_sa, single_sweep

DETECTORS = ('POSitive', 'SAMPle', 'AVERage')


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    f0 = args.freq
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        set_cw(sg, f0, args.level)
        setup_sa(sa, f0, 1e6, rbw_hz=10e3)
        sa.write(':SENSe:AVERage:TYPE RMS')
        sg.write(':OUTPut:STATe ON')
        sg.wait()
        for det in DETECTORS:
            sa.write(f':SENSe:DETector:TRACe1 {det}')
            single_sweep(sa)
            rows.append((f'CW, {det}: peak (dBm)', peak(sa)[1]))
        sa.check_errors()

        sg.write(':OUTPut:STATe OFF')
        sg.wait()
        noise = {}
        for det in DETECTORS:
            sa.write(f':SENSe:DETector:TRACe1 {det}')
            single_sweep(sa)
            noise[det] = level_at(sa, f0)
            rows.append((f'Noise, {det} (dBm)', noise[det]))
        rows.append(('Noise: peak - average(RMS) (dB)', difference(noise['POSitive'], noise['AVERage'])))

        sa.write(':TRACe1:TYPE AVERage')
        sa.write(':SENSe:AVERage:COUNt 20')
        averaged = {}
        for avg_type in ('RMS', 'LOG'):
            sa.write(f':SENSe:AVERage:TYPE {avg_type}')
            single_sweep(sa)
            averaged[avg_type] = level_at(sa, f0)
            rows.append((f'Noise, average detector, {avg_type} x20 (dBm)', averaged[avg_type]))
        rows.append(('Noise: RMS - LOG (dB)', difference(averaged['RMS'], averaged['LOG'])))
        sa.write(':TRACe1:TYPE WRITe')
        sa.write(':SENSe:DETector:TRACe1:AUTO ON')
        sa.write(':SENSe:AVERage:TYPE:AUTO ON')
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 06', run, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
