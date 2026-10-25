"""Bench item 12 — channel power and ACP. Matches #/bench/modulated-signal.

AM sidebands need SG option UNT; ARB playback (656/657) is left to the front panel
because waveform names differ per instrument.
"""

import argparse
import math

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, difference, has_any_option, peak, set_cw, setup_sa, single_sweep

AM_DEPTH = 30.0
AM_RATE_HZ = 10e3


def channel_power(sa: Instrument, f0: float, integration_hz: float) -> str:
    sa.write(':CONFigure:CHPower')
    sa.write(f':SENSe:FREQuency:CENTer {f0}')
    sa.write(f':SENSe:CHPower:BANDwidth:INTegration {integration_hz}')
    sa.write(':INITiate:IMMediate')
    sa.wait()
    return sa.query(':FETCh:CHPower:CHPower?')


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    f0 = args.freq
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        set_cw(sg, f0, args.level)
        sg.write(':OUTPut:STATe ON')
        sg.wait()
        cw_power = channel_power(sa, f0, 1e6)
        rows.append(('CW channel power, 1 MHz (dBm)', cw_power))
        sa.check_errors()

        am = has_any_option(sg, ('UNT',))
        if am is False:
            rows.append(('AM', 'SG option UNT not found; skipped'))
        else:
            expected = 20 * math.log10(AM_DEPTH / 100 / 2)
            sg.write(':SOURce:AM1:INTernal:FUNCtion1:FREQuency ' + str(AM_RATE_HZ))
            sg.write(f':SOURce:AM1:DEPTh:LINear {AM_DEPTH}')
            sg.write(':SOURce:AM1:STATe ON')
            sg.write(':OUTPut:MODulation:STATe ON')
            sg.check_errors()
            sa.write(':CONFigure:SANalyzer')
            setup_sa(sa, f0, 50e3, rbw_hz=300)
            single_sweep(sa)
            carrier = peak(sa)[1]
            sa.write(f':CALCulate:MARKer1:X {f0 + AM_RATE_HZ}')
            upper = sa.query(':CALCulate:MARKer1:Y?')
            rows.append((f'AM {AM_DEPTH:g}% upper sideband (dBc), expected {expected:.1f}', difference(upper, carrier)))
            am_power = channel_power(sa, f0, 1e6)
            rows.append(('AM channel power - CW channel power (dB)', difference(am_power, cw_power)))
            sg.write(':SOURce:AM1:STATe OFF')
            sg.write(':OUTPut:MODulation:STATe OFF')
            sg.check_errors()

        sa.write(':CONFigure:ACPower')
        sa.write(f':SENSe:FREQuency:CENTer {f0}')
        sa.write(':SENSe:ACPower:CARRier1:LIST:BANDwidth:INTegration 1e6')
        sa.write(':SENSe:ACPower:OFFSet1:OUTer:LIST:FREQuency 2e6')
        sa.write(':INITiate:IMMediate')
        sa.wait()
        rows.append(('ACP result array (CW: adjacent = SA floor)', sa.query(':FETCh:ACPower?')))
        sa.write(':CONFigure:SANalyzer')
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 12', run, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
