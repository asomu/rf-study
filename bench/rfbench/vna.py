"""E5071C helpers shared by the VNA labs (commands from the E5071C online command reference)."""

import time
from typing import List, Optional

from rfbench.session import Instrument


def setup_stimulus(vna: Instrument, start_hz: float, stop_hz: float, points: int, ifbw_hz: float) -> None:
    vna.write(f':SENSe1:FREQuency:STARt {start_hz}')
    vna.write(f':SENSe1:FREQuency:STOP {stop_hz}')
    vna.write(f':SENSe1:SWEep:POINts {points}')
    vna.write(f':SENSe1:BANDwidth:RESolution {ifbw_hz}')
    vna.check_errors()


def show(vna: Instrument, parameter: str, fmt: str) -> None:
    """Trace 1 shows `parameter` (S11, S21, ...) in format `fmt` (MLOG, SWR, SMIT, GDEL, PHAS)."""
    vna.write(f':CALCulate1:PARameter1:DEFine {parameter}')
    vna.write(':CALCulate1:PARameter1:SELect')
    vna.write(f':CALCulate1:SELected:FORMat {fmt}')
    vna.check_errors()


def bus_sweep(vna: Instrument) -> float:
    """One sweep on BUS trigger; returns the measured time in ms."""
    vna.write(':TRIGger:SEQuence:SOURce BUS')
    vna.write(':INITiate1:CONTinuous ON')
    started = time.perf_counter()
    vna.write(':TRIGger:SEQuence:SINGle')
    vna.wait()
    return (time.perf_counter() - started) * 1000


def marker_value(vna: Instrument, freq_hz: float) -> str:
    """Marker 1 at freq; returns the primary value (first of the two the E5071C returns)."""
    vna.write(':CALCulate1:SELected:MARKer1:STATe ON')
    vna.write(f':CALCulate1:SELected:MARKer1:X {freq_hz}')
    reply = vna.query(':CALCulate1:SELected:MARKer1:Y?')
    return reply.split(',')[0]


def marker_pair(vna: Instrument, freq_hz: float) -> str:
    vna.write(':CALCulate1:SELected:MARKer1:STATe ON')
    vna.write(f':CALCulate1:SELected:MARKer1:X {freq_hz}')
    return vna.query(':CALCulate1:SELected:MARKer1:Y?')


def formatted_trace(vna: Instrument) -> Optional[List[float]]:
    """Primary values of FDATA (every other number), or None when the reply is not numeric."""
    reply = vna.query(':CALCulate1:SELected:DATA:FDATa?')
    try:
        numbers = [float(x) for x in reply.split(',')]
    except ValueError:
        return None
    return numbers[0::2]
