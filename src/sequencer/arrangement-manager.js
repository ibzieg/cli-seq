const MidiController = require("../midi/midi-controller");
const MidiDevice = require("../midi/midi-device");
const Log = require("../display/log-util");

const Arrangements = require("./arrangements");

class ArrangementManager {

    constructor() {

        /***
         * Live scripting console
         */
        process.on('message', (message) => {
            try {
                let result = eval(message.script);
                Log.success(message.script);
                if (result) {
                    Log.info(result);
                }
            } catch(error) {
                Log.error(error);
            }
        });

        this.controller = new MidiController({
            device: MidiDevice.devices.BeatStepPro,
            channel: 7,
            receiveMessage: (status, d1, d2) => {
                process.send({
                    type: "controller",
                    status: status,
                    d1: d1,
                    d2: d2
                });
                this.controllerMessage(status, d1, d2);
            },
            postClock: () => {
            },
            stop: () => {
            }
        });

        this.arrangement = new Arrangements.Arrangement01();
        this.arrangement.registerController(this.controller);
        this.controllerMap = this.arrangement.createControllerMap();

    }

    controllerMessage(status, d1, d2) {
        switch (status) {
            case 144: // Note on
                switch (d1) {
                    case MidiController.BeatStepMap.Pad1: if (this.controllerMap.noteOn.Pad1 && this.controllerMap.noteOn.Pad1.callback) this.controllerMap.noteOn.Pad1.callback(d1); break;
                    case MidiController.BeatStepMap.Pad2: if (this.controllerMap.noteOn.Pad2 && this.controllerMap.noteOn.Pad2.callback) this.controllerMap.noteOn.Pad2.callback(d1); break;
                    case MidiController.BeatStepMap.Pad3: if (this.controllerMap.noteOn.Pad3 && this.controllerMap.noteOn.Pad3.callback) this.controllerMap.noteOn.Pad3.callback(d1); break;
                    case MidiController.BeatStepMap.Pad4: if (this.controllerMap.noteOn.Pad4 && this.controllerMap.noteOn.Pad4.callback) this.controllerMap.noteOn.Pad4.callback(d1); break;
                    case MidiController.BeatStepMap.Pad5: if (this.controllerMap.noteOn.Pad5 && this.controllerMap.noteOn.Pad5.callback) this.controllerMap.noteOn.Pad5.callback(d1); break;
                    case MidiController.BeatStepMap.Pad6: if (this.controllerMap.noteOn.Pad6 && this.controllerMap.noteOn.Pad6.callback) this.controllerMap.noteOn.Pad6.callback(d1); break;
                    case MidiController.BeatStepMap.Pad7: if (this.controllerMap.noteOn.Pad7 && this.controllerMap.noteOn.Pad7.callback) this.controllerMap.noteOn.Pad7.callback(d1); break;
                    case MidiController.BeatStepMap.Pad8: if (this.controllerMap.noteOn.Pad8 && this.controllerMap.noteOn.Pad8.callback) this.controllerMap.noteOn.Pad8.callback(d1); break;
                    case MidiController.BeatStepMap.Pad9: if (this.controllerMap.noteOn.Pad9 && this.controllerMap.noteOn.Pad9.callback) this.controllerMap.noteOn.Pad9.callback(d1); break;
                    case MidiController.BeatStepMap.Pad10: if (this.controllerMap.noteOn.Pad10 && this.controllerMap.noteOn.Pad10.callback) this.controllerMap.noteOn.Pad10.callback(d1); break;
                    case MidiController.BeatStepMap.Pad11: if (this.controllerMap.noteOn.Pad11 && this.controllerMap.noteOn.Pad11.callback) this.controllerMap.noteOn.Pad11.callback(d1); break;
                    case MidiController.BeatStepMap.Pad12: if (this.controllerMap.noteOn.Pad12 && this.controllerMap.noteOn.Pad12.callback) this.controllerMap.noteOn.Pad12.callback(d1); break;
                    case MidiController.BeatStepMap.Pad13: if (this.controllerMap.noteOn.Pad13 && this.controllerMap.noteOn.Pad13.callback) this.controllerMap.noteOn.Pad13.callback(d1); break;
                    case MidiController.BeatStepMap.Pad14: if (this.controllerMap.noteOn.Pad14 && this.controllerMap.noteOn.Pad14.callback) this.controllerMap.noteOn.Pad14.callback(d1); break;
                    case MidiController.BeatStepMap.Pad15: if (this.controllerMap.noteOn.Pad15 && this.controllerMap.noteOn.Pad15.callback) this.controllerMap.noteOn.Pad15.callback(d1); break;
                    case MidiController.BeatStepMap.Pad16: if (this.controllerMap.noteOn.Pad16 && this.controllerMap.noteOn.Pad16.callback) this.controllerMap.noteOn.Pad16.callback(d1); break;
                }
                break;
            case 128: // Note off
                switch (d1) {
                    case MidiController.BeatStepMap.Pad1: if (this.controllerMap.noteOff.Pad1 && this.controllerMap.noteOff.Pad1.callback) this.controllerMap.noteOff.Pad1.callback(d1); break;
                    case MidiController.BeatStepMap.Pad2: if (this.controllerMap.noteOff.Pad2 && this.controllerMap.noteOff.Pad2.callback) this.controllerMap.noteOff.Pad2.callback(d1); break;
                    case MidiController.BeatStepMap.Pad3: if (this.controllerMap.noteOff.Pad3 && this.controllerMap.noteOff.Pad3.callback) this.controllerMap.noteOff.Pad3.callback(d1); break;
                    case MidiController.BeatStepMap.Pad4: if (this.controllerMap.noteOff.Pad4 && this.controllerMap.noteOff.Pad4.callback) this.controllerMap.noteOff.Pad4.callback(d1); break;
                    case MidiController.BeatStepMap.Pad5: if (this.controllerMap.noteOff.Pad5 && this.controllerMap.noteOff.Pad5.callback) this.controllerMap.noteOff.Pad5.callback(d1); break;
                    case MidiController.BeatStepMap.Pad6: if (this.controllerMap.noteOff.Pad6 && this.controllerMap.noteOff.Pad6.callback) this.controllerMap.noteOff.Pad6.callback(d1); break;
                    case MidiController.BeatStepMap.Pad7: if (this.controllerMap.noteOff.Pad7 && this.controllerMap.noteOff.Pad7.callback) this.controllerMap.noteOff.Pad7.callback(d1); break;
                    case MidiController.BeatStepMap.Pad8: if (this.controllerMap.noteOff.Pad8 && this.controllerMap.noteOff.Pad8.callback) this.controllerMap.noteOff.Pad8.callback(d1); break;
                    case MidiController.BeatStepMap.Pad9: if (this.controllerMap.noteOff.Pad9 && this.controllerMap.noteOff.Pad9.callback) this.controllerMap.noteOff.Pad9.callback(d1); break;
                    case MidiController.BeatStepMap.Pad10: if (this.controllerMap.noteOff.Pad10 && this.controllerMap.noteOff.Pad10.callback) this.controllerMap.noteOff.Pad10.callback(d1); break;
                    case MidiController.BeatStepMap.Pad11: if (this.controllerMap.noteOff.Pad11 && this.controllerMap.noteOff.Pad11.callback) this.controllerMap.noteOff.Pad11.callback(d1); break;
                    case MidiController.BeatStepMap.Pad12: if (this.controllerMap.noteOff.Pad12 && this.controllerMap.noteOff.Pad12.callback) this.controllerMap.noteOff.Pad12.callback(d1); break;
                    case MidiController.BeatStepMap.Pad13: if (this.controllerMap.noteOff.Pad13 && this.controllerMap.noteOff.Pad13.callback) this.controllerMap.noteOff.Pad13.callback(d1); break;
                    case MidiController.BeatStepMap.Pad14: if (this.controllerMap.noteOff.Pad14 && this.controllerMap.noteOff.Pad14.callback) this.controllerMap.noteOff.Pad14.callback(d1); break;
                    case MidiController.BeatStepMap.Pad15: if (this.controllerMap.noteOff.Pad15 && this.controllerMap.noteOff.Pad15.callback) this.controllerMap.noteOff.Pad15.callback(d1); break;
                    case MidiController.BeatStepMap.Pad16: if (this.controllerMap.noteOff.Pad16 && this.controllerMap.noteOff.Pad16.callback) this.controllerMap.noteOff.Pad16.callback(d1); break;
                }
                break;
            case 176: // Control Change
                switch (d1) {
                    case MidiController.BeatStepMap.Knob1: if (this.controllerMap.controlChange.Knob1 && this.controllerMap.controlChange.Knob1.callback) this.controllerMap.controlChange.Knob1.callback(d1); break;
                    case MidiController.BeatStepMap.Knob2: if (this.controllerMap.controlChange.Knob2 && this.controllerMap.controlChange.Knob2.callback) this.controllerMap.controlChange.Knob2.callback(d1); break;
                    case MidiController.BeatStepMap.Knob3: if (this.controllerMap.controlChange.Knob3 && this.controllerMap.controlChange.Knob3.callback) this.controllerMap.controlChange.Knob3.callback(d1); break;
                    case MidiController.BeatStepMap.Knob4: if (this.controllerMap.controlChange.Knob4 && this.controllerMap.controlChange.Knob4.callback) this.controllerMap.controlChange.Knob4.callback(d1); break;
                    case MidiController.BeatStepMap.Knob5: if (this.controllerMap.controlChange.Knob5 && this.controllerMap.controlChange.Knob5.callback) this.controllerMap.controlChange.Knob5.callback(d1); break;
                    case MidiController.BeatStepMap.Knob6: if (this.controllerMap.controlChange.Knob6 && this.controllerMap.controlChange.Knob6.callback) this.controllerMap.controlChange.Knob6.callback(d1); break;
                    case MidiController.BeatStepMap.Knob7: if (this.controllerMap.controlChange.Knob7 && this.controllerMap.controlChange.Knob7.callback) this.controllerMap.controlChange.Knob7.callback(d1); break;
                    case MidiController.BeatStepMap.Knob8: if (this.controllerMap.controlChange.Knob8 && this.controllerMap.controlChange.Knob8.callback) this.controllerMap.controlChange.Knob8.callback(d1); break;
                    case MidiController.BeatStepMap.Knob9: if (this.controllerMap.controlChange.Knob9 && this.controllerMap.controlChange.Knob9.callback) this.controllerMap.controlChange.Knob9.callback(d1); break;
                    case MidiController.BeatStepMap.Knob10: if (this.controllerMap.controlChange.Knob10 && this.controllerMap.controlChange.Knob10.callback) this.controllerMap.controlChange.Knob10.callback(d1); break;
                    case MidiController.BeatStepMap.Knob11: if (this.controllerMap.controlChange.Knob11 && this.controllerMap.controlChange.Knob11.callback) this.controllerMap.controlChange.Knob11.callback(d1); break;
                    case MidiController.BeatStepMap.Knob12: if (this.controllerMap.controlChange.Knob12 && this.controllerMap.controlChange.Knob12.callback) this.controllerMap.controlChange.Knob12.callback(d1); break;
                    case MidiController.BeatStepMap.Knob13: if (this.controllerMap.controlChange.Knob13 && this.controllerMap.controlChange.Knob13.callback) this.controllerMap.controlChange.Knob13.callback(d1); break;
                    case MidiController.BeatStepMap.Knob14: if (this.controllerMap.controlChange.Knob14 && this.controllerMap.controlChange.Knob14.callback) this.controllerMap.controlChange.Knob14.callback(d1); break;
                    case MidiController.BeatStepMap.Knob15: if (this.controllerMap.controlChange.Knob15 && this.controllerMap.controlChange.Knob15.callback) this.controllerMap.controlChange.Knob15.callback(d1); break;
                    case MidiController.BeatStepMap.Knob16: if (this.controllerMap.controlChange.Knob16 && this.controllerMap.controlChange.Knob16.callback) this.controllerMap.controlChange.Knob16.callback(d1); break;
                }
                break;

        }

    }

}
module.exports = ArrangementManager;