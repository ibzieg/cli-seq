const colors = require("colors");
const NanoTimer = require("nanotimer");

const MidiDevice = require("./midi-device");


class MidiController {

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
            console.log(`${colors.green("Message:")} Channel: ${colors.blue(channel)} ${status} ${d1} ${d2}`);
        } else {
            switch (status) {
                case 248: // Timing
                    this.clock();
                    break;
                case 250: // Start
                    this.start();
                    console.log(`${colors.yellow("System:")} Start ${status}`);
                    break;
                case 252:
                    this.stop();
                    console.log(`${colors.yellow("System:")} Stop ${status}`);
                    break; // Stop
                default:
                    console.log(`${colors.yellow("System:")} ${status}`);
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
module.exports = MidiController;