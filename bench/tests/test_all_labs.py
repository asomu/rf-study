"""Safety contract every bench lab must keep (docs/bench/SPEC.md §3)."""

import importlib
import pkgutil
import sys
import unittest
from unittest import mock

import labs
import rfbench.cli
from rfbench.session import Instrument, Transport

LAB_MODULES = sorted(name for _, name, _ in pkgutil.iter_modules(labs.__path__) if name.startswith('lab'))


class FakeTransport(Transport):
    def __init__(self, log, name, fail_on_query=None):
        self.log = log
        self.name = name
        self.queries = 0
        self.fail_on_query = fail_on_query

    def write(self, command):
        self.log.append((self.name, command))

    def query(self, command):
        self.log.append((self.name, command))
        self.queries += 1
        if self.fail_on_query and self.queries == self.fail_on_query:
            raise RuntimeError('simulated instrument timeout')
        if command == ':SYSTem:ERRor?':
            return '+0,"No error"'
        if command == '*OPC?':
            return '1'
        return '0'


def run_with_fakes(module, fail_on_sa_query=None):
    log = []
    pair = {
        'sg': Instrument('SG', FakeTransport(log, 'SG')),
        'sa': Instrument('SA', FakeTransport(log, 'SA', fail_on_sa_query)),
    }
    with mock.patch.object(rfbench.cli, 'open_pair', return_value=pair):
        module.main([], echo=lambda _: None)
    return log


class EveryLabTests(unittest.TestCase):
    def test_labs_exist(self):
        self.assertGreaterEqual(len(LAB_MODULES), 2)

    def test_power_limit_comes_before_any_rf_on(self):
        for name in LAB_MODULES:
            with self.subTest(lab=name):
                log = run_with_fakes(importlib.import_module(f'labs.{name}'))
                sg = [cmd for who, cmd in log if who == 'SG']
                self.assertIn(':SOURce:POWer:USER:ENABle ON', sg)
                enable = sg.index(':SOURce:POWer:USER:ENABle ON')
                for i, cmd in enumerate(sg):
                    if cmd == ':OUTPut:STATe ON':
                        self.assertGreater(i, enable)

    def test_rf_is_off_at_the_end(self):
        for name in LAB_MODULES:
            with self.subTest(lab=name):
                log = run_with_fakes(importlib.import_module(f'labs.{name}'))
                sg = [cmd for who, cmd in log if who == 'SG']
                self.assertEqual(sg[-1], ':OUTPut:STATe OFF')

    def test_rf_is_off_after_a_failure(self):
        for name in LAB_MODULES:
            with self.subTest(lab=name):
                module = importlib.import_module(f'labs.{name}')
                log = []
                pair = {
                    'sg': Instrument('SG', FakeTransport(log, 'SG')),
                    'sa': Instrument('SA', FakeTransport(log, 'SA', fail_on_query=4)),
                }
                with mock.patch.object(rfbench.cli, 'open_pair', return_value=pair):
                    with self.assertRaises(RuntimeError):
                        module.main([], echo=lambda _: None)
                sg = [cmd for who, cmd in log if who == 'SG']
                self.assertEqual(sg[-1], ':OUTPut:STATe OFF')

    def test_dry_run_needs_no_pyvisa(self):
        for name in LAB_MODULES:
            with self.subTest(lab=name):
                lines = []
                self.assertEqual(importlib.import_module(f'labs.{name}').main([], echo=lines.append), 0)
                self.assertNotIn('pyvisa', sys.modules)
                self.assertTrue(any(line.endswith('results ===') for line in lines))


if __name__ == '__main__':
    unittest.main()
