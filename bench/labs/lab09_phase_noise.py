"""Bench item 09 — phase noise with the noise marker. Matches #/bench/phase-noise.

dBc/Hz = noise marker (dBm/Hz) - carrier (dBm). RBW is set to a tenth of each offset.
"""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, difference, peak, set_cw, setup_sa, single_sweep

OFFSETS_HZ = (10e3, 100e3, 1e6)


def noise_density(sa: Instrument, freq_hz: float) -> str:
    sa.write(':CALCulate:MARKer2:MODE POSition')
    sa.write(f':CALCulate:MARKer2:X {freq_hz}')
    sa.write(':CALCulate:MARKer2:FUNCtion NOISe')
    return sa.query(':CALCulate:MARKer2:Y?')


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    f0 = args.freq
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        set_cw(sg, f0, args.level)
        setup_sa(sa, f0, 300e3)
        sg.write(':OUTPut:STATe ON')
        sg.wait()
        single_sweep(sa)
        carrier = peak(sa)[1]
        rows.append(('Carrier (dBm)', carrier))

        sa.write(':TRACe1:TYPE AVERage')
        sa.write(':SENSe:AVERage:COUNt 10')
        for offset in OFFSETS_HZ:
            sa.write(f':SENSe:FREQuency:SPAN {offset * 3}')
            sa.write(f':SENSe:BANDwidth:RESolution {offset / 10}')
            single_sweep(sa)
            density = noise_density(sa, f0 + offset)
            rows.append((f'{offset / 1e3:g} kHz offset: dBm/Hz / dBc/Hz', f'{density} / {difference(density, carrier)}'))
        sa.check_errors()

        sg.write(':OUTPut:STATe OFF')
        sg.wait()
        single_sweep(sa)
        rows.append(('1 MHz offset, RF off: SA floor (dBm/Hz)', noise_density(sa, f0 + OFFSETS_HZ[-1])))
        sa.write(':CALCulate:MARKer2:FUNCtion OFF')
        sa.write(':CALCulate:MARKer2:MODE OFF')
        sa.write(':TRACe1:TYPE WRITe')
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 09', run, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
