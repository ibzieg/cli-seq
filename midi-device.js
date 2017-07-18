const midi = require("midi");
const colors = require("colors");
const Log = require("./log-util");

class MidiDevice {

    static get devices() {
        return devices;
    }

    static getInstance(deviceOptions) {

        for (let deviceKey of Object.keys(devices)) {
            let device = devices[deviceKey];
            if (device.names[0] === deviceOptions.names[0]) {
                if (!(device.instance instanceof MidiDevice)) {
                    device.instance = new MidiDevice(deviceOptions);
                    device.instance.open();
                }
                return device.instance;
            }
        }
    }

    get options() {
        return this._options;
    }

    get input() {
        return this._inputPort;
    }

    get output() {
        return this._outputPort;
    }

    constructor(options) {
        this._options = options;
    }

    open() {
        this.openInput();
        this.openOutput();
    }

    openInput() {
        let input = new midi.input();
        let port;
        let portCount = input.getPortCount();
        for (let i = 0; i < portCount; i++) {
            let portName = input.getPortName(i);
            if (this.options.names.indexOf(portName) >= 0) {
                port = input.openPort(i);
                Log.success(`${portName}: Input port open`);
            }
        }

        this._inputPort = input;
    }

    openOutput() {
        let output = new midi.output();
        let port;
        let portCount = output.getPortCount();
        for (let i = 0; i < portCount; i++) {
            let portName = output.getPortName(i);
            if (this.options.names.indexOf(portName) >= 0) {
                port = output.openPort(i);
                Log.success(`${portName}: Output port open`);
            }
        }
        this._outputPort = output;
    }

}
module.exports = MidiDevice;


let devices = {
    BeatStepPro: {
        names: ['Arturia BeatStep Pro Arturia BeatStepPro', 'Arturia BeatStep Pro 20:0'],
        instance: null
    },
    Minilogue: {
        names: ['minilogue SOUND'],
        instance: null
    },
    MOTU828x: {
        names: ['828x MIDI Port'],
        instance: null
    }
};