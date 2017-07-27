let MidiDevice = require("./midi-device");

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

    constructor(options) {
        this._options = options;
        this._midiDevice = MidiDevice.getInstance(options.device);
    }

    play(note, velocity, duration) {
        let noteOnStatus = 144 + this.channel-1;
        let noteOffStatus = 128 + this.channel-1;

        this._midiDevice.output.sendMessage([noteOnStatus, note, velocity]);
        setTimeout(() => {
            this._midiDevice.output.sendMessage([noteOffStatus, note, velocity]);
        }, duration);
    }

}
module.exports = MidiInstrument;

const drumMap = [
    36,
    38,
    39,
    42,
    46,
    49,
    75,
    67
];

const instruments = {
    BSPSeq1: {
        device: MidiDevice.devices.BeatStepPro,
        channel: 1
    },
    BSPSeq2: {
        device: MidiDevice.devices.BeatStepPro,
        channel: 2
    },
    BSPDrum: {
        device: MidiDevice.devices.BeatStepPro,
        channel: 14
    },
    Minilogue: {
        device: MidiDevice.devices.Minilogue,
        channel: 1
    },
    Juno106: {
        device: MidiDevice.devices.MOTU828x,
        channel: 13
    },
    NordG2A: {
        device: MidiDevice.devices.MOTU828x,
        channel: 7
    }
};
