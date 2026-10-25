"""DC supply 03 — current range, integration time, array measurement. Matches #/bench/ps-current-measure."""

import argparse

from rfbench.cli import Rows, run_lab
from rfbench.ps import output, set_output
from rfbench.session import arm_ps

ROLES = ('ps',)


def add_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--channel', type=int, default=1)
    parser.add_argument('--volts', type=float, default=2.0)


def spread_ma(readings) -> str:
    try:
        values = [float(r) for r in readings]
    except ValueError:
        return '<needs live readings>'
    return f'{(max(values) - min(values)) * 1000:.3f}'


def run(insts, args: argparse.Namespace) -> Rows:
    ps, ch = insts['ps'], args.channel
    rows: Rows = []
    try:
        arm_ps(ps, ch, args.volts * 1.5, 0.3)
        set_output(ps, ch, args.volts, 0.3)
        output(ps, ch, True)
        points = ps.query(f':SENSe:SWEep:POINts? (@{ch})')
        interval = ps.query(f':SENSe:SWEep:TINTerval? (@{ch})')
        try:
            window = f'{float(points) * float(interval) * 1000:.2f}'
        except ValueError:
            window = '<needs live readings>'
        rows += [('Default points / interval (s)', f'{points} / {interval}'), ('Measurement window (ms)', window)]

        for n in (100, points):
            ps.write(f':SENSe:SWEep:POINts {n},(@{ch})')
            readings = [ps.query(f':MEASure:SCALar:CURRent:DC? (@{ch})') for _ in range(10)]
            rows.append((f'{n} points: 10-read spread (mA)', spread_ma(readings)))
        rows.append(('Current range (A)', ps.query(f':SENSe:CURRent:DC:RANGe:UPPer? (@{ch})')))
        ps.check_errors()

        ps.write(f':SENSe:SWEep:POINts 1000,(@{ch})')
        ps.write(f':SENSe:SWEep:TINTerval 20.48e-6,(@{ch})')
        reply = ps.query(f':MEASure:ARRay:CURRent:DC? (@{ch})')
        errors = ps.drain_errors()
        rows.append(('Array samples received', str(len(reply.split(','))) if not errors else 'error: ' + '; '.join(errors)))
        ps.write(f':SENSe:SWEep:POINts {points},(@{ch})')
    finally:
        ps.write(f':OUTPut:STATe OFF,(@{ch})')
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('DC supply 03', run, add_arguments, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
