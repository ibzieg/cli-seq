const colors = require("colors");
const NanoTimer = require("nanotimer");

const Log = require("./log-util");
const MidiDevice = require("./midi-device");


class MidiController {

/*    static get BeatStepMap() {
        return BeatStepControllerMap;
    }*/

    constructor(options) {
        this._sequencerMap = new Map();

        this._options = options;

        let device = options.device;
        if (device) {
            this.initializeDevice(device);
        } else {
            this.initializeInternalClock();
        }
    }

    initializeDevice(device) {
        this._midiDevice = MidiDevice.getInstance(device);
        this._midiDevice.input.ignoreTypes(true, false, true);
        this._midiDevice.input.on("message", this.receiveMessage.bind(this));
    }

    initializeInternalClock() {
        this._isPlaying = true;

        let tempo = this._options.tempo;
        if (!tempo || tempo < 1) {
            tempo = 120;
        }
        function tempoInterval() {
            return (60000.0) / (tempo * 24.0);
        }

        this._masterClock = new NanoTimer();
        this._masterClock.setInterval(() => {
            if (this._isPlaying) {
                this.receiveMessage(null/*hrtime?*/, [248]);
            }
        }, '', `${tempoInterval()}m`);

    }

    register(sequencer) {
        this._sequencerMap.set(sequencer, null);
    }

    unregister(sequencer) {
        this._sequencerMap.delete(sequencer);
    }

    receiveMessage(deltaTime, message) {
        let status = message[0];
        let d1 = message[1];
        let d2 = message[2];
        if (status >= 128 && status <= 239) {
            let channel = status & 0b00001111;
            status = status & 0b011110000;
            if (channel === this._options.channel-1) {
                //Log.info(`Controller: ch=${colors.blue(channel)} st=${status} d1=${d1} d2=${d2}`);
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
                        Log.info(`Controller Message: ${colors.red(d1)},  ${colors.red(d2)}`);
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


    clock() {
        for (let sequencer of this._sequencerMap.keys()) {
            sequencer.clock();
        }
        for (let sequencer of this._sequencerMap.keys()) {
            sequencer.postClock();
        }
        if (this._options.postClock) {
            this._options.postClock();
        }
    }

    start() {
        for (let sequencer of this._sequencerMap.keys()) {
            sequencer.start();
        }
    }

    stop() {
        for (let sequencer of this._sequencerMap.keys()) {
            sequencer.stop();
        }
        if (this._options.stop) {
            this._options.stop();
        }
    }

    reset() {
        for (let sequencer of this._sequencerMap.keys()) {
            sequencer.reset();
        }
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
    Stage16: 55,
};
MidiController.BeatStepMap = BeatStepControllerMap;
module.exports = MidiController;