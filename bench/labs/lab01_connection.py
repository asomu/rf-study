"""Bench item 01 — connection and safety.

Run from the bench/ folder:
    python3 -m labs.lab01_connection                      # dry-run, prints SCPI only
    python3 -m labs.lab01_connection --live --sg <VISA> --sa <VISA>

Steps match the app page #/bench/connection-safety.
"""

import argparse
from typing import Callable, Dict, List, Tuple

from rfbench.session import Instrument, check_practice_level, open_pair


def run(sg: Instrument, sa: Instrument, freq_hz: float, level_dbm: float, limit_dbm: float) -> List[Tuple[str, str]]:
    check_practice_level(level_dbm, limit_dbm)
    results: List[Tuple[str, str]] = []
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
        sg.write(':OUTPut:STATe OFF')
        sg.write(f':SOURce:POWer:USER:MAX {limit_dbm} dBm')
        sg.write(':SOURce:POWer:USER:ENABle ON')
        sg.check_errors()
        results.append(('SG user power max', f"{sg.query(':SOURce:POWer:USER:MAX?')} dBm, enable={sg.query(':SOURce:POWer:USER:ENABle?')}"))

        # 4. Frequency reference
        sa.write(':SENSe:ROSCillator:SOURce:TYPE SENSe')
        sa.check_errors()
        results.append(('SG reference in use', sg.query(':SOURce:ROSCillator:SOURce?')))
        results.append(('SA reference in use', sa.query(':SENSe:ROSCillator:SOURce?')))

        # 5. First signal through the thru path
        sg.write(f':SOURce:FREQuency:CW {freq_hz}')
        sg.write(f':SOURce:POWer:LEVel:IMMediate:AMPLitude {level_dbm} dBm')
        sg.check_errors()
        sa.write(f':SENSe:FREQuency:CENTer {freq_hz}')
        sa.write(':SENSe:FREQuency:SPAN 1e6')
        sa.write(':INITiate:CONTinuous OFF')
        sa.check_errors()
        results.append(('SA input attenuation', f"{sa.query(':SENSe:POWer:RF:ATTenuation?')} dB"))

        sg.write(':OUTPut:STATe ON')
        sg.wait()
        sa.write(':INITiate:IMMediate')
        sa.wait()
        sa.write(':CALCulate:MARKer1:MAXimum')
        results.append(('SA marker 1 X', f"{sa.query(':CALCulate:MARKer1:X?')} Hz"))
        results.append(('SA marker 1 Y', f"{sa.query(':CALCulate:MARKer1:Y?')} dBm"))
        sa.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
    return results


def format_table(rows: List[Tuple[str, str]]) -> str:
    width = max(len(name) for name, _ in rows)
    return '\n'.join(f'{name.ljust(width)}  {value}' for name, value in rows)


def main(argv=None, echo: Callable[[str], None] = print) -> int:
    parser = argparse.ArgumentParser(description='Bench 01: connection and safety (dry-run unless --live)')
    parser.add_argument('--live', action='store_true', help='talk to real instruments')
    parser.add_argument('--sg', help='SG VISA address, e.g. from Keysight Connection Expert')
    parser.add_argument('--sa', help='SA VISA address')
    parser.add_argument('--freq', type=float, default=1e9, help='CW frequency in Hz (default 1 GHz)')
    parser.add_argument('--level', type=float, default=-10.0, help='SG level in dBm (default -10)')
    parser.add_argument('--limit', type=float, default=0.0, help='SG user power max in dBm (default 0, at most 0)')
    args = parser.parse_args(argv)

    insts: Dict[str, Instrument] = open_pair(args.live, args.sg, args.sa, echo)
    try:
        rows = run(insts['sg'], insts['sa'], args.freq, args.level, args.limit)
    finally:
        for inst in insts.values():
            inst.close()
    echo('')
    echo('=== Bench 01 results ===')
    echo(format_table(rows))
    if not args.live:
        echo('(dry-run: nothing was sent; add --live --sg <VISA> --sa <VISA> on the lab PC)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
