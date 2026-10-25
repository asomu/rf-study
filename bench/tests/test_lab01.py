import sys
import unittest

from labs import lab01_connection
from rfbench.session import Instrument, InstrumentError, Transport


class FakeTransport(Transport):
    def __init__(self, log, name, errors=None):
        self.log = log
        self.name = name
        self.errors = list(errors or [])

    def write(self, command):
        self.log.append((self.name, command))

    def query(self, command):
        self.log.append((self.name, command))
        if command == ':SYSTem:ERRor?':
            return self.errors.pop(0) if self.errors else '+0,"No error"'
        if command == '*OPC?':
            return '1'
        return '0'


def make_pair(sg_errors=None, sa_errors=None):
    log = []
    sg = Instrument('SG', FakeTransport(log, 'SG', sg_errors))
    sa = Instrument('SA', FakeTransport(log, 'SA', sa_errors))
    return log, sg, sa


class Lab01Tests(unittest.TestCase):
    def test_power_limit_is_set_before_rf_turns_on(self):
        log, sg, sa = make_pair()
        lab01_connection.run(sg, sa, 1e9, -10.0, 0.0)
        sg_commands = [cmd for name, cmd in log if name == 'SG']
        limit = sg_commands.index(':SOURce:POWer:USER:ENABle ON')
        rf_on = sg_commands.index(':OUTPut:STATe ON')
        self.assertLess(limit, rf_on)
        self.assertEqual(sg_commands[-1], ':OUTPut:STATe OFF')

    def test_rf_turns_off_when_an_instrument_reports_an_error(self):
        # SA leftover queue empties, then the reference setup reports an error
        log, sg, sa = make_pair(sa_errors=['+0,"No error"', '-113,"Undefined header"'])
        with self.assertRaises(InstrumentError):
            lab01_connection.run(sg, sa, 1e9, -10.0, 0.0)
        self.assertEqual(log[-1], ('SG', ':OUTPut:STATe OFF'))
        self.assertNotIn(('SG', ':OUTPut:STATe ON'), log)

    def test_leftover_errors_are_reported_not_fatal(self):
        log, sg, sa = make_pair(sg_errors=['-222,"Data out of range"', '+0,"No error"'])
        rows = dict(lab01_connection.run(sg, sa, 1e9, -10.0, 0.0))
        self.assertIn('Data out of range', rows['SG leftover errors'])

    def test_refuses_levels_above_the_practice_limit(self):
        _, sg, sa = make_pair()
        with self.assertRaises(SystemExit):
            lab01_connection.run(sg, sa, 1e9, 5.0, 0.0)
        with self.assertRaises(SystemExit):
            lab01_connection.run(sg, sa, 1e9, -10.0, 10.0)

    def test_dry_run_needs_no_pyvisa_and_prints_results(self):
        lines = []
        self.assertEqual(lab01_connection.main([], echo=lines.append), 0)
        self.assertNotIn('pyvisa', sys.modules)
        self.assertIn('=== Bench 01 results ===', lines)
        self.assertTrue(any(':SOURce:POWer:USER:MAX 0.0 dBm' in line for line in lines))

    def test_live_requires_both_addresses(self):
        with self.assertRaises(SystemExit):
            lab01_connection.main(['--live', '--sg', 'TCPIP0::1.2.3.4::inst0::INSTR'], echo=lambda _: None)


if __name__ == '__main__':
    unittest.main()
