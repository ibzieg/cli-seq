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

let MidiDevice = require("./midi-device");

const Log = require("./../display/log-util");

class MidiInstrument {
  static get instruments() {
    return instruments;
  }

  static get drumMap() {
    return drumMap;
  }

  get channel() {
    return this._options.channel;
  }

  get isConnected() {
    return this._midiDevice.outputStatus;
  }

  constructor(options) {
    this._options = options;
    this._midiDevice = MidiDevice.getInstance(options.device);
  }

  play(note, velocity, duration) {
    let noteOnStatus = 144 + this.channel - 1;
    let noteOffStatus = 128 + this.channel - 1;

    if (this._midiDevice.outputStatus) {
      try {
        this._midiDevice.output.sendMessage([noteOnStatus, note, velocity]);
      } catch (ex) {
        Log.error(
          `Failed to send MIDI message [${noteOnStatus},${note},${velocity}]: ${ex}`
        );
      }
      setTimeout(() => {
        try {
          this._midiDevice.output.sendMessage([noteOffStatus, note, velocity]);
        } catch (ex) {
          Log.error(
            `Failed to send MIDI message [${noteOnStatus},${note},${velocity}]: ${ex}`
          );
        }
      }, duration);
    }
  }
}

module.exports = MidiInstrument;

const drumMap = [36, 38, 39, 42, 46, 49, 75, 67];
