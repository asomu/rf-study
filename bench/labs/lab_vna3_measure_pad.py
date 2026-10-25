"""VNA 03 — measure the attenuator: loss, match, delay. Matches #/bench/vna-measure-pad.

Run after VNA 02 calibration with the attenuator between the cable ends.
"""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import arm_vna
from rfbench.vna import bus_sweep, marker_pair, marker_value, setup_stimulus, show

ROLES = ('vna',)
FREQS = (100e6, 1e9, 3e9)


def run(insts, args: argparse.Namespace) -> Rows:
    vna = insts['vna']
    rows: Rows = []
    try:
        arm_vna(vna, args.level)
        setup_stimulus(vna, 10e6, 3e9, 401, 1e3)
        vna.write(':OUTPut:STATe ON')
        rows.append(('Correction state (1 = on)', vna.query(':SENSe1:CORRection:STATe?')))
        for parameter, fmt, label in (('S21', 'MLOG', 'S21 (dB)'), ('S11', 'MLOG', 'S11 (dB)'), ('S11', 'SWR', 'S11 SWR')):
            show(vna, parameter, fmt)
            bus_sweep(vna)
            for f in FREQS:
                rows.append((f'{label} at {f / 1e6:g} MHz', marker_value(vna, f)))
        show(vna, 'S11', 'SMIT')
        bus_sweep(vna)
        rows.append(('S11 Smith at 1 GHz (R, X ohm)', marker_pair(vna, 1e9)))
        show(vna, 'S21', 'GDEL')
        bus_sweep(vna)
        rows.append(('S21 group delay at 1 GHz (s)', marker_value(vna, 1e9)))
        vna.check_errors()
    finally:
        vna.write(':TRIGger:SEQuence:SOURce INTernal')
        vna.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('VNA 03', run, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
