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

    def query_binary_floats(self, command: str) -> List[float]:
        """IEEE 488.2 definite-length block of 32-bit floats; empty unless a real instrument answers."""
        self.query(command)
        return []

    def set_timeout(self, timeout_ms: int) -> None:
        pass

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

    def query_binary_floats(self, command: str) -> List[float]:
        # Pair with :FORMat:TRACe:DATA REAL,32 and :FORMat:BORDer SWAPped (little-endian)
        return list(self._inst.query_binary_values(command, datatype='f', is_big_endian=False))

    def set_timeout(self, timeout_ms: int) -> None:
        self._inst.timeout = timeout_ms

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

    def query_binary_floats(self, command: str) -> List[float]:
        return self.transport.query_binary_floats(command)

    def set_timeout(self, timeout_ms: int) -> None:
        self.transport.set_timeout(timeout_ms)

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


ROLE_NAMES = {'sg': 'SG', 'sa': 'SA', 'vna': 'VNA', 'pm': 'PM', 'ps': 'PS'}

VNA_PRACTICE_LIMIT_DBM = 0.0   # E5071C max test port input +10 dBm (data sheet 5989-5479EN); keep well below
PS_PRACTICE_MAX_V = 5.0        # bench practice without a known DUT
PS_PRACTICE_MAX_A = 0.5


def open_instruments(live: bool, addresses: Dict[str, Optional[str]],
                     echo: Callable[[str], None] = print) -> Dict[str, Instrument]:
    """Open one Instrument per role ('sg', 'sa', 'vna', 'pm', 'ps'). Dry-run unless live."""
    if not live:
        return {role: Instrument(ROLE_NAMES[role], DryRunTransport(ROLE_NAMES[role], echo)) for role in addresses}
    missing = [role for role, address in addresses.items() if not address]
    if missing:
        raise SystemExit('--live needs VISA addresses for: ' + ', '.join(f'--{role}' for role in missing))
    return {role: Instrument(ROLE_NAMES[role], PyVisaTransport(address)) for role, address in addresses.items()}


def open_pair(live: bool, sg_address: Optional[str], sa_address: Optional[str],
              echo: Callable[[str], None] = print) -> Dict[str, Instrument]:
    return open_instruments(live, {'sg': sg_address, 'sa': sa_address}, echo)


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


def setup_sa(sa: Instrument, center_hz: float, span_hz: float, rbw_hz: Optional[float] = None) -> None:
    """Single-sweep swept SA with marker 1 on; RBW fixed when given, otherwise Auto."""
    sa.write(':INITiate:CONTinuous OFF')
    sa.write(f':SENSe:FREQuency:CENTer {center_hz}')
    sa.write(f':SENSe:FREQuency:SPAN {span_hz}')
    if rbw_hz is None:
        sa.write(':SENSe:BANDwidth:RESolution:AUTO ON')
    else:
        sa.write(f':SENSe:BANDwidth:RESolution {rbw_hz}')
    sa.write(':CALCulate:MARKer1:MODE POSition')
    sa.check_errors()


def level_at(sa: Instrument, freq_hz: float, marker: int = 1) -> str:
    """Put a marker on a frequency and read its Y value (no peak search)."""
    sa.write(f':CALCulate:MARKer{marker}:X {freq_hz}')
    return sa.query(f':CALCulate:MARKer{marker}:Y?')


def options(inst: Instrument) -> Optional[set]:
    """Installed option codes from *OPT?, or None when the reply is a dry-run placeholder."""
    reply = inst.query('*OPT?').strip().strip('"')
    if reply.startswith('<dry-run>'):
        return None
    return {part.strip().upper() for part in reply.split(',') if part.strip()}


def has_any_option(inst: Instrument, codes) -> Optional[bool]:
    """True/False if any code is installed, or None when unknown (dry run)."""
    installed = options(inst)
    if installed is None:
        return None
    return bool(installed & {code.upper() for code in codes})


def difference(a: str, b: str) -> str:
    """a - b in dB, or a note when the inputs are dry-run placeholders."""
    try:
        return f'{float(a) - float(b):.2f}'
    except ValueError:
        return '<needs live readings>'


def format_table(rows: List[Tuple[str, str]]) -> str:
    width = max(len(name) for name, _ in rows)
    return '\n'.join(f'{name.ljust(width)}  {value}' for name, value in rows)


def arm_vna(vna: Instrument, port_power_dbm: float, channel: int = 1) -> None:
    """Set port power before the stimulus is on (E5071C preset leaves RF ON at 0 dBm)."""
    if port_power_dbm > VNA_PRACTICE_LIMIT_DBM:
        raise SystemExit(f'VNA port power {port_power_dbm} dBm is above the practice limit {VNA_PRACTICE_LIMIT_DBM} dBm')
    vna.write(':OUTPut:STATe OFF')
    vna.write(f':SOURce{channel}:POWer:LEVel:IMMediate:AMPLitude {port_power_dbm}')
    vna.check_errors()


def arm_ps(ps: Instrument, channel: int, ovp_v: float, current_limit_a: float) -> None:
    """Output off, then OVP, current limit and OCP before anything can turn the output on."""
    if ovp_v > PS_PRACTICE_MAX_V * 1.2 or current_limit_a > PS_PRACTICE_MAX_A:
        raise SystemExit(f'PS limits {ovp_v} V / {current_limit_a} A exceed the practice limits')
    ps.write(f':OUTPut:STATe OFF,(@{channel})')
    ps.write(f':SOURce:VOLTage:PROTection:LEVel {ovp_v},(@{channel})')
    ps.write(f':SOURce:CURRent:LEVel:IMMediate:AMPLitude {current_limit_a},(@{channel})')
    ps.write(f':SOURce:CURRent:PROTection:STATe ON,(@{channel})')
    ps.check_errors()


def check_practice_level(level_dbm: float, limit_dbm: float) -> None:
    if limit_dbm > PRACTICE_LIMIT_DBM:
        raise SystemExit(f'Power limit {limit_dbm} dBm is above the practice limit {PRACTICE_LIMIT_DBM} dBm')
    if level_dbm > limit_dbm:
        raise SystemExit(f'Level {level_dbm} dBm is above the power limit {limit_dbm} dBm')
