"""USB power sensor helpers (Keysight power sensor SCPI, U2000 Series guide; recheck on U2053XA)."""

from rfbench.session import Instrument


def prepare(pm: Instrument) -> None:
    """Single measurements with READ?, dBm units, no leftover offsets or duty cycle."""
    pm.write('INITiate1:CONTinuous OFF')
    pm.write('UNIT1:POWer DBM')
    pm.write('SENSe1:CORRection:GAIN2:STATe OFF')
    pm.write('SENSe1:CORRection:DCYCle:STATe OFF')
    pm.check_errors()


def zero(pm: Instrument) -> None:
    """Internal zero; RF must be off at the sensor input."""
    pm.write('CALibration1:ZERO:TYPE INTernal')
    pm.write('CALibration1:ZERO:AUTO ONCE')
    pm.wait()
    pm.check_errors()


def read_power(pm: Instrument, freq_hz: float) -> str:
    """Set the cal-factor frequency, then READ? (starts a fresh measurement)."""
    pm.write(f'SENSe1:FREQuency {freq_hz}')
    return pm.query('READ1?')


def set_average(pm: Instrument, count: int) -> None:
    pm.write(f'SENSe1:AVERage:COUNt {count}')
    pm.write('SENSe1:AVERage:STATe ON')
    pm.check_errors()
