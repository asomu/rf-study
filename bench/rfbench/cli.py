"""Shared command line for bench labs: dry-run by default, --live with VISA addresses."""

import argparse
from typing import Callable, List, Optional, Sequence, Tuple

from rfbench.session import check_practice_level, format_table, open_instruments

Rows = List[Tuple[str, str]]


def run_lab(title: str, run: Callable, add_arguments: Optional[Callable[[argparse.ArgumentParser], None]] = None,
            argv=None, echo: Callable[[str], None] = print, roles: Sequence[str] = ('sg', 'sa')) -> int:
    """Parse arguments, open instruments for `roles`, run, and print the results table.

    SG + SA labs keep the run(sg, sa, args) signature; other labs receive run(insts, args).
    """
    parser = argparse.ArgumentParser(description=f'{title} (dry-run unless --live)')
    parser.add_argument('--live', action='store_true', help='talk to real instruments')
    for role in roles:
        parser.add_argument(f'--{role}', help=f'{role.upper()} VISA address, e.g. from Keysight Connection Expert')
    parser.add_argument('--freq', type=float, default=1e9, help='frequency in Hz (default 1 GHz)')
    parser.add_argument('--level', type=float, default=-10.0, help='SG level or VNA port power in dBm (default -10)')
    parser.add_argument('--limit', type=float, default=0.0, help='SG user power max in dBm (default 0, at most 0)')
    if add_arguments:
        add_arguments(parser)
    args = parser.parse_args(argv)
    if 'sg' in roles:
        check_practice_level(args.level, args.limit)

    insts = open_instruments(args.live, {role: getattr(args, role) for role in roles}, echo)
    try:
        if tuple(roles) == ('sg', 'sa'):
            rows = run(insts['sg'], insts['sa'], args)
        else:
            rows = run(insts, args)
    finally:
        for inst in insts.values():
            inst.close()
    echo('')
    echo(f'=== {title} results ===')
    echo(format_table(rows))
    if not args.live:
        flags = ' '.join(f'--{role} <VISA>' for role in roles)
        echo(f'(dry-run: nothing was sent; add --live {flags} on the lab PC)')
    return 0
