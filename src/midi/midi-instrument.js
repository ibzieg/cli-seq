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

        try {
            this._midiDevice.output.sendMessage([noteOnStatus, note, velocity]);
        } catch (ex) {
            Log.error(`Failed to send MIDI message [${noteOnStatus},${note},${velocity}]: ${ex}`);
        }
        setTimeout(() => {
            try {
                this._midiDevice.output.sendMessage([noteOffStatus, note, velocity]);
            } catch (ex) {
                Log.error(`Failed to send MIDI message [${noteOnStatus},${note},${velocity}]: ${ex}`);
            }
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
        device: MidiDevice.devices.Midisport,
        channel: 13
    },
    NordG2A: {
        //device: MidiDevice.devices.MOTU828x,
        device: MidiDevice.devices.Midisport,
        channel: 7
    }
};
