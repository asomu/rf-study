"""DC supply 01 — CV/CC, OVP, OCP. Matches #/bench/ps-limits-protection.

Run from bench/:  python3 -m labs.lab_ps1_limits_protection [--live --ps <VISA>]
With --live the script pauses so you can connect the resistor load.
"""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.ps import measure, module, output, set_output
from rfbench.session import arm_ps

ROLES = ('ps',)


def add_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--channel', type=int, default=1)
    parser.add_argument('--volts', type=float, default=2.0)
    parser.add_argument('--ovp', type=float, default=3.0)


def run(insts, args: argparse.Namespace) -> Rows:
    ps, ch = insts['ps'], args.channel
    rows: Rows = []
    try:
        rows += [('Channels', ps.query(':SYSTem:CHANnel:COUNt?')), (f'Channel {ch} module', module(ps, ch))]
        arm_ps(ps, ch, args.ovp, 0.1)
        set_output(ps, ch, args.volts, 0.1)
        output(ps, ch, True)
        rows.append(('Open load: V / A', ' / '.join(measure(ps, ch))))
        output(ps, ch, False)

        if args.live:
            input('Connect the ~10 ohm resistor (1 W or more), then press Enter ')
        ps.write(f':SOURce:CURRent:PROTection:STATe OFF,(@{ch})')
        set_output(ps, ch, args.volts, 0.3)
        output(ps, ch, True)
        rows.append(('10 ohm, limit 0.3 A (CV): V / A', ' / '.join(measure(ps, ch))))
        set_output(ps, ch, args.volts, 0.1)
        rows.append(('10 ohm, limit 0.1 A (CC): V / A', ' / '.join(measure(ps, ch))))

        ps.write(f':SOURce:CURRent:PROTection:STATe ON,(@{ch})')
        ps.wait()
        rows.append(('After OCP on: output state', ps.query(f':OUTPut:STATe? (@{ch})')))
        rows.append(('QUES:COND', ps.query(f':STATus:QUEStionable:CONDition? (@{ch})')))
        set_output(ps, ch, args.volts, 0.3)
        ps.write(f':OUTPut:PROTection:CLEar (@{ch})')
        ps.check_errors()
    finally:
        ps.write(f':OUTPut:STATe OFF,(@{ch})')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('DC supply 01', run, add_arguments, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
