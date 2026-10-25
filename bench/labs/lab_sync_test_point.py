"""Multi-instrument test point. Matches #/bench/instrument-sync.

Order: DC bias on -> SG set -> RF on -> measure (sensor or SA, current) -> RF off -> DC off.
Cleanup keeps RF-off-before-DC-off even when a step fails. --fail-at sa simulates a failure.
"""

import argparse
import time
from datetime import datetime, timezone

from rfbench.cli import Rows, run_lab
from rfbench.pm import prepare, read_power
from rfbench.ps import output, set_output
from rfbench.session import InstrumentError, arm_ps, arm_sg, peak, set_cw, setup_sa, single_sweep

ROLES = ('ps', 'sg', 'pm', 'sa')


def add_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--channel', type=int, default=1)
    parser.add_argument('--volts', type=float, default=2.0)
    parser.add_argument('--use-sa', action='store_true', help='measure output power on the SA instead of the sensor')
    parser.add_argument('--fail-at', choices=('sa',), help='raise an error at this step to check cleanup order')


class Steps:
    def __init__(self):
        self.times = []

    def run(self, name, fn):
        started = time.perf_counter()
        result = fn()
        self.times.append((name, (time.perf_counter() - started) * 1000))
        return result


def run(insts, args: argparse.Namespace) -> Rows:
    ps, sg, pm, sa = insts['ps'], insts['sg'], insts['pm'], insts['sa']
    ch, f0 = args.channel, args.freq
    steps = Steps()
    record = {'time': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'freq_hz': f0,
              'sg_level_dbm': args.level, 'bias_v': args.volts}
    try:
        steps.run('identify', lambda: record.update({role: inst.query('*IDN?') for role, inst in insts.items()}))
        steps.run('arm (limits)', lambda: (arm_ps(ps, ch, args.volts * 1.5, 0.3), arm_sg(sg, args.limit), prepare(pm)))
        steps.run('DC bias on', lambda: (set_output(ps, ch, args.volts, 0.3), output(ps, ch, True)))
        steps.run('SG set + RF on', lambda: (set_cw(sg, f0, args.level), sg.write(':OUTPut:STATe ON'), sg.wait()))
        if args.use_sa:
            def sa_power():
                setup_sa(sa, f0, 1e6, rbw_hz=10e3)
                single_sweep(sa)
                return peak(sa)[1]
            record['pout_dbm'] = steps.run('output power (SA)', sa_power)
        else:
            record['pout_dbm'] = steps.run('output power (sensor)', lambda: read_power(pm, f0))

        def harmonic():
            if args.fail_at == 'sa':
                raise InstrumentError('simulated SA failure')
            setup_sa(sa, 2 * f0, 1e6, rbw_hz=10e3)
            single_sweep(sa)
            return peak(sa)[1]
        record['h2_dbm'] = steps.run('H2 (SA)', harmonic)
        record['current_a'] = steps.run('DC current', lambda: ps.query(f':MEASure:SCALar:CURRent:DC? (@{ch})'))
        for inst in insts.values():
            inst.check_errors()
    finally:
        sg.write(':OUTPut:STATe OFF')
        ps.write(f':OUTPut:STATe OFF,(@{ch})')

    rows: Rows = [(f'record.{key}', str(value)) for key, value in record.items()]
    rows += [(f'time: {name} (ms)', f'{ms:.1f}') for name, ms in steps.times]
    rows.append(('time: total (ms)', f'{sum(ms for _, ms in steps.times):.1f}'))
    return rows


def main(argv=None, echo=print) -> int:
    return run_lab('Sync test point', run, add_arguments, argv=argv, echo=echo, roles=ROLES)


if __name__ == '__main__':
    raise SystemExit(main())
