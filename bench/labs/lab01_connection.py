"""Bench item 01 — connection and safety.

Run from the bench/ folder:
    python3 -m labs.lab01_connection                      # dry-run, prints SCPI only
    python3 -m labs.lab01_connection --live --sg <VISA> --sa <VISA>

Steps match the app page #/bench/connection-safety.
"""

from rfbench.cli import Rows, run_lab
from rfbench.session import Instrument, arm_sg, check_practice_level, peak, set_cw, single_sweep


def run(sg: Instrument, sa: Instrument, freq_hz: float, level_dbm: float, limit_dbm: float) -> Rows:
    check_practice_level(level_dbm, limit_dbm)
    results: Rows = []
    try:
        # 1. Who is connected
        results.append(('SG *IDN?', sg.query('*IDN?')))
        results.append(('SA *IDN?', sa.query('*IDN?')))

        # 2. Start from a clean error queue; keep what the last user left behind
        for inst in (sg, sa):
            inst.write('*CLS')
            leftovers = inst.drain_errors()
            results.append((f'{inst.name} leftover errors', '; '.join(leftovers) or 'none'))

        # 3. Hardware interlock on SG output before RF can turn on
        arm_sg(sg, limit_dbm)
        results.append(('SG user power max', f"{sg.query(':SOURce:POWer:USER:MAX?')} dBm, enable={sg.query(':SOURce:POWer:USER:ENABle?')}"))

        # 4. Frequency reference
        sa.write(':SENSe:ROSCillator:SOURce:TYPE SENSe')
        sa.check_errors()
        results.append(('SG reference in use', sg.query(':SOURce:ROSCillator:SOURce?')))
        results.append(('SA reference in use', sa.query(':SENSe:ROSCillator:SOURce?')))

        # 5. First signal through the thru path
        set_cw(sg, freq_hz, level_dbm)
        sa.write(f':SENSe:FREQuency:CENTer {freq_hz}')
        sa.write(':SENSe:FREQuency:SPAN 1e6')
        sa.write(':INITiate:CONTinuous OFF')
        sa.check_errors()
        results.append(('SA input attenuation', f"{sa.query(':SENSe:POWer:RF:ATTenuation?')} dB"))

        sg.write(':OUTPut:STATe ON')
        sg.wait()
        single_sweep(sa)
        x, y = peak(sa)
        results.append(('SA marker 1 X', f'{x} Hz'))
        results.append(('SA marker 1 Y', f'{y} dBm'))
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return results


def main(argv=None, echo=print) -> int:
    return run_lab('Bench 01', lambda sg, sa, args: run(sg, sa, args.freq, args.level, args.limit), argv=argv, echo=echo)


if __name__ == '__main__':
    raise SystemExit(main())
