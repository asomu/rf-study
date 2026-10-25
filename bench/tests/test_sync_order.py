import unittest
from unittest import mock

import rfbench.cli
from labs import lab_sync_test_point
from rfbench.session import ROLE_NAMES, Instrument, InstrumentError
from tests.test_all_labs import FakeTransport


class SyncOrderTests(unittest.TestCase):
    def run_lab(self, argv):
        log = []
        insts = {role: Instrument(ROLE_NAMES[role], FakeTransport(log, ROLE_NAMES[role])) for role in lab_sync_test_point.ROLES}
        with mock.patch.object(rfbench.cli, 'open_instruments', return_value=insts):
            lab_sync_test_point.main(argv, echo=lambda _: None)
        return log

    def assert_dc_before_rf_and_rf_off_before_dc_off(self, log):
        order = [(who, cmd) for who, cmd in log if cmd.startswith(':OUTPut:STATe')]
        dc_on = order.index(('PS', ':OUTPut:STATe ON,(@1)'))
        rf_on = order.index(('SG', ':OUTPut:STATe ON'))
        self.assertLess(dc_on, rf_on)
        self.assertEqual(order[-2:], [('SG', ':OUTPut:STATe OFF'), ('PS', ':OUTPut:STATe OFF,(@1)')])

    def test_normal_run_order(self):
        self.assert_dc_before_rf_and_rf_off_before_dc_off(self.run_lab([]))

    def test_failure_keeps_rf_off_before_dc_off(self):
        log = []
        insts = {role: Instrument(ROLE_NAMES[role], FakeTransport(log, ROLE_NAMES[role])) for role in lab_sync_test_point.ROLES}
        with mock.patch.object(rfbench.cli, 'open_instruments', return_value=insts):
            with self.assertRaises(InstrumentError):
                lab_sync_test_point.main(['--fail-at', 'sa'], echo=lambda _: None)
        self.assert_dc_before_rf_and_rf_off_before_dc_off(log)


if __name__ == '__main__':
    unittest.main()
