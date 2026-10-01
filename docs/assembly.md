# Assembly Guide

## Populate the PCB

A stencil is recommended to apply solder paste. Place the SMT components and reflow. 

Place and solder THT components. Start with

* IDC header
* Molex header
* USB-A receptacle

Place the USB-C receptacle. To solder it, 

* solder the pins for the frame as usual
* place a small bead of solder on each of the plated through-holes for the pins (fine pitch) with the tip of the soldering iron
* use a hot air gun to reflow the solder and ensure it wicks into the PTHs

Place and solder the switch. Next, place the REC30K. To solder it, use a combination of soldering iron and hot air simultaneously. Finally, place the 3mm LED by locating it in its hole in the face-plate and bending the pins (note the cathode location) to align to the holes on the PCB. Solder it in place.

!!! note

    For Rev. 1.1 boards, bridge the +VIN and CTRL pins of the REC30K with a 4.7uF capacitor to ensure that the PSU starts in the off state when first plugged in.

## BOM

[Download (.csv)](assets/bom.csv)

{%include-markdown "assets/bom.md"%}










