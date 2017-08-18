const MidiController = require("../midi/midi-controller");
const MidiDevice = require("../midi/midi-device");
const EuropiMinion = require("../europi/europi-minion");
const Log = require("../display/log-util");
const colors = require("colors");

const Arrangements = require("./arrangements");

class ArrangementManager {

    get controllerMap() {
        return this.activeArrangement.controllerMap;
    }

    constructor() {

        this.initialize();

        /***
         * Live scripting console
         */
        process.on('message', (message) => {
            //this.activeArrangement.onLiveScriptInput(message.script);
            let script = message.script;
            if (script && script[0] === '/') {
                script = `this.activeArrangement.${script.substring(1, script.length)}`;
            }
            try {
                let result = eval(script);
                Log.success(message.script);
                if (result) {
                    Log.info(result);
                }
            } catch(error) {
                Log.error(error);
            }
        });

    }

    initialize() {

        this.minion = new EuropiMinion();

        this.controller = new MidiController({
            device: MidiDevice.devices.BeatStepPro,
            channel: 7,
            receiveMessage: (status, d1, d2) => {
                this.controllerMessage(status, d1, d2);
            },
            postClock: () => {
                this.activeArrangement.postClock();
            },
            start: () => {
                this.activeArrangement.start();
            },
            stop: () => {
                this.activeArrangement.stop();
            }
        });


        let context = {
            minion: this.minion
        };

        this.arrangements = [
            new Arrangements.Arrangement01(Object.assign({ index: 1}, context)),
            new Arrangements.Arrangement02(Object.assign({ index: 2}, context)),
            new Arrangements.Arrangement03(Object.assign({ index: 3}, context)),
            new Arrangements.Arrangement04(Object.assign({ index: 4}, context)),
            new Arrangements.Arrangement05(Object.assign({ index: 5}, context)),
            new Arrangements.Arrangement06(Object.assign({ index: 6}, context)),
            new Arrangements.Arrangement07(Object.assign({ index: 7}, context)),
            new Arrangements.Arrangement08(Object.assign({ index: 8}, context)),
            new Arrangements.Arrangement09(Object.assign({ index: 9}, context)),
            new Arrangements.Arrangement10(Object.assign({ index: 10}, context)),
            new Arrangements.Arrangement11(Object.assign({ index: 11}, context)),
            new Arrangements.Arrangement12(Object.assign({ index: 12}, context)),
            new Arrangements.Arrangement13(Object.assign({ index: 13}, context)),
            new Arrangements.Arrangement14(Object.assign({ index: 14}, context)),
            new Arrangements.Arrangement15(Object.assign({ index: 15}, context)),
            new Arrangements.Arrangement16(Object.assign({ index: 16}, context))
        ];
        this.selectArrangement(0);

    }

    selectArrangement(index) {
        if (this.activeArrangement) {
            this.activeArrangement.unregisterController(this.controller);
        }
        this.activeArrangement = this.arrangements[index];
        this.activeArrangement.registerController(this.controller);
        this.activeArrangement.updateTitle();
        Log.music(`${colors.blue(`Playing arrangement ${index}:`)} ${this.activeArrangement.title}`);

        process.send({
            type: "controllerMap",
            map: this.activeArrangement.controllerMap
        });

    }

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

    onClickStageButton(index, data) {
        if (data === 127) {
            this.selectArrangement(index);
        }
    }

    controllerMessage(status, d1, d2) {

        if (!this.activeArrangement) {
            return;
        }

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

                }
                break;

        }

    }

}
module.exports = ArrangementManager;