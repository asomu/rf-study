"""Bench item 08 — SG harmonics and spurious. Matches #/bench/sg-harmonics-spurious."""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, difference, peak, set_cw, setup_sa, single_sweep


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    f0 = args.freq
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        set_cw(sg, f0, args.limit)  # harmonics are easier to see at the practice limit
        setup_sa(sa, f0, 1e6, rbw_hz=10e3)
        sa.write(':SENSe:POWer:RF:ATTenuation:AUTO ON')
        sg.write(':OUTPut:STATe ON')
        sg.wait()
        single_sweep(sa)
        fundamental = peak(sa)[1]
        rows.append(('Fundamental (dBm)', fundamental))

        for n in (2, 3):
            sa.write(f':SENSe:FREQuency:CENTer {n * f0}')
            single_sweep(sa)
            level = peak(sa)[1]
            rows.append((f'H{n} (dBm) / (dBc)', f'{level} / {difference(level, fundamental)}'))
        sa.write(f':SENSe:FREQuency:CENTer {2 * f0}')
        sa.write(':SENSe:POWer:RF:ATTenuation 20')
        single_sweep(sa)
        rows.append(('H2 with atten 20 dB (dBm) - should match if SG-made', peak(sa)[1]))
        sa.write(':SENSe:POWer:RF:ATTenuation:AUTO ON')
        sa.check_errors()

        sa.write(':CONFigure:HARMonics')
        sa.write(f':SENSe:HARMonics:FREQuency:FUNDamental {f0}')
        sa.write(':SENSe:HARMonics:NUMBer 3')
        sa.write(':INITiate:IMMediate')
        sa.wait()
        rows.append(('Harmonics measurement amplitudes', sa.query(':FETCh:HARMonics:AMPLitude:ALL?')))
        rows.append(('Harmonics measurement frequencies', sa.query(':FETCh:HARMonics:FREQuency:ALL?')))
        sa.write(':CONFigure:SANalyzer')
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 08', run, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
