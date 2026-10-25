"""Bench item 10 — zero span time-domain view. Matches #/bench/zero-span.

With SG option UNW the script makes a GSM-like burst (4.615 ms period, 577 us width).
Without it, only the CW zero-span part runs.
"""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, has_any_option, set_cw, single_sweep

GSM_FRAME_S = 4.615e-3
GSM_SLOT_S = 577e-6


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    f0 = args.freq
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        set_cw(sg, f0, args.level)
        sa.write(':INITiate:CONTinuous OFF')
        sa.write(f':SENSe:FREQuency:CENTer {f0}')
        sa.write(':SENSe:FREQuency:SPAN 0')
        sa.write(':SENSe:BANDwidth:RESolution 3e6')
        sa.write(':SENSe:SWEep:TIME 10e-3')
        sa.write(':TRIGger:SEQuence:SOURce IMMediate')
        sa.check_errors()
        sg.write(':OUTPut:STATe ON')
        sg.wait()
        single_sweep(sa)
        sa.write(':CALCulate:MARKer1:MODE POSition')
        sa.write(':CALCulate:MARKer1:X 5e-3')
        rows.append(('CW in zero span at 5 ms (dBm)', sa.query(':CALCulate:MARKer1:Y?')))

        pulse = has_any_option(sg, ('UNW',))
        if pulse is False:
            rows.append(('Burst', 'SG option UNW not found; toggle RF by hand with a 5 s sweep instead'))
        else:
            sg.write(':SOURce:PULM:SOURce INTernal')
            sg.write(':SOURce:PULM:SOURce:INTernal SQUare')
            sg.write(f':SOURce:PULM:INTernal:PERiod {GSM_FRAME_S}')
            sg.write(f':SOURce:PULM:INTernal:PWIDth {GSM_SLOT_S}')
            sg.write(':SOURce:PULM:STATe ON')
            sg.write(':OUTPut:MODulation:STATe ON')
            sg.check_errors()
            sa.write(':TRIGger:SEQuence:SOURce VIDeo')
            sa.write(f':TRIGger:SEQuence:VIDeo:LEVel {args.level - 10}')
            sa.write(':TRIGger:SEQuence:DELay -100e-6')
            sa.write(':SENSe:SWEep:TIME 1e-3')
            sa.check_errors()
            single_sweep(sa)
            sa.write(':CALCulate:MARKer1:X 400e-6')
            rows.append(('Burst on, 400 us after trigger point (dBm)', sa.query(':CALCulate:MARKer1:Y?')))
            sa.write(':CALCulate:MARKer1:X 900e-6')
            rows.append(('Burst off, 900 us (dBm)', sa.query(':CALCulate:MARKer1:Y?')))
            sg.write(':SOURce:PULM:STATe OFF')
            sa.write(':TRIGger:SEQuence:SOURce IMMediate')
            sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 10', run, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
