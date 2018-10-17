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

const MidiController = require("../midi/midi-controller");
const MidiDevice = require("../midi/midi-device");
const EuropiMinion = require("../europi/europi-minion");
const Log = require("../display/log-util");
const colors = require("colors");

const Performance = require("./performance");

const MasterClock = require("./master-clock");

const Store = require("./store");

class PerformanceController {
  /***
   *
   * @returns {{noteOn, noteOff, controlChange}|*}
   */
  get controllerMap() {
    if (!this._controllerMap) {
      this._controllerMap = this.performance.createControllerMap();
    }
    return this._controllerMap;
  }

  /***
   *
   * @param key
   * @param value
   */
  trackProp(key, value) {
    Store.instance.setSelectedTrackProperty(key, value);
    this.performance.updateTrackState();
  }

  /***
   *
   * @param key
   * @param value
   */
  sceneProp(key, value) {
    Store.instance.setSceneProperty(key, value);

    switch (key) {
      case "modA":
        this.performance.cvEvent("cv", value, "a");
        break;
      case "modB":
        this.performance.cvEvent("cv", value, "b");
        break;
      case "modC":
        this.performance.cvEvent("cv", value, "c");
        break;
      case "modD":
        this.performance.cvEvent("cv", value, "d");
        break;
    }

    this.performance.updateSceneState();
  }

  /***
   * Track Property accessors
   * @returns {*}
   */
  get instrument() {
    return Store.instance.scene.tracks[Store.instance.performance.selectedTrack]
      .instrument;
  }

  set instrument(value) {
    this.trackProp("instrument", value);
  }

  get note() {
    return Store.instance.scene.tracks[Store.instance.performance.selectedTrack]
      .note;
  }

  set note(value) {
    this.trackProp("note", value);
  }

  get velocity() {
    return Store.instance.scene.tracks[Store.instance.performance.selectedTrack]
      .velocity;
  }

  set velocity(value) {
    this.trackProp("velocity", value);
  }

  get constants() {
    return Store.instance.scene.tracks[Store.instance.performance.selectedTrack]
      .constants;
  }

  set constants(value) {
    this.trackProp("constants", value);
  }

  get linearGraph() {
    return Store.instance.scene.tracks[Store.instance.performance.selectedTrack]
      .graphData.linear;
  }

  set linearGraph(data) {
    let graphData = Object.assign(
      {},
      graphData,
      Store.instance.scene.tracks[Store.instance.performance.selectedTrack]
        .graphData
    );
    graphData.linear = data;
    this.trackProp("graphData", graphData);
  }

  /***
   * Scene Property accessors
   * @returns {*|number}
   */
  get modA() {
    return Store.instance.scene.options.modA;
  }

  set modA(value) {
    this.sceneProp("modA", value);
  }

  get modB() {
    return Store.instance.scene.options.modB;
  }

  set modB(value) {
    this.sceneProp("modB", value);
  }

  get modC() {
    return Store.instance.scene.options.modC;
  }

  set modC(value) {
    this.sceneProp("modC", value);
  }

  get modD() {
    return Store.instance.scene.options.modD;
  }

  set modD(value) {
    this.sceneProp("modD", value);
  }

  get cvA() {
    return Store.instance.scene.options.cvA;
  }

  set cvA(value) {
    this.sceneProp("cvA", value);
  }

  get cvB() {
    return Store.instance.scene.options.cvB;
  }

  set cvB(value) {
    this.sceneProp("cvB", value);
  }

  get cvC() {
    return Store.instance.scene.options.cvC;
  }

  set cvC(value) {
    this.sceneProp("cvC", value);
  }

  get cvD() {
    return Store.instance.scene.options.cvD;
  }

  set cvD(value) {
    this.sceneProp("cvD", value);
  }

  get gateA() {
    return Store.instance.scene.options.gateA;
  }

  set gateA(value) {
    this.sceneProp("gateA", value);
  }

  get gateB() {
    return Store.instance.scene.options.gateB;
  }

  set gateB(value) {
    this.sceneProp("gateB", value);
  }

  get gateC() {
    return Store.instance.scene.options.gateC;
  }

  set gateC(value) {
    this.sceneProp("gateC", value);
  }

  get gateD() {
    return Store.instance.scene.options.gateD;
  }

  set gateD(value) {
    this.sceneProp("gateD", value);
  }

  /***
   *
   */
  constructor() {
    this.initialize();

    process.on("message", message => {
      if (message.type === "command") {
        this.processCommand(message.script);
      } else if (message.type === "functionKey") {
        this.performance.select(message.index);
        Log.info(`Selected performance ${message.index + 1}`);
      }
    });
  }

  /***
   *
   */
  initialize() {
    this.minion = new EuropiMinion();

    this.isPlaying = false;
    this.controller = new MidiController({
      device: MidiDevice.devices.Midisport,
      channel: 7,
      receiveMessage: (status, d1, d2) => {
        this.controllerMessage(status, d1, d2);
      },
      clock: this.clock.bind(this),
      start: this.start.bind(this),
      stop: this.stop.bind(this)
    });

    this.masterClock = new MasterClock({
      clock: this.clock.bind(this)
    });

    let context = {
      minion: this.minion,
      controller: this.controller
    };

    this.performance = new Performance({
      context: context
    });

    process.send({
      type: "controllerMap",
      map: this.controllerMap
    });

    this.performance.select(Store.instance.state.selectedPerformance);

    this.tickDurations = [];
    this.lastTick = process.hrtime();
  }

  clock() {
    this.isPlaying = true;
    this.controller.outputTransportClock();
    this.updateClock();
    this.performance.clock(this.bpm);
    this.performance.postClock();
  }

  start() {
    this.isPlaying = true;
    this.controller.outputTransportRun();
    this.performance.start();
  }

  stop() {
    this.isPlaying = false;
    this.controller.outputTransportStop();
    this.performance.stop();
  }

  /***
   *
   * @param script
   */
  processCommand(script) {
    // local scope aliases for command line script:
    let performance = this.performance;
    let track = this.performance.tracks[
      Store.instance.performance.selectedTrack
    ];
    let trackProp = this.trackProp.bind(this);
    let sceneProp = this.sceneProp.bind(this);
    let save = Store.instance.saveState.bind(Store.instance);
    let clear = Store.instance.clearActiveTrack.bind(Store.instance);
    let copyTo = i => {
      Store.instance.copySceneToPerformance(i - 1);
      return `Copied active scene into new Performance ${i}`;
    };
    let start = () => {
      this.masterClock.start();
      return "Start master clock";
    };

    let stop = () => {
      this.masterClock.stop();
      return "Stop master clock";
    };

    if (script && script[0] === ".") {
      script = "this" + script;
    }
    try {
      let result = eval(script);
      Log.success(script);
      Log.info(result);
    } catch (error) {
      Log.error(error);
    }
  }

  /***
   * Track the internal clock ticks and store as bpm
   */
  updateClock() {
    let hrtime = process.hrtime(this.lastTick);
    this.lastTick = process.hrtime();
    let duration = hrtime[0] * 1000 + hrtime[1] / 1000000;

    const historyLength = 48; // TODO Move constant
    const ppq = 24; // TODO Move constant
    this.tickDurations.push(duration);
    this.tickDurations = this.tickDurations.splice(
      Math.max(0, this.tickDurations.length - historyLength),
      historyLength
    );
    let tickMillis =
      this.tickDurations.reduce((sum, value) => sum + value) /
      this.tickDurations.length;
    let beatMillis = tickMillis * ppq;
    const millisPerMin = 60000;
    let bpm = Math.round(millisPerMin / beatMillis);

    this.bpm = bpm;
  }

  /***
   *
   * @param ctrl
   * @param status
   * @param d1
   * @param d2
   */
  invokeControllerMapCallback(ctrl, status, d1, d2) {
    if (ctrl && ctrl.callback) {
      ctrl.callback(d2);
    }
  }

  /***
   *
   * @param index
   * @param data
   */
  onClickStageButton(index, data) {
    if (data === 127) {
      if (!this.isPlaying) {
        this.performance.selectScene(index);
      } else {
        this.performance.queueScene(index);
      }
    }
  }

  /***
   *
   * @param status
   * @param d1
   * @param d2
   */
  controllerMessage(status, d1, d2) {
    switch (status) {
      case 144: // Note on
        switch (d1) {
          case MidiController.BeatStepMap.Pad1:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad1,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad2:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad2,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad3:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad3,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad4:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad4,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad5:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad5,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad6:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad6,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad7:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad7,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad8:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad8,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad9:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad9,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad10:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad10,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad11:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad11,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad12:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad12,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad13:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad13,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad14:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad14,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad15:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad15,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad16:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOn.Pad16,
              status,
              d1,
              d2
            );
            break;
        }
        break;
      case 128: // Note off
        switch (d1) {
          case MidiController.BeatStepMap.Pad1:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad1,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad2:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad2,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad3:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad3,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad4:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad4,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad5:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad5,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad6:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad6,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad7:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad7,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad8:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad8,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad9:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad9,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad10:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad10,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad11:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad11,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad12:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad12,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad13:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad13,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad14:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad14,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad15:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad15,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Pad16:
            this.invokeControllerMapCallback(
              this.controllerMap.noteOff.Pad16,
              status,
              d1,
              d2
            );
            break;
        }
        break;
      case 176: // Control Change
        switch (d1) {
          case MidiController.BeatStepMap.Knob1:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob1,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob2:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob2,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob3:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob3,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob4:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob4,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob5:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob5,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob6:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob6,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob7:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob7,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob8:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob8,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob9:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob9,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob10:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob10,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob11:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob11,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob12:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob12,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob13:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob13,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob14:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob14,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob15:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob15,
              status,
              d1,
              d2
            );
            break;
          case MidiController.BeatStepMap.Knob16:
            this.invokeControllerMapCallback(
              this.controllerMap.controlChange.Knob16,
              status,
              d1,
              d2
            );
            break;

          case MidiController.BeatStepMap.Stage1:
            this.onClickStageButton(0, d2);
            break;
          case MidiController.BeatStepMap.Stage2:
            this.onClickStageButton(1, d2);
            break;
          case MidiController.BeatStepMap.Stage3:
            this.onClickStageButton(2, d2);
            break;
          case MidiController.BeatStepMap.Stage4:
            this.onClickStageButton(3, d2);
            break;
          case MidiController.BeatStepMap.Stage5:
            this.onClickStageButton(4, d2);
            break;
          case MidiController.BeatStepMap.Stage6:
            this.onClickStageButton(5, d2);
            break;
          case MidiController.BeatStepMap.Stage7:
            this.onClickStageButton(6, d2);
            break;
          case MidiController.BeatStepMap.Stage8:
            this.onClickStageButton(7, d2);
            break;
          case MidiController.BeatStepMap.Stage9:
            this.onClickStageButton(8, d2);
            break;
          case MidiController.BeatStepMap.Stage10:
            this.onClickStageButton(9, d2);
            break;
          case MidiController.BeatStepMap.Stage11:
            this.onClickStageButton(10, d2);
            break;
          case MidiController.BeatStepMap.Stage12:
            this.onClickStageButton(11, d2);
            break;
          case MidiController.BeatStepMap.Stage13:
            this.onClickStageButton(12, d2);
            break;
          case MidiController.BeatStepMap.Stage14:
            this.onClickStageButton(13, d2);
            break;
          case MidiController.BeatStepMap.Stage15:
            this.onClickStageButton(14, d2);
            break;
          case MidiController.BeatStepMap.Stage16:
            this.onClickStageButton(15, d2);
            break;
          default:
            Log.info(`unhandled cc=${d1} val=${d2}`);
            break;
        }
        break;
    }
  }
}

module.exports = PerformanceController;
