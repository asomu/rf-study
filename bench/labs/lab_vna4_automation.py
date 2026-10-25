"""VNA 04 — BUS trigger, trace transfer, limit test. Matches #/bench/vna-automation.

--pad is the attenuator marking in dB; the limit lines are pad ± 1 dB, then a tight lower line.
"""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import arm_vna
from rfbench.vna import bus_sweep, formatted_trace, setup_stimulus, show

ROLES = ('vna',)
START, STOP, POINTS = 10e6, 3e9, 401


def add_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--pad', type=float, default=10.0, help='attenuator marking in dB (default 10)')


def limit_table(pad_db: float, lower_margin_db: float) -> str:
    upper = -pad_db + 1
    lower = -pad_db - lower_margin_db
    return f'2,1,{START},{STOP},{upper},{upper},2,{START},{STOP},{lower},{lower}'


def run(insts, args: argparse.Namespace) -> Rows:
    vna = insts['vna']
    rows: Rows = []
    try:
        arm_vna(vna, args.level)
        setup_stimulus(vna, START, STOP, POINTS, 1e3)
        vna.write(':OUTPut:STATe ON')
        show(vna, 'S21', 'MLOG')
        vna.write(':FORMat:DATA ASCii')
        rows.append(('BUS single sweep + *OPC? (ms)', f'{bus_sweep(vna):.1f}'))

        reply = vna.query(':CALCulate1:SELected:DATA:FDATa?')
        rows.append(('FDATA numbers received (expect 2 x points)', str(len(reply.split(',')))))
        trace = formatted_trace(vna)
        if trace:
            rows.append(('S21 min / max over band (dB)', f'{min(trace):.2f} / {max(trace):.2f}'))

        for margin in (1.0, 0.1):
            vna.write(':CALCulate1:SELected:LIMit:DATA ' + limit_table(args.pad, margin))
            vna.write(':CALCulate1:SELected:LIMit:STATe ON')
            bus_sweep(vna)
            rows.append((f'Limit -{args.pad + margin:g} .. -{args.pad - 1:g} dB: FAIL? (1 = fail)', vna.query(':CALCulate1:SELected:LIMit:FAIL?')))
        vna.write(':CALCulate1:SELected:LIMit:STATe OFF')
        vna.check_errors()
    finally:
        vna.write(':TRIGger:SEQuence:SOURce INTernal')
        vna.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('VNA 04', run, add_arguments, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
