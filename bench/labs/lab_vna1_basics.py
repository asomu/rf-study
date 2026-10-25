"""VNA 01 — S-parameters and basic settings. Matches #/bench/vna-basics.

Run from bench/:  python3 -m labs.lab_vna1_basics [--live --vna <VISA>]
--level is the port power in dBm (default -10, at most 0).
"""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import arm_vna
from rfbench.vna import bus_sweep, marker_value, setup_stimulus, show

ROLES = ('vna',)


def run(insts, args: argparse.Namespace) -> Rows:
    vna = insts['vna']
    rows: Rows = [('VNA *IDN?', vna.query('*IDN?'))]
    try:
        arm_vna(vna, args.level)
        setup_stimulus(vna, 10e6, 3e9, 201, 70e3)
        vna.write(':OUTPut:STATe ON')
        show(vna, 'S21', 'MLOG')
        bus_sweep(vna)
        rows.append(('S21 at 3 GHz, uncalibrated (dB)', marker_value(vna, 3e9)))
        show(vna, 'S21', 'GDEL')
        bus_sweep(vna)
        rows.append(('S21 group delay at 1 GHz (s)', marker_value(vna, 1e9)))
        show(vna, 'S11', 'SWR')
        bus_sweep(vna)
        rows.append(('S11 SWR at 1 GHz', marker_value(vna, 1e9)))

        show(vna, 'S21', 'MLOG')
        for ifbw in (70e3, 1e3, 100):
            vna.write(f':SENSe1:BANDwidth:RESolution {ifbw}')
            rows.append((f'IFBW {ifbw:g} Hz, 201 pts: sweep (ms)', f'{bus_sweep(vna):.1f}'))
        vna.write(':SENSe1:BANDwidth:RESolution 1e3')
        vna.write(':SENSe1:SWEep:POINts 1601')
        rows.append(('IFBW 1 kHz, 1601 pts: sweep (ms)', f'{bus_sweep(vna):.1f}'))
        vna.check_errors()
    finally:
        vna.write(':TRIGger:SEQuence:SOURce INTernal')
        vna.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('VNA 01', run, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
