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
const colors = require("colors");
const Log = require("./../display/log-util");
const MidiDevice = require("./midi-device");

class MidiController {
  /***
   *
   * @param options
   */
  constructor(options) {
    this._options = options;

    this._lastClockTime = process.hrtime();
    this._tickDurations = [];
    this._bpm = 0;

    let device = options.device;
    if (device) {
      this.initializeDevice(device);
    }
  }

  /***
   *
   * @param device
   */
  initializeDevice(device) {
    this._midiDevice = MidiDevice.getInstance(device);
    if (this._midiDevice.input) {
      this._midiDevice.input.ignoreTypes(true, false, true);
      this._midiDevice.input.on("message", this.receiveMessage.bind(this));
    }
  }

  /***
   *
   * @param deltaTime
   * @param message
   */
  receiveMessage(deltaTime, message) {
    let status = message[0];
    let d1 = message[1];
    let d2 = message[2];
    if (status >= 128 && status <= 239) {
      let channel = status & 0b00001111;
      status = status & 0b011110000;
      if (channel === this._options.channel - 1) {
        if (typeof this._options.receiveMessage === "function") {
          this._options.receiveMessage(status, d1, d2);
        }
        switch (status) {
          case 144: // Note on
            //Log.info(`Controller Note On:  ${colors.cyan(d1)} Velocity: ${colors.cyan(d2)}`);
            break;
          case 128: // Note off
            //Log.info(`Controller Note Off: ${colors.gray(d1)} Velocity: ${colors.gray(d2)}`);
            break;
          case 176: // Control Change
            //Log.info(`Controller Change: ${colors.magenta(d1)} Value: ${colors.magenta(d2)}`);
            break;
          default:
            Log.info(
              `Controller Message: ${colors.red(d1)},  ${colors.red(d2)}`
            );
        }
      }
    } else {
      switch (status) {
        case 248: // Timing
          this.clock();
          break;
        case 250: // Start
          this.start();
          Log.music(`System: Start ${status}`);
          break;
        case 252:
          this.stop();
          Log.music(`System: Stop ${status}`);
          break; // Stop
        default:
          Log.info(`System: ${status}`);
      }
    }
  }

  /***
   *
   * @param duration
   */
  updateClock(duration) {
    const historyLength = 36; // TODO Move constant
    const ppq = 24; // TODO Move constant
    this._tickDurations.push(duration);
    this._tickDurations = this._tickDurations.splice(
      Math.max(0, this._tickDurations.length - historyLength),
      historyLength
    );
    let tickMillis =
      this._tickDurations.reduce((sum, value) => sum + value) /
      this._tickDurations.length;
    let beatMillis = tickMillis * ppq;
    const millisPerMin = 60000;
    this._bpm = Math.round(millisPerMin / beatMillis);
  }

  /***
   *
   */
  clock() {
    let lastClockDur = process.hrtime(this._lastClockTime);
    this._lastClockTime = process.hrtime();
    let tickDuration = lastClockDur[0] / 1000.0 + lastClockDur[1] / 1000000.0;
    this.updateClock(tickDuration);

    if (this._options.clock) {
      this._options.clock(this._bpm);
    }
  }

  /***
   *
   */
  start() {
    if (this._options.start) {
      this._options.start();
    }
  }

  /***
   *
   */
  stop() {
    if (this._options.stop) {
      this._options.stop();
    }
  }

  outputTransportRun() {
    this._midiDevice.output.sendMessage([250]);
  }

  outputTransportStop() {
    this._midiDevice.output.sendMessage([252]);
  }

  outputTransportClock() {
    this._midiDevice.output.sendMessage([248]);
  }
}

const BeatStepControllerMap = {
  Knob1: 10,
  Knob2: 74,
  Knob3: 71,
  Knob4: 76,
  Knob5: 77,
  Knob6: 93,
  Knob7: 73,
  Knob8: 75,
  Knob9: 114,
  Knob10: 18,
  Knob11: 19,
  Knob12: 16,
  Knob13: 17,
  Knob14: 91,
  Knob15: 79,
  Knob16: 72,

  Pad1: 36,
  Pad2: 37,
  Pad3: 38,
  Pad4: 39,
  Pad5: 40,
  Pad6: 41,
  Pad7: 42,
  Pad8: 43,
  Pad9: 44,
  Pad10: 45,
  Pad11: 46,
  Pad12: 47,
  Pad13: 48,
  Pad14: 49,
  Pad15: 50,
  Pad16: 51,

  Stage1: 20,
  Stage2: 21,
  Stage3: 22,
  Stage4: 23,
  Stage5: 24,
  Stage6: 25,
  Stage7: 26,
  Stage8: 27,
  Stage9: 28,
  Stage10: 29,
  Stage11: 30,
  Stage12: 31,
  Stage13: 52,
  Stage14: 53,
  Stage15: 54,
  Stage16: 55
};
MidiController.BeatStepMap = BeatStepControllerMap;
module.exports = MidiController;
