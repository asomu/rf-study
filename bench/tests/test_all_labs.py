"""Safety contract every bench lab must keep (docs/bench/SPEC.md §3).

Each lab module may declare ROLES (default ('sg', 'sa')). Per role:
- sg:  user power limit enabled before any RF on; RF off is the last SG command.
- vna: port power set before any RF on; RF off is the last VNA command.
- ps:  OVP and OCP set before any output on; output off is the last PS command.
- pm:  read-only, no extra rule.
"""

import importlib
import pkgutil
import sys
import unittest
from unittest import mock

import labs
import rfbench.cli
from rfbench.session import ROLE_NAMES, Instrument, Transport

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


def roles_of(module):
    return tuple(getattr(module, 'ROLES', ('sg', 'sa')))


def run_with_fakes(module, fail_role=None):
    log = []
    insts = {
        role: Instrument(ROLE_NAMES[role], FakeTransport(log, ROLE_NAMES[role], 2 if role == fail_role else None))
        for role in roles_of(module)
    }
    with mock.patch.object(rfbench.cli, 'open_instruments', return_value=insts):
        module.main([], echo=lambda _: None)
    return log


def commands(log, role):
    return [cmd for who, cmd in log if who == ROLE_NAMES[role]]


def assert_armed_before_on(test, cmds, arm_prefixes, on_prefix):
    arm_indexes = []
    for prefix in arm_prefixes:
        hits = [i for i, cmd in enumerate(cmds) if cmd.startswith(prefix)]
        test.assertTrue(hits, f'missing {prefix}')
        arm_indexes.append(hits[0])
    for i, cmd in enumerate(cmds):
        if cmd.startswith(on_prefix):
            test.assertGreater(i, max(arm_indexes), f'{on_prefix} before arming')


ARM_RULES = {
    'sg': ([':SOURce:POWer:USER:ENABle ON'], ':OUTPut:STATe ON', ':OUTPut:STATe OFF'),
    'vna': ([':SOURce1:POWer:LEVel:IMMediate:AMPLitude'], ':OUTPut:STATe ON', ':OUTPut:STATe OFF'),
    'ps': ([':SOURce:VOLTage:PROTection:LEVel', ':SOURce:CURRent:PROTection:STATe ON'], ':OUTPut:STATe ON', ':OUTPut:STATe OFF'),
}


class EveryLabTests(unittest.TestCase):
    def test_labs_exist(self):
        self.assertGreaterEqual(len(LAB_MODULES), 2)

    def test_outputs_are_armed_before_turning_on(self):
        for name in LAB_MODULES:
            module = importlib.import_module(f'labs.{name}')
            log = run_with_fakes(module)
            for role in roles_of(module):
                if role in ARM_RULES:
                    with self.subTest(lab=name, role=role):
                        arm, on, _ = ARM_RULES[role]
                        assert_armed_before_on(self, commands(log, role), arm, on)

    def test_outputs_are_off_at_the_end(self):
        for name in LAB_MODULES:
            module = importlib.import_module(f'labs.{name}')
            log = run_with_fakes(module)
            for role in roles_of(module):
                if role in ARM_RULES:
                    with self.subTest(lab=name, role=role):
                        self.assertTrue(commands(log, role)[-1].startswith(ARM_RULES[role][2]))

    def test_outputs_are_off_after_a_failure(self):
        for name in LAB_MODULES:
            module = importlib.import_module(f'labs.{name}')
            fail_role = roles_of(module)[-1]
            with self.subTest(lab=name, failing=fail_role):
                log = []
                insts = {
                    role: Instrument(ROLE_NAMES[role], FakeTransport(log, ROLE_NAMES[role], 2 if role == fail_role else None))
                    for role in roles_of(module)
                }
                with mock.patch.object(rfbench.cli, 'open_instruments', return_value=insts):
                    with self.assertRaises(RuntimeError):
                        module.main([], echo=lambda _: None)
                for role in roles_of(module):
                    if role in ARM_RULES:
                        self.assertTrue(commands(log, role)[-1].startswith(ARM_RULES[role][2]), role)

    def test_dry_run_needs_no_pyvisa(self):
        for name in LAB_MODULES:
            with self.subTest(lab=name):
                lines = []
                self.assertEqual(importlib.import_module(f'labs.{name}').main([], echo=lines.append), 0)
                self.assertNotIn('pyvisa', sys.modules)
                self.assertTrue(any(line.endswith('results ===') for line in lines))


if __name__ == '__main__':
    unittest.main()
