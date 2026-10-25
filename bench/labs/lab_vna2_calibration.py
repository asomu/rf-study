"""VNA 02 — calibration and reference plane. Matches #/bench/vna-calibration.

Default: sets the cal conditions and reports correction state and a thru check.
--mechanical walks through Open/Short/Load on ports 1 and 2 and Thru, asking you to
connect each standard (choose the cal kit on the front panel first).
--ecal runs a 2-port ECal instead.
"""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import arm_vna
from rfbench.vna import bus_sweep, formatted_trace, setup_stimulus, show

ROLES = ('vna',)


def add_arguments(parser: argparse.ArgumentParser) -> None:
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--mechanical', action='store_true', help='guided mechanical SOLT (prompts for each standard)')
    group.add_argument('--ecal', action='store_true', help='2-port ECal on ports 1 and 2')


def acquire(vna, command: str, prompt: str) -> None:
    input(f'{prompt} — press Enter when connected ')
    vna.write(command)
    vna.wait()


def run(insts, args: argparse.Namespace) -> Rows:
    vna = insts['vna']
    rows: Rows = []
    try:
        arm_vna(vna, args.level)
        setup_stimulus(vna, 10e6, 3e9, 401, 1e3)
        vna.write(':OUTPut:STATe ON')
        rows.append(('Correction state before', vna.query(':SENSe1:CORRection:STATe?')))

        if args.ecal:
            vna.write(':SENSe1:CORRection:COLLect:ECAL:SOLT2 1,2')
            vna.wait()
        elif args.mechanical:
            vna.write(':SENSe1:CORRection:COLLect:METHod:SOLT2 1,2')
            for port in (1, 2):
                for standard in ('OPEN', 'SHORt', 'LOAD'):
                    acquire(vna, f':SENSe1:CORRection:COLLect:ACQuire:{standard} {port}', f'Connect {standard.upper()} to port {port}')
            input('Connect the two cable ends together (THRU) — press Enter when connected ')
            for in_port, out_port in ((1, 2), (2, 1)):
                vna.write(f':SENSe1:CORRection:COLLect:ACQuire:THRU {in_port},{out_port}')
                vna.wait()
            vna.write(':SENSe1:CORRection:COLLect:SAVE')
            vna.wait()
        vna.check_errors()
        rows.append(('Correction state after', vna.query(':SENSe1:CORRection:STATe?')))

        show(vna, 'S21', 'MLOG')
        bus_sweep(vna)
        trace = formatted_trace(vna)
        if trace:
            rows.append(('Thru S21 max |deviation| from 0 dB (dB)', f'{max(abs(v) for v in trace):.3f}'))
        else:
            rows.append(('Thru S21 check', 'needs live readings (connect the cable ends together)'))
        vna.check_errors()
    finally:
        vna.write(':TRIGger:SEQuence:SOURce INTernal')
        vna.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('VNA 02', run, add_arguments, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
