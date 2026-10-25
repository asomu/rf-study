"""Instrument sessions for the SG + SA thru bench.

Dry-run is the default: every SCPI line is printed and nothing is sent.
Live mode imports PyVISA only when it is actually used, so tests and dry
runs work on machines without it.
"""

from typing import Callable, Dict, List, Optional, Tuple

SA_MAX_SAFE_INPUT_DBM = 30.0  # N9020B Specifications Guide 9018-04846, average total power
PRACTICE_LIMIT_DBM = 0.0      # docs/bench/SPEC.md safety contract


class InstrumentError(RuntimeError):
    """Raised when an instrument reports a non-zero entry in its error queue."""


class Transport:
    def write(self, command: str) -> None:
        raise NotImplementedError

    def query(self, command: str) -> str:
        raise NotImplementedError

    def close(self) -> None:
        pass


class DryRunTransport(Transport):
    """Prints commands and answers queries with harmless placeholders."""

    CANNED = {
        ':SYSTEM:ERROR?': '+0,"No error"',
        ':SYST:ERR?': '+0,"No error"',
        '*OPC?': '1',
    }

    def __init__(self, name: str, echo: Callable[[str], None] = print):
        self.name = name
        self.echo = echo

    def write(self, command: str) -> None:
        self.echo(f'[{self.name}] -> {command}')

    def query(self, command: str) -> str:
        self.echo(f'[{self.name}] ?> {command}')
        return self.CANNED.get(command.upper(), '<dry-run>')


class PyVisaTransport(Transport):
    def __init__(self, address: str, timeout_ms: int = 10000):
        import pyvisa  # imported here so dry runs never need PyVISA

        self._rm = pyvisa.ResourceManager()
        self._inst = self._rm.open_resource(address)
        self._inst.timeout = timeout_ms
        self._inst.read_termination = '\n'
        self._inst.write_termination = '\n'

    def write(self, command: str) -> None:
        self._inst.write(command)

    def query(self, command: str) -> str:
        return self._inst.query(command).strip()

    def close(self) -> None:
        self._inst.close()
        self._rm.close()


class Instrument:
    def __init__(self, name: str, transport: Transport):
        self.name = name
        self.transport = transport

    def write(self, command: str) -> None:
        self.transport.write(command)

    def query(self, command: str) -> str:
        return self.transport.query(command)

    def wait(self) -> None:
        """Block until earlier commands finish (*OPC? returns 1)."""
        self.query('*OPC?')

    def drain_errors(self, limit: int = 50) -> List[str]:
        """Read the error queue until it reports +0 and return what was in it."""
        found = []
        for _ in range(limit):
            reply = self.query(':SYSTem:ERRor?')
            if reply.split(',', 1)[0].strip().lstrip('+') in ('0', '<dry-run>'):
                return found
            found.append(reply)
        raise InstrumentError(f'{self.name}: error queue did not empty after {limit} reads')

    def check_errors(self) -> None:
        errors = self.drain_errors()
        if errors:
            raise InstrumentError(f'{self.name}: ' + '; '.join(errors))

    def close(self) -> None:
        self.transport.close()


def open_pair(live: bool, sg_address: Optional[str], sa_address: Optional[str],
              echo: Callable[[str], None] = print) -> Dict[str, Instrument]:
    if not live:
        return {'sg': Instrument('SG', DryRunTransport('SG', echo)), 'sa': Instrument('SA', DryRunTransport('SA', echo))}
    if not sg_address or not sa_address:
        raise SystemExit('--live needs both --sg and --sa VISA addresses')
    return {'sg': Instrument('SG', PyVisaTransport(sg_address)), 'sa': Instrument('SA', PyVisaTransport(sa_address))}


def arm_sg(sg: Instrument, limit_dbm: float) -> None:
    """RF off, then set and enable the user power limit before anything can turn RF on."""
    sg.write(':OUTPut:STATe OFF')
    sg.write(f':SOURce:POWer:USER:MAX {limit_dbm} dBm')
    sg.write(':SOURce:POWer:USER:ENABle ON')
    sg.check_errors()


def set_cw(sg: Instrument, freq_hz: float, level_dbm: float) -> None:
    """Pure CW: modulation off, frequency and level set, errors checked. RF stays as it was."""
    sg.write(':OUTPut:MODulation:STATe OFF')
    sg.write(f':SOURce:FREQuency:CW {freq_hz}')
    sg.write(f':SOURce:POWer:LEVel:IMMediate:AMPLitude {level_dbm} dBm')
    sg.check_errors()


def single_sweep(sa: Instrument) -> None:
    """Take one sweep and wait for it to finish before anything reads the trace."""
    sa.write(':INITiate:IMMediate')
    sa.wait()


def peak(sa: Instrument) -> Tuple[str, str]:
    """Peak search on marker 1 and return (X, Y) as the instrument reported them."""
    sa.write(':CALCulate:MARKer1:MAXimum')
    return sa.query(':CALCulate:MARKer1:X?'), sa.query(':CALCulate:MARKer1:Y?')


def format_table(rows: List[Tuple[str, str]]) -> str:
    width = max(len(name) for name, _ in rows)
    return '\n'.join(f'{name.ljust(width)}  {value}' for name, value in rows)


def check_practice_level(level_dbm: float, limit_dbm: float) -> None:
    if limit_dbm > PRACTICE_LIMIT_DBM:
        raise SystemExit(f'Power limit {limit_dbm} dBm is above the practice limit {PRACTICE_LIMIT_DBM} dBm')
    if level_dbm > limit_dbm:
        raise SystemExit(f'Level {level_dbm} dBm is above the power limit {limit_dbm} dBm')
