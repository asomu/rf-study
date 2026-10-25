"""Power sensor 03 — sensor-referenced path cal for the SA. Matches #/bench/pm-path-cal.

Step 1 reads the cable-end power with the sensor; step 2 reads the same point through the
attenuator with the SA; the difference becomes the SA CSET1 table. With --live the script
pauses so you can swap the sensor for the attenuator + SA.
"""

import argparse
from typing import Dict

from rfbench.cli import Rows, run_lab
from rfbench.pm import prepare, read_power
from rfbench.session import arm_sg, difference, peak, set_cw, setup_sa, single_sweep

ROLES = ('sg', 'pm', 'sa')


def add_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--freqs', default='100e6,1e9,2e9,3e9', help='comma separated Hz')


def run(insts, args: argparse.Namespace) -> Rows:
    sg, pm, sa = insts['sg'], insts['pm'], insts['sa']
    freqs = [float(f) for f in args.freqs.split(',')]
    p1: Dict[float, str] = {}
    p2: Dict[float, str] = {}
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        prepare(pm)
        sg.write(':OUTPut:STATe ON')
        for f in freqs:
            set_cw(sg, f, args.level)
            sg.wait()
            p1[f] = read_power(pm, f)
        sg.write(':OUTPut:STATe OFF')
        if args.live:
            input('Move the cable end from the sensor to the attenuator + SA, then press Enter ')

        sa.write(':SENSe:CORRection:CSET1:STATe OFF')
        sa.write(':DISPlay:WINDow:TRACe:Y:SCALe:RLEVel:OFFSet 0')
        sg.write(':OUTPut:STATe ON')
        for f in freqs:
            set_cw(sg, f, args.level)
            sg.wait()
            setup_sa(sa, f, 1e6, rbw_hz=10e3)
            single_sweep(sa)
            p2[f] = peak(sa)[1]
            rows.append((f'{f / 1e6:g} MHz: P1 sensor / P2 SA / P1-P2 / SG set - P1',
                         f'{p1[f]} / {p2[f]} / {difference(p1[f], p2[f])} / {difference(str(args.level), p1[f])}'))
        sa.check_errors()

        cal = {f: difference(p1[f], p2[f]) for f in freqs}
        if all(not v.startswith('<') for v in cal.values()):
            sa.write(':SENSe:CORRection:CSET1:DATA ' + ','.join(f'{f},{v}' for f, v in cal.items()))
            sa.write(':SENSe:CORRection:CSET1:STATe ON')
            for f in freqs:
                set_cw(sg, f, args.level)
                sg.wait()
                sa.write(f':SENSe:FREQuency:CENTer {f}')
                single_sweep(sa)
                rows.append((f'{f / 1e6:g} MHz with CSET1: SA - P1 (dB)', difference(peak(sa)[1], p1[f])))
            rows.append(('Note', 'if SA - P1 doubled instead of shrinking, flip the CSET sign'))
        else:
            rows.append(('CSET1', 'skipped: needs live readings'))
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Power sensor 03', run, add_arguments, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
