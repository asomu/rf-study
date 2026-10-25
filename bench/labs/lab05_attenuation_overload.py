"""Bench item 05 — attenuation, preamp, overload. Matches #/bench/attenuation-overload."""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, has_any_option, level_at, peak, set_cw, setup_sa, single_sweep

PREAMP_OPTIONS = ('P03', 'P08', 'P13', 'P26', 'P44', 'P50')  # MXA internal preamp options by frequency range


def run(sg: Instrument, sa: Instrument, args: argparse.Namespace) -> Rows:
    f0 = args.freq
    rows: Rows = []
    try:
        arm_sg(sg, args.limit)
        rows.append(('SA overload reported to error queue', sa.query(':SYSTem:ERRor:OVERload?')))
        sa.write(':SYSTem:ERRor:OVERload ON')
        set_cw(sg, f0, args.level)
        setup_sa(sa, f0, 1e6, rbw_hz=10e3)
        sg.write(':OUTPut:STATe ON')
        sg.wait()

        for atten in (10, 20, 30):
            sa.write(f':SENSe:POWer:RF:ATTenuation {atten}')
            single_sweep(sa)
            rows.append((f'Atten {atten} dB: peak (dBm)', peak(sa)[1]))
            rows.append((f'Atten {atten} dB: noise at +300 kHz (dBm)', level_at(sa, f0 + 300e3)))
        sa.check_errors()

        # Who made the second harmonic: SA readings that move with attenuation came from the SA mixer
        set_cw(sg, f0, args.limit)
        sa.write(f':SENSe:FREQuency:CENTer {2 * f0}')
        for atten in (10, 20):
            sa.write(f':SENSe:POWer:RF:ATTenuation {atten}')
            single_sweep(sa)
            rows.append((f'2nd harmonic, atten {atten} dB (dBm)', peak(sa)[1]))
        sa.check_errors()

        sg.write(':OUTPut:STATe OFF')
        sg.wait()
        preamp = has_any_option(sa, PREAMP_OPTIONS)
        if preamp is False:
            rows.append(('Preamp', 'no preamp option found in *OPT?; skipped'))
        else:
            sa.write(f':SENSe:FREQuency:CENTer {f0}')
            sa.write(':SENSe:POWer:RF:ATTenuation 0')
            single_sweep(sa)
            rows.append(('RF off, atten 0, preamp off: noise (dBm)', level_at(sa, f0)))
            sa.write(':SENSe:POWer:RF:GAIN:STATe ON')
            single_sweep(sa)
            rows.append(('RF off, atten 0, preamp on: noise (dBm)', level_at(sa, f0)))
            sa.write(':SENSe:POWer:RF:GAIN:STATe OFF')
        sa.write(':SENSe:POWer:RF:ATTenuation:AUTO ON')
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 05', run, argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
