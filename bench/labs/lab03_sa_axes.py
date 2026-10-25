"""Bench item 03 — SA axes: center, span, ref level, scale. Matches #/bench/sa-axes."""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, peak, set_cw, setup_sa, single_sweep


def add_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--pad', type=float, default=10.0, help='attenuator marking in dB, used as ref level offset')


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        set_cw(sg, args.freq, args.level)
        sa.write(':UNIT:POWer DBM')
        setup_sa(sa, args.freq, 20e6)
        rows.append(('Start (Hz)', sa.query(':SENSe:FREQuency:STARt?')))
        rows.append(('Stop (Hz)', sa.query(':SENSe:FREQuency:STOP?')))

        sg.write(':OUTPut:STATe ON')
        sg.wait()
        sa.write(':SENSe:POWer:RF:ATTenuation:AUTO ON')
        for ref in (0, 20):
            sa.write(f':DISPlay:WINDow:TRACe:Y:SCALe:RLEVel {ref}')
            single_sweep(sa)
            rows.append((f'Ref {ref} dBm: attenuation (dB)', sa.query(':SENSe:POWer:RF:ATTenuation?')))
            rows.append((f'Ref {ref} dBm: peak (dBm)', peak(sa)[1]))
        sa.check_errors()

        sa.write(':DISPlay:WINDow:TRACe:Y:SCALe:RLEVel 0')
        sa.write(f':DISPlay:WINDow:TRACe:Y:SCALe:RLEVel:OFFSet {args.pad}')
        single_sweep(sa)
        rows.append((f'Peak with ref offset {args.pad} dB (dBm)', peak(sa)[1]))
        sa.write(':DISPlay:WINDow:TRACe:Y:SCALe:RLEVel:OFFSet 0')
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 03', run, add_arguments, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
