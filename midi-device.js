const midi = require("midi");
const colors = require("colors");


class MidiDevice {

    static get devices() {
        return devices;
    }

    static getInstance(deviceOptions) {

        for (let deviceKey of Object.keys(devices)) {
            let device = devices[deviceKey];
            if (device.name === deviceOptions.name) {
                if (!(device.instance instanceof MidiDevice)) {
                    device.instance = new MidiDevice(deviceOptions);
                    device.instance.open();
                }
                return device.instance;
            }
        }
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
        this._inputPort = MidiDevice.openInput(this._options.name);
        this._outputPort = MidiDevice.openOutput(this._options.name);
    }

    static openInput(name) {
        let input = new midi.input();
        let port;
        let portCount = input.getPortCount();
        for (let i = 0; i < portCount; i++) {
            let portName = input.getPortName(i);
            if (portName === name) {
                port = input.openPort(i);
                console.log(`Input Open: \t${colors.green(portName)}`);
            }
        }

        /*
         input.ignoreTypes(false, false, false);
         input.on('message', function(deltaTime, message) {
         //console.log('m:' + message + ' d:' + deltaTime);
         });
         */


        return input;
    }

    static openOutput(name) {
        let output = new midi.output();
        let port;
        let portCount = output.getPortCount();
        for (let i = 0; i < portCount; i++) {
            let portName = output.getPortName(i);
            if (portName === name) {
                port = output.openPort(i);
                console.log(`Output Open: \t${colors.blue(portName)}`);
            }
        }
        return output;
    }

}
module.exports = MidiDevice;


let devices = {
    BeatStepPro: {
        name: 'Arturia BeatStep Pro Arturia BeatStepPro',
        instance: null
    },
    Minilogue: {
        name: 'minilogue SOUND',
        instance: null
    },
    MOTU828x: {
        name: '828x MIDI Port',
        instance: null
    }
};