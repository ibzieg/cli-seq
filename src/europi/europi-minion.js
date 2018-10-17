/******************************************************************************
 * Copyright 2017 Ian Bertram Zieg
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

/******************************************************************************
 * Parts of the code below are adapted from the Europi project.
 * The Europi Minion module allows output of Eurorack-compatible voltages using
 * the Raspberry Pi's I2C bus.
 *
 * https://github.com/AudioMorphology/Europi
 * Author: Richard R. Goodwin (richard.goodwin@morphology.co.uk)
 ******************************************************************************/
const raspi = require("raspi");

let isDeviceRaspberryPi = true;
try {
  require.resolve("raspi-i2c");
} catch (error) {
  isDeviceRaspberryPi = false;
}
const I2C = isDeviceRaspberryPi ? require("raspi-i2c").I2C : null;

const NanoTimer = require("nanotimer");

const Log = require("./../display/log-util");

const DAC_BASE_ADDR = 0x4c;
/* Base i2c addressof DAC8574 */
const MCP_BASE_ADDR = 0x20;
/* Base i2c address of MCP23008 GPIO Expander */
const MCP_CONTROL_REG = 0x9;
/* Control Register for MCP23008 GPIO Expander */
const HIGH = 1;
const LOW = 0;

class EuropiMinion {
  /**
   * @return {boolean}
   */
  get isInitialized() {
    return this._mcp23008_initialized && isDeviceRaspberryPi;
  }

  /**
   * @return {number}
   */
  get MCP23008Address() {
    return MCP_BASE_ADDR | (this._i2cAddress & 0x7);
  }

  /**
   * @return {number}
   */
  get DAC8574Address() {
    return DAC_BASE_ADDR | (this._i2cAddress & 0x7);
  }

  /***
   *
   * @param i2cAddress
   */
  constructor(i2cAddress) {
    if (typeof i2cAddress !== "number") {
      i2cAddress = 0x0;
    }
    this._i2cAddress = i2cAddress;

    this._timers = [];

    if (!isDeviceRaspberryPi) {
      Log.error(
        "I2C interface cannot be initialized: 'raspi-i2c' module not detected"
      );
      return;
    }
    this.initializeI2CDevice();
  }

  /***
   *
   */
  initializeI2CDevice() {
    this._mcp23008_initialized = false;
    this._mcp23008_state = 0;
    this._I2C = new I2C(["P1-3", "P1-5"]);
    this._I2C.writeWord(this.MCP23008Address, 0x0, 0x0, error => {
      if (error) {
        Log.error(
          `MCP23008 unavailable at address 0x${Number(
            this.MCP23008Address
          ).toString(16)}: ${error} `
        );
      } else {
        this._mcp23008_initialized = true;
        Log.success(
          `MCP23008 initialized at address 0x${Number(
            this.MCP23008Address
          ).toString(16)} `
        );
      }
    });
  }

  /***
   *
   * Outputs the passed value to the GATE output identified
   * by the Handle to the Open device, and the channel (0-3)
   * As this is just a single bit, this function has to
   * read the current state of the other gates on the GPIO
   * extender, incorporate this value, then write everything
   * back.
   * Note that, on the Minion, the Gates are on GPIO Ports 0 to 3,
   * though the gate indicator LEDs are on GPIO Ports 4 to 7, so
   * the output values from ports 0 to 3 need to be mirrored
   * to ports 4 - 7
   *
   * @param channel
   * @param value
   */
  GateOutput(/*uint8_t*/ channel, /*int*/ value) {
    if (!this.isInitialized) {
      return;
    }

    if (value > 0) {
      // Set corresponding bit high
      this._mcp23008_state |= 0x01 << channel; // Gate bit
      this._mcp23008_state |= 0x01 << (channel + 4); // LED bit
    } else {
      // Set corresponding bit low
      this._mcp23008_state &= ~(0x01 << channel); // Gate bit
      this._mcp23008_state &= ~(0x01 << (channel + 4)); // LED bit
    }

    this._I2C.writeByte(
      this.MCP23008Address,
      MCP_CONTROL_REG,
      this._mcp23008_state,
      error => {
        if (error) {
          Log.error(`GateOutput: ${error} `);
        }
      }
    );
  }

  /***
   *
   * @param channel 0-3
   * @param duration milliseconds
   */
  GatePulse(channel, /*milliseconds*/ duration) {
    this.GateOutput(channel, HIGH);
    this._timers[channel] = setTimeout(() => {
      this.GateOutput(channel, LOW);
    }, duration);
  }

  /***
   *
   * DAC8574 16-Bit DAC single channel write
   * Channel, in this context is the full 6-Bit address
   * of the channel - ie [A3][A2][A1][A0][C1][C0]
   * [A1][A0] are ignored, because we already have a
   * handle to a device on that address.
   * [A3][A2] are significant, as they need to match
   * the state of the address lines on the DAC
   * The ctrl_reg needs to look like this:
   * [A3][A2][0][1][x][C1][C0][0]
   *
   * @param channel 0-3
   * @param voltage 0.0-1.0
   */
  CVOutput(/*0 - 3*/ channel, /*0.0 - 1.0*/ voltage) {
    if (!this.isInitialized) {
      return;
    }

    voltage = (voltage * 0xffff) & 0xffff;

    let /*uint16_t*/ v_out;
    let /*uint8_t*/ ctrl_reg;

    ctrl_reg = ((this._address & 0xc) << 4) | 0x10 | ((channel << 1) & 0x06);

    //swap MSB & LSB because i2cWriteWordData sends LSB first, but the DAC expects MSB first
    v_out = ((voltage >> 8) & 0x00ff) | ((voltage << 8) & 0xff00);
    //Log.debug(`DACSingleChannelWrite: channel=${channel} voltage=${voltage} ctrl_reg=0b${Number(ctrl_reg).toString(2)} v_out=0b${Number(v_out).toString(2)} `);
    this._I2C.writeWord(this.DAC8574Address, ctrl_reg, v_out, error => {
      if (error) {
        Log.error(`CVOutput: ${error}`);
      }
    });
  }

  /***
   *
   * Data gathered from CVA.
   0.0958 = 1.000V
   0.1923 = 2.000V  d = 0.0965
   0.2888 = 3.000V  d = 0.0965
   0.3851 = 4.000V  d = 0.0963
   0.4819 = 5.000V  d = 0.0968
   0.5783 = 6.000V  d = 0.0964
   0.6742 = 7.000V  d = 0.09589
   0.7704 = 8.000V  d = 0.09619
   0.8667 = 9.000V  d = 0.0963
   0.9631 = 10.000V d = 0.0963
   * @param pitch
   * @returns {number}
   */
  static pitchToCV(pitch) {
    let octaveRef = [
      0.0958,
      0.1923,
      0.2888,
      0.3851,
      0.4819,
      0.5783,
      0.6742,
      0.7704,
      0.8667,
      0.9631
    ];

    let octave = Math.floor(pitch / 12);
    let note = pitch - octave * 12;

    if (octave < 0) octave = 0;
    if (octave > 8) octave = 8;

    let octaveCV = octaveRef[octave];
    let nextOctaveCV = octaveRef[octave + 1];

    let range = nextOctaveCV - octaveCV;
    let cv = octaveCV + (note / 12.0) * range;

    //Log.debug(`pitch=${pitch} octave=${octave} note=${note} octaveCV=${octaveCV} nextOctaveCV=${nextOctaveCV} range=${range} cv=${cv}`);

    return cv;
  }
}

module.exports = EuropiMinion;
