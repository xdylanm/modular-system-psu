# Module Design

## Background 

This is the second version of a design that I came up with near the very beginning of this project. The original [design notes](./assets/archive/design.ipynb) are located in the archive folder in this project along with the [schematic](./assets/archive/schematic/Schematic_USBC-12V-PSU_2024-03-01.pdf), [layout files](./assets/archive/layout/Layout-USBC-12V-PSU_2024-03-01.pdf), and [BOM](./assets/archive/BOM_USBC-12V-PSU_2024-03-01.csv). 

The first version was based around a [CYPD3177](https://www.infineon.com/part/CYPD3177-24LQXQ) USB-C PD controller, which negotiated a minimum 15V supply from the USB port. If available, this was then passed to three DCDC converters:

* an inverting SMPS based on the [LT3757A](https://www.analog.com/media/en/technical-documentation/data-sheets/lt3757-3757a.pdf), delivering -12V at 1.25A
* an LDO [L7812](https://www.st.com/resource/en/datasheet/l78.pdf) to generate the +12V rail (1.25A)
* a buck converter based on the [AP63205](https://www.diodes.com/part/view/AP63205) delivering +5V at 1A

This worked successfully with only a couple of minor modifications:

* I originally intended to generate -15V with the inverting SMPS and use an LDO to clean it up and deliver -12V, which proved unnecessary (the -12V from the SMPS seemed fine).
* I reduced the minimum supply current requested by the USB-C PD controller so that I could tolerate more adapters

However, this design is very complex (it's the only one that I've had completely manufactured and populated by JLC), and when I ran out of these, I decided some design changes were worthwhile.

## Design Considerations

For the second version, there were a few design choices. For the DC converters, another choice worth considering is the [Meanwell RT65B](https://www.meanwell.com/Upload/PDF/RT-65/RT-65-SPEC.PDF): 120-240VAC in, +/-12VDC and +5VDC out with lots of power. The only drawback might be that the -12V rail is limited to 500mA, but if I had known about this the first time, there probably wouldn't be a second revision. However, to accommodate a USB-C input, I chose to continue with separate DCDC paths.

### Custom SMPS or Brick

**+/-12V Regulator**

There are several isolated DCDC converters that provide +/-12V, including 

* Meanwell [DKE15A-12](https://www.meanwellusa.com/upload/pdf/DKE15/DKE15-spec.pdf)
* Recom [REC30K-2412DZ](https://recom-power.com/pdf/Econoline/REC30K(-Z).pdf)

These have wide supply ranges (9-36V) and provide +/-12V outputs at 15-30W. Originally, I chose a custom design to control the noise in the output, but it's not likely that the complexity is worth it, and the BOM savings are negligible (the LT3757A is now in the $7 range for singles).

Conclusion: REC30K-2412DZ and some output filtering (to be evaluated).

**+5V Regulator**

For the +5V supply, I considered keeping the previous design based on the AP63205, but decided to update to an [AP63301](https://www.diodes.com/part/view/AP63301) for a slight spec bump.

### Supply Inputs

**USB-C** 

I wanted to keep the USB-C input, but considered expanding the range to support lower power adapters that supply 9V or 12V. However, I wanted to avoid requiring a microcontroller to pair with the USB-C PD controller.

* CYPD3177: it can be configured to negotiate for a min/max V with external resistors, but has a higher design complexity and only comes in a QFN package
* [CH224A](https://www.lcsc.com/datasheet/C42459160.pdf): the successor to the CH224K in the popular (cheap) PD trigger boards on aliexpress; no current negotiation and only supports a single voltage, comes in a SOP package.

Both options can be configured to only switch on the power path when a 15V supply is successfully negotiated, although this does not appear in the reference design for the CH224A. 

Conclusion: CH224A, 15V only (45W USB-C adapaters are relatively common and minimum current isn't a hard limit; assembly is easier with the CH224A)

**Barrel Jack**

I thought about adding an optional barrel jack for a 9-20VDC supply. This required some power-OR'ing if side by side with the USB-C source, but not a large increase in part count. 12VDC adapters are fairly common, but it wasn't obvious how much better that was that just going with the USB-C.

Conclusion: no barrel jack option.

**Battery**

A portable rig? Exciting! Also, complicated, requiring

* a 3S lipo cell (11.6-12.6V)
* charging circuitry capable of boosting the input (particularly if 12V supplies are allowed)
* power prioritization to the Eurorack rails while plugged in
* additional power-OR'ing when the external supply is disconnected

A better alternative: an external 60W USB-C powerbank, which is cheaper than the battery.

Conclusion: no battery.

### Other Features

**On/off Switch** 

Avoid plugging & unplugging the USB-C to switch the modular synth on and off.

**USB-A Output**

This seemed like a nice one: use the 5V rail to supply up to 500mA (unregulated, shared with the Eurorack supply) if you want to plug a USB-A device in. This would enable connecting something like a keyboard (e.g. my Arturia Keystep). 

## Implementation

### USB-C Input

The [CH224A](https://www.lcsc.com/datasheet/C42459160.pdf) handles the USB-C PD negotiation and can be configured to request 15V with RSET=56k. It provides a "power good" (PG) pin in a common-drain configuration (active low), which is used to pull down the gate on a PMOS if the negotiation is successful. 

The PMOS is a [DMP3056LS](https://www.diodes.com/assets/Datasheets/ds31419.pdf)

* $V_{GSS,max} = \pm 20V$
* $V_{DSS,max} =  -30V$
* $I_{D,max} = -6A$
* $R_{DS(ON)} = 65m\Omega$
* $Q_{G} = 14nC$

The gate is pulled up to the source with a 22k resistor. A 12V Zener diode is added in parallel with the pull-up to protect the PMOS from exceeding $V_{GSS,max}$, and a 1k resistor is added in series between the gate and the PG pin on the CH224A to limit the current through the Zener.  

### Power Switch

Requirements based on max. 60W draw from the board (4A @ 15V): >24V, >4A. Ideally it should have PC pins (directly mount on PCB), although this complicates attaching it to the faceplate.

Some options (all from Digikey)

| PN | DC current (A) | DC voltage (V) | Cost | Description | 
|----|------------|------------|------|-------------|
|PB400EEQR1BLK | 3 | 30 | 2.09 | push button, DPST, R/A PC pins |
|NE18CTII 2A EE SN P 4AMP | 4 | 100 | 10.10 | push button, DPST, 30mm footprint, R/A PC pins |
|300SP1J1BLKM6QE | 5 | 28 | 4.08 | rocker, SPDT, R/A PC pins |
|ANR11R11P2HQE | 5 | 28 | 2.98 | rocker, SPDT, R/A PC pins |
|400AWMSP1R1BLKM6QE| 3 | 28 | 3.83 |rocker, SPDT, R/A PC pins |
|400BWMSP1R2BLKSM6QE-Z103| 3 | 28 | 5.52 | rocker, SPDT, R/A SMT, markings |

Conclusion: 300SP1J1BLKM6QE (E-Switch)

### Dual +/-12V DCDC Converter

The data sheet for the [REC30K-2412DZ](https://recom-power.com/pdf/Econoline/REC30K(-Z).pdf) indicates a typical ripple current of 80mVp-p and a switching frequency of 265kHz. The ripple current is measured with a conservative capacitive loading (10uF in parallel with 100n). 

While the switching frequency is well outside the audio range, for this design I've added a second order resonant (LC) low-pass filter (e.g. "parallel damped filter" in ref. [1](#input-filter-design)). The design is detailed in the [notebook](./notebook.ipynb): choosing 

* $C=47\mu F$ ($25V$)
* $L=10\mu H$ ($2A$, $40m\Omega$)

and adding a series damped capacitor ($C_d = 220\mu F$, $R_d=500m\Omega$) yields the transfer function plotted below.

![LC filter response](./assets/images/LC_filter_response.png)

This filter has a slight resonance (3dB peak) at 4.8kHz and over 60dB of attenutation at the switching frequency. 

### 5V Buck Converter

The design for the 5V buck converter comes directly from the [AP63301](https://www.diodes.com/part/view/AP63301). The inductor value for the buck regulator is related to the switching frequency and ripple current:

$$ 
L = \frac{V_{out}\left(V_{in} - V_{out}\right)}{V_{in} \Delta I_L f_{sw}}
$$

Selecting $L=6.8\mu H$ and using $f_{sw} = 500kHz$, $V_{out}=5V$, and $V_{in} = 15V$, the ripple current is $\Delta I_{L}=1A$, which is consistent with the datasheet recommendation to pick $\Delta I_{L}$ between 30% and 50% of the maximum load (3A). Therefore, the peak current in the inductor will be (using a conservative $I_{load}=2A$)

$$
I_{L,max} = I_{load} + \frac{\Delta I_L}{2} = 2 + 0.5 = 2.5A
$$

The selected inductor (MGAH06036R8M-10) is rated to 5A with a max. DCR of $50m\Omega$.

The output capacitance is related to the output ripple:

$$
\Delta V_{out} = \Delta I_L \left(R_{C,ESR} + \frac{1}{8 f_{sw} C_{out}}\right)
$$

The capacitance derating at a 5V DC bias can exceed 60%. Typical ESR plots ([example](https://pim.murata.com/en-global/pim/details/?partNum=GRM31CR61C476ME44L)) show very low ESRs near the switching frequency ($<5m\Omega$), which can be reduced further by connecting capacitors in parallel. For a ripple voltage below 10mV, choose $2\times 47\muF$ 16V capacitors with $ESR<3m\Omega$.


## References

1. <a id="input-filter-design"></a>"Input Filter Design for Switching Power Supplies", App. Note SNVA538, TI, [ti.com](https://www.ti.com/lit/an/snva538/snva538.pdf)
2. <a id="low-noise-techniques"></a>"Low-Noise and Low-Ripple Techniques for a Supply Without an LDO", App. Note SLUP409, TI, [ti.com](https://www.ti.com/lit/ml/slup409c/slup409c.pdf) 