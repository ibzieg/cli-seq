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

const midi = require("midi");
const colors = require("colors");
const Log = require("./../display/log-util");
const ExternalDevices = require("./external-devices");

class MidiDevice {
  /***
   *
   * @returns {{BeatStepPro: {names: [string,string,string,string], instance: null}, Minilogue: {names: [string,string,string], instance: null}, MOTU828x: {names: [string], instance: null}, Midisport: {names: [string,string], instance: null}}}
   */
  static get devices() {
    return ExternalDevices.devices;
  }

  /***
   *
   */
  static listOutputPorts() {
    let output = new midi.output();
    let portCount = output.getPortCount();
    for (let i = 0; i < portCount; i++) {
      let portName = output.getPortName(i);
      Log.info(portName);
    }
  }

  /***
   *
   */
  static listInputPorts() {
    let input = new midi.input();
    let portCount = input.getPortCount();
    for (let i = 0; i < portCount; i++) {
      let portName = input.getPortName(i);
      Log.info(portName);
    }
  }

  /***
   *
   * @param deviceOptions
   * @returns {MidiDevice}
   */
  static getInstance(deviceOptions) {
    for (let deviceKey of Object.keys(ExternalDevices.devices)) {
      let device = ExternalDevices.devices[deviceKey];
      if (device.names[0] === deviceOptions.names[0]) {
        let deviceInstance = MidiDevice._deviceInstances[deviceKey];
        if (!(deviceInstance instanceof MidiDevice)) {
          deviceInstance = new MidiDevice(deviceOptions);
          deviceInstance.open();
          MidiDevice._deviceInstances[deviceKey] = deviceInstance;
        }
        return deviceInstance;
      }
    }
  }

  /***
   *
   * @returns {*}
   */
  get options() {
    return this._options;
  }

  /***
   *
   * @returns {*}
   */
  get input() {
    return this._inputPort;
  }

  /***
   *
   * @returns {boolean|*}
   */
  get inputStatus() {
    return this._inputPortStatus;
  }

  /***
   *
   * @returns {*}
   */
  get output() {
    return this._outputPort;
  }

  /**
   *
   * @returns {boolean|*}
   */
  get outputStatus() {
    return this._outputPortStatus;
  }

  /***
   *
   * @param options
   */
  constructor(options) {
    this._options = options;
  }

  /***
   *
   */
  open() {
    this.openInput();
    this.openOutput();
  }

  /***
   *
   */
  openInput() {
    let input = new midi.input();
    let foundPort = false;
    let port;
    let portCount = input.getPortCount();
    for (let i = 0; i < portCount; i++) {
      let portName = input.getPortName(i);
      if (this.options.names.indexOf(portName) >= 0) {
        port = input.openPort(i);
        foundPort = true;
        Log.success(`${portName}: Input port open`);
      }
    }

    if (!foundPort) {
      Log.error(
        `No Input MIDI Output devices found matching ${this.options.names}`
      );
    }
    this._inputPortStatus = foundPort;
    this._inputPort = input;
  }

  /***
   *
   */
  openOutput() {
    let output = new midi.output();
    let port;
    let portCount = output.getPortCount();
    let foundPort = false;
    for (let i = 0; i < portCount; i++) {
      let portName = output.getPortName(i);
      if (this.options.names.indexOf(portName) >= 0) {
        port = output.openPort(i);
        foundPort = true;
        Log.success(`${portName}: Output port open`);
      }
    }
    if (!foundPort) {
      Log.error(`No MIDI Output devices found matching ${this.options.names}`);
    }
    this._outputPortStatus = foundPort;
    this._outputPort = output;
  }

  /***
   *
   * @param channel
   * @param note
   * @param velocity
   * @param duration
   */
  play(channel, note, velocity, duration) {
    let noteOnStatus = 144 + channel - 1;
    let noteOffStatus = 128 + channel - 1;

    if (this.outputStatus) {
      try {
        this.output.sendMessage([noteOnStatus, note, velocity]);
      } catch (ex) {
        Log.error(
          `Failed to send MIDI message [${noteOnStatus},${note},${velocity}]: ${ex}`
        );
      }
      setTimeout(() => {
        try {
          this.output.sendMessage([noteOffStatus, note, velocity]);
        } catch (ex) {
          Log.error(
            `Failed to send MIDI message [${noteOnStatus},${note},${velocity}]: ${ex}`
          );
        }
      }, duration);
    }
  }

  noteOn(channel, note, velocity) {
    let noteOnStatus = 144 + channel - 1;
    if (this.outputStatus) {
      try {
        this.output.sendMessage([noteOnStatus, note, velocity]);
      } catch (ex) {
        Log.error(
          `Failed to send MIDI message [${noteOnStatus},${note},${velocity}]: ${ex}`
        );
      }
    }
  }

  noteOff(channel, note, velocity) {
    let noteOffStatus = 128 + channel - 1;
    if (this.outputStatus) {
      try {
        this.output.sendMessage([noteOffStatus, note, velocity]);
      } catch (ex) {
        Log.error(
          `Failed to send MIDI message [${noteOnStatus},${note},${velocity}]: ${ex}`
        );
      }
    }
  }

  allNotesOff(channel) {
    let status = 176 + channel - 1;
    if (this.outputStatus) {
      try {
        this.output.sendMessage([status, 123, 0]);
      } catch (ex) {
        Log.error(
          `Failed to send MIDI message [${noteOnStatus},${note},${velocity}]: ${ex}`
        );
      }
    }
  }
}

MidiDevice._deviceInstances = [];

module.exports = MidiDevice;
