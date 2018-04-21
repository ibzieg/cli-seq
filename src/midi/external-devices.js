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

/***
 *
 */
const devices = {
    BeatStepPro: {
        names: [
            'Arturia BeatStep Pro Arturia BeatStepPro',
            'Arturia BeatStep Pro 20:0',
            'Arturia BeatStep Pro 24:0',
            'Arturia BeatStep Pro 28:0'],
    },
    Minilogue: {
        names: [
            'minilogue SOUND',
            'minilogue 24:1',
            'minilogue 28:1'
        ],
    },
    MOTU828x: {
        names: ['828x MIDI Port'],
    },
    Midisport: {
        names: [
            'USB Uno MIDI Interface 28:0',
            'USB Uno MIDI Interface 20:0'],
    }
};

/***
 *
 */
const instruments = {
    BSPSeq1: {
        device: devices.BeatStepPro,
        channel: 1
    },
    BSPSeq2: {
        device: devices.BeatStepPro,
        channel: 2
    },
    BSPDrum: {
        device: devices.BeatStepPro,
        channel: 14
    },
    Minilogue: {
        device: devices.Minilogue,
        channel: 1
    },
    Juno106: {
        device: devices.Midisport,
        channel: 13
    },
    NordG2A: {
        //device: MidiDevice.devices.MOTU828x,
        device: devices.Midisport,
        channel: 7
    }
};

module.exports = {
    devices: devices,
    instruments: instruments
};

