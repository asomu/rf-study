"""Power sensor 02 — average sensor on a burst, duty cycle correction. Matches #/bench/pm-burst-duty.

Needs SG option UNW for the burst; without it only the CW reference and the expected
numbers are reported.
"""

import argparse
import math

from rfbench.cli import Rows, run_lab
from rfbench.pm import prepare, read_power
from rfbench.session import arm_sg, has_any_option, set_cw

ROLES = ('sg', 'pm')
PERIOD_S = 4.615e-3
WIDTH_S = 577e-6


def run(insts, args: argparse.Namespace) -> Rows:
    sg, pm = insts['sg'], insts['pm']
    f0 = args.freq
    duty = WIDTH_S / PERIOD_S
    rows: Rows = [('Duty cycle D', f'{duty:.4f} ({100 * duty:.2f} %)'),
                  ('Expected average - burst (dB)', f'{10 * math.log10(duty):.2f}')]
    try:
        arm_sg(sg, args.limit)
        prepare(pm)
        set_cw(sg, f0, args.level)
        sg.write(':OUTPut:STATe ON')
        sg.wait()
        rows.append(('CW average (dBm)', read_power(pm, f0)))

        if has_any_option(sg, ('UNW',)) is False:
            rows.append(('Burst', 'SG option UNW not found; skipped'))
        else:
            sg.write(':SOURce:PULM:SOURce INTernal')
            sg.write(':SOURce:PULM:SOURce:INTernal SQUare')
            sg.write(f':SOURce:PULM:INTernal:PERiod {PERIOD_S}')
            sg.write(f':SOURce:PULM:INTernal:PWIDth {WIDTH_S}')
            sg.write(':SOURce:PULM:STATe ON')
            sg.write(':OUTPut:MODulation:STATe ON')
            sg.check_errors()
            sg.wait()
            rows.append(('Burst average (dBm)', read_power(pm, f0)))
            for percent in (100 * duty, 10.0):
                pm.write(f'SENSe1:CORRection:DCYCle {percent:.3f}')
                rows.append((f'Duty correction {percent:.2f} % (dBm)', read_power(pm, f0)))
            pm.write('SENSe1:CORRection:DCYCle:STATe OFF')
            sg.write(':SOURce:PULM:STATe OFF')
            pm.check_errors()
            sg.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Power sensor 02', run, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
