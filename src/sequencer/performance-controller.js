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
     */
    constructor() {

        this.initialize();

        /***
         * Live scripting console
         */
        process.on('message', (message) => {

            if (message.type === "command") {

                let performance = this.performance;
                let track = this.performance.tracks[Store.instance.performance.selectedTrack];
                let setProp = Store.instance.setSelectedTrackProperty.bind(Store.instance);
                let save = Store.instance.saveState.bind(Store.instance);

                //this.activeArrangement.onLiveScriptInput(message.script);
                let script = message.script;
                if (script && script[0] === '/') {
                    script = `${script.substring(1, script.length)}`;
                }
                try {
                    let result = eval(script);
                    Log.success(message.script);
                    Log.info(result);
                } catch (error) {
                    Log.error(error);
                }
            } else if (message.type === "functionKey") {
                this.performance.select(message.index);
                Log.info(`Selected performance ${message.index+1}`);
            }
        });

    }

    /***
     *
     */
    initialize() {

        this.minion = new EuropiMinion();

        this.controller = new MidiController({
            // device: MidiDevice.devices.BeatStepPro,
            device: MidiDevice.devices.Midisport,
            channel: 7,
            receiveMessage: (status, d1, d2) => {
                this.controllerMessage(status, d1, d2);
            },
            clock: () => {
                this.updateClock();
                this.performance.clock(this.bpm);
            },
            postClock: () => {
                this.performance.postClock();
            },
            start: () => {
                this.performance.start();
            },
            stop: () => {
                this.performance.stop();
            }
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
        this.tickDurations = this.tickDurations.splice(Math.max(0, this.tickDurations.length-historyLength), historyLength);
        let tickMillis = this.tickDurations.reduce((sum, value) => sum + value) / this.tickDurations.length;
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
        let value = d2;
        if (ctrl && ctrl.callback) {
            value = ctrl.callback(d2);
        } else {
            value = " ";
        }

        process.send({
            type: "controller",
            status: status,
            d1: d1,
            d2: value ? "" + value : d2
        });
    }

    /***
     *
     * @param index
     * @param data
     */
    onClickStageButton(index, data) {
        if (data === 127) {
            this.performance.selectScene(index);
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
                    case MidiController.BeatStepMap.Pad1: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad1,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad2: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad2,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad3: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad3,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad4: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad4,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad5: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad5,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad6: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad6,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad7: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad7,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad8: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad8,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad9: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad9,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad10: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad10,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad11: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad11,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad12: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad12,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad13: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad13,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad14: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad14,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad15: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad15,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad16: this.invokeControllerMapCallback(this.controllerMap.noteOn.Pad16,status, d1, d2); break;
                }
                break;
            case 128: // Note off
                switch (d1) {
                    case MidiController.BeatStepMap.Pad1: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad1,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad2: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad2,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad3: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad3,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad4: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad4,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad5: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad5,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad6: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad6,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad7: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad7,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad8: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad8,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad9: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad9,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad10: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad10,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad11: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad11,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad12: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad12,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad13: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad13,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad14: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad14,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad15: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad15,status, d1, d2); break;
                    case MidiController.BeatStepMap.Pad16: this.invokeControllerMapCallback(this.controllerMap.noteOff.Pad16,status, d1, d2); break;
                }
                break;
            case 176: // Control Change
                switch (d1) {
                    case MidiController.BeatStepMap.Knob1: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob1,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob2: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob2,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob3: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob3,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob4: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob4,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob5: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob5,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob6: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob6,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob7: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob7,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob8: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob8,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob9: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob9,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob10: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob10,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob11: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob11,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob12: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob12,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob13: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob13,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob14: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob14,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob15: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob15,status, d1, d2); break;
                    case MidiController.BeatStepMap.Knob16: this.invokeControllerMapCallback(this.controllerMap.controlChange.Knob16,status, d1, d2); break;

                    case MidiController.BeatStepMap.Stage1: this.onClickStageButton(0,d2); break;
                    case MidiController.BeatStepMap.Stage2: this.onClickStageButton(1,d2); break;
                    case MidiController.BeatStepMap.Stage3: this.onClickStageButton(2,d2); break;
                    case MidiController.BeatStepMap.Stage4: this.onClickStageButton(3,d2); break;
                    case MidiController.BeatStepMap.Stage5: this.onClickStageButton(4,d2); break;
                    case MidiController.BeatStepMap.Stage6: this.onClickStageButton(5,d2); break;
                    case MidiController.BeatStepMap.Stage7: this.onClickStageButton(6,d2); break;
                    case MidiController.BeatStepMap.Stage8: this.onClickStageButton(7,d2); break;
                    case MidiController.BeatStepMap.Stage9: this.onClickStageButton(8,d2); break;
                    case MidiController.BeatStepMap.Stage10: this.onClickStageButton(9,d2); break;
                    case MidiController.BeatStepMap.Stage11: this.onClickStageButton(10,d2); break;
                    case MidiController.BeatStepMap.Stage12: this.onClickStageButton(11,d2); break;
                    case MidiController.BeatStepMap.Stage13: this.onClickStageButton(12,d2); break;
                    case MidiController.BeatStepMap.Stage14: this.onClickStageButton(13,d2); break;
                    case MidiController.BeatStepMap.Stage15: this.onClickStageButton(14,d2); break;
                    case MidiController.BeatStepMap.Stage16: this.onClickStageButton(15,d2); break;
                    default:
                        Log.info(`unhandled cc=${d1} val=${d2}`);
                        break;
                }
                break;

        }

    }

}
module.exports = PerformanceController;