"""DC supply 02 — remote sense and lead drop. Matches #/bench/ps-remote-sense.

Remote sense on N6700C modules is wiring, not SCPI. With --live the script pauses for you
to change the wiring and type the DMM reading across the resistor (blank if no DMM).
"""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.ps import measure, output, set_output
from rfbench.session import arm_ps, difference

ROLES = ('ps',)


def add_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--channel', type=int, default=1)
    parser.add_argument('--volts', type=float, default=2.0)


def dmm(args, prompt: str) -> str:
    if not args.live:
        return '<enter on the lab PC>'
    return input(prompt).strip() or '<no DMM>'


def run(insts, args: argparse.Namespace) -> Rows:
    ps, ch = insts['ps'], args.channel
    rows: Rows = []
    try:
        arm_ps(ps, ch, args.volts * 1.5, 0.3)
        if args.live:
            input('LOCAL sense (jumpers on), long leads to the 10 ohm resistor. Press Enter ')
        set_output(ps, ch, args.volts, 0.3)
        output(ps, ch, True)
        v_local, i_local = measure(ps, ch)
        load_v = dmm(args, 'DMM voltage across the resistor (V), Enter to skip: ')
        rows += [('Local sense: supply V / A', f'{v_local} / {i_local}'), ('Local sense: resistor V (DMM)', load_v)]
        drop = difference(v_local, load_v)
        rows.append(('Lead drop (V)', drop))
        try:
            rows.append(('Round-trip lead resistance (ohm)', f'{float(drop) / float(i_local):.3f}'))
        except (ValueError, ZeroDivisionError):
            rows.append(('Round-trip lead resistance (ohm)', '<needs live readings>'))
        output(ps, ch, False)

        if args.live:
            input('Output is OFF. Remove the sense jumpers and wire sense leads to the resistor. Press Enter ')
        output(ps, ch, True)
        v_remote, i_remote = measure(ps, ch)
        rows += [('Remote sense: supply V / A', f'{v_remote} / {i_remote}'),
                 ('Remote sense: resistor V (DMM)', dmm(args, 'DMM voltage across the resistor (V), Enter to skip: '))]
        ps.check_errors()
    finally:
        ps.write(f':OUTPut:STATe OFF,(@{ch})')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('DC supply 02', run, add_arguments, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
