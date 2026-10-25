"""Shared command line for bench labs: dry-run by default, --live with VISA addresses."""

import argparse
from typing import Callable, List, Optional, Tuple

from rfbench.session import Instrument, check_practice_level, format_table, open_pair

Rows = List[Tuple[str, str]]
RunFn = Callable[[Instrument, Instrument, argparse.Namespace], Rows]


def run_lab(title: str, run: RunFn, add_arguments: Optional[Callable[[argparse.ArgumentParser], None]] = None,
            argv=None, echo: Callable[[str], None] = print) -> int:
    parser = argparse.ArgumentParser(description=f'{title} (dry-run unless --live)')
    parser.add_argument('--live', action='store_true', help='talk to real instruments')
    parser.add_argument('--sg', help='SG VISA address, e.g. from Keysight Connection Expert')
    parser.add_argument('--sa', help='SA VISA address')
    parser.add_argument('--freq', type=float, default=1e9, help='CW frequency in Hz (default 1 GHz)')
    parser.add_argument('--level', type=float, default=-10.0, help='SG level in dBm (default -10)')
    parser.add_argument('--limit', type=float, default=0.0, help='SG user power max in dBm (default 0, at most 0)')
    if add_arguments:
        add_arguments(parser)
    args = parser.parse_args(argv)
    check_practice_level(args.level, args.limit)

    insts = open_pair(args.live, args.sg, args.sa, echo)
    try:
        rows = run(insts['sg'], insts['sa'], args)
    finally:
        for inst in insts.values():
            inst.close()
    echo('')
    echo(f'=== {title} results ===')
    echo(format_table(rows))
    if not args.live:
        echo('(dry-run: nothing was sent; add --live --sg <VISA> --sa <VISA> on the lab PC)')
    return 0
