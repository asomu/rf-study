"""N6700C helpers (N6700C Operating and Service Guide, SCPI reference)."""

from rfbench.session import Instrument


def module(ps: Instrument, channel: int) -> str:
    return ps.query(f':SYSTem:CHANnel:MODel? (@{channel})')


def set_output(ps: Instrument, channel: int, volts: float, current_limit_a: float) -> None:
    ps.write(f':SOURce:VOLTage:LEVel:IMMediate:AMPLitude {volts},(@{channel})')
    ps.write(f':SOURce:CURRent:LEVel:IMMediate:AMPLitude {current_limit_a},(@{channel})')
    ps.check_errors()


def measure(ps: Instrument, channel: int):
    """(volts, amps) as reported."""
    return ps.query(f':MEASure:SCALar:VOLTage:DC? (@{channel})'), ps.query(f':MEASure:SCALar:CURRent:DC? (@{channel})')


def output(ps: Instrument, channel: int, on: bool) -> None:
    ps.write(f':OUTPut:STATe {"ON" if on else "OFF"},(@{channel})')
    ps.wait()
