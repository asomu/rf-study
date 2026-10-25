"""Bench item 02 — CW output and markers.

Run from the bench/ folder:
    python3 -m labs.lab02_cw_marker
    python3 -m labs.lab02_cw_marker --live --sg <VISA> --sa <VISA>

Steps match the app page #/bench/cw-marker.
"""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, difference, peak, set_cw, single_sweep

OFFSET_HZ = 3e3  # small offset that a 10 MHz span with 1001 points cannot resolve


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    f0, level = args.freq, args.level
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        set_cw(sg, f0, level)
        sa.write(':INITiate:CONTinuous OFF')
        sa.write(f':SENSe:FREQuency:CENTer {f0}')
        sa.write(':SENSe:FREQuency:SPAN 10e6')
        sa.write(':SENSe:SWEep:POINts 1001')
        sa.write(':CALCulate:MARKer1:MODE POSition')
        sa.check_errors()
        sg.write(':OUTPut:STATe ON')
        sg.wait()

        single_sweep(sa)
        x, y = peak(sa)
        rows += [('Peak at f0: X (Hz)', x), ('Peak at f0: Y (dBm)', y)]

        set_cw(sg, f0 + 2e6, level)
        single_sweep(sa)
        rows.append(('Peak after +2 MHz: X (Hz)', peak(sa)[0]))

        set_cw(sg, f0 + OFFSET_HZ, level)
        rows.append(('Point spacing, span 10 MHz (Hz)', f'{10e6 / 1000:.0f}'))
        single_sweep(sa)
        rows.append(('f0 + 3 kHz, span 10 MHz: X (Hz)', peak(sa)[0]))

        sa.write(':SENSe:FREQuency:SPAN 100e3')
        rows.append(('Point spacing, span 100 kHz (Hz)', f'{100e3 / 1000:.0f}'))
        single_sweep(sa)
        rows.append(('f0 + 3 kHz, span 100 kHz: X (Hz)', peak(sa)[0]))

        sa.write(':CALCulate:MARKer1:FCOunt:STATe ON')
        single_sweep(sa)
        rows.append(('f0 + 3 kHz, counted (Hz)', sa.query(':CALCulate:MARKer1:FCOunt:X?')))
        sa.write(':CALCulate:MARKer1:FCOunt:STATe OFF')
        sa.check_errors()

        set_cw(sg, f0, level)
        sa.write(f':SENSe:FREQuency:CENTer {f0}')
        single_sweep(sa)
        first = peak(sa)[1]
        set_cw(sg, f0, level - 10)
        single_sweep(sa)
        second = peak(sa)[1]
        rows += [('Level at set level (dBm)', first), ('Level at set level - 10 dB (dBm)', second),
                 ('Difference (dB)', difference(second, first))]

        sg.write(':OUTPut:STATe OFF')
        sg.wait()
        single_sweep(sa)
        sa.write(':CALCulate:MARKer1:X ' + str(f0))
        rows.append(('Marker at f0 with RF off (dBm)', sa.query(':CALCulate:MARKer1:Y?')))
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 02', run, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
