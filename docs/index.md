# Modular System PSU

A power supply unit (PSU) for a modular Eurorack system, featuring +/-12V and 5V rails, USB-C input, and a regulated USB-A output.

* Module size: 4HP (20 mm)
* Power output: 1.25A (+12V); 1.25A (-12V); 1.2A (+5V)

!!! repository "Project Source"

    The project files, including schematic and layout, are available on [github](https://github.com/xdylanm/modular-system-psu)

## Features

This design is based around a USB-C input: 45W-60W USB-C adapters are readily available and can provide a 15V DC input, which can be converted to the standard Eurorack supply rails.

* USB-C input
    * minimum 45W 15V-capable USB-C PD supply
* Power on/off switch
* Regulated 5V/500mA USB-A output (e.g. power a keyboard over USB)
* Eurorack power rails
    * +/-12V at 1.25A (30W total)
    * +5V at 1.2A (6W total, shared with USB-A)
* Multiple power bus connection options
    * Eurorack-conforming IDC header 
    * Molex Micro-Fit header (compatible with cabling for ATX PSUs)
* Front-panel or back-of-case mounting options

## Documentation

[Theory](theory.md)

[Assembly Guide](assembly.md)

[Schematic](assets/schematic.pdf)

## References

1. Trolley Bus, Befaco, online [befaco.com](https://www.befaco.org/trolley-bus/)
