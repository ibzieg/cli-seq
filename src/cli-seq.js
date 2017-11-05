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

const process = require("process");
const midi = require("midi");
const colors = require("colors");
const NanoTimer = require("nanotimer");

const ChordHarmonizer = require("./sequencer/chord-harmonizer");

const MidiDevice = require("./midi/midi-device");
const MidiController = require("./midi/midi-controller");
const MidiInstrument = require("./midi/midi-instrument");
const EuropiMinion = require("./europi/europi-minion");

const Sequencer = require("./sequencer/sequencer");
const Log = require("./display/log-util");

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

let minion = new EuropiMinion();

let controller = new MidiController({
    device: MidiDevice.devices.BeatStepPro,
    channel: 7,
    receiveMessage: (status, d1, d2) => {
        process.send({
            type: "controller",
            status: status,
            d1: d1,
            d2: d2
        });
        controllerMessage(status, d1, d2);
    },
    postClock: () => {
    },
    stop: () => {
        //seq.data = getRandomSequence();
    }
});

function controllerMessage(status, d1, d2) {
    switch (status) {
        case 144: // Note on
            switch (d1) {
                case MidiController.BeatStepMap.Pad9:  minion.GateOutput(0, 1); break;
                case MidiController.BeatStepMap.Pad10: minion.GateOutput(1, 1); break;
                case MidiController.BeatStepMap.Pad11: minion.GateOutput(2, 1); break;
                case MidiController.BeatStepMap.Pad12: minion.GateOutput(3, 1); break;

                case MidiController.BeatStepMap.Pad1:
                    randomKickSequence();
                    randomChordSeq();
                    randomSnareSequence();
                    randomizeSeq1();
                    break;
            }
            break;
        case 128: // Note off
            switch (d1) {
                case MidiController.BeatStepMap.Pad9:  minion.GateOutput(0, 0); break;
                case MidiController.BeatStepMap.Pad10: minion.GateOutput(1, 0); break;
                case MidiController.BeatStepMap.Pad11: minion.GateOutput(2, 0); break;
                case MidiController.BeatStepMap.Pad12: minion.GateOutput(3, 0); break;
            }
            break;
        case 176: // Control Change
            switch (d1) {
                case MidiController.BeatStepMap.Knob1: minion.CVOutput(0, d2/127.0); break;
                case MidiController.BeatStepMap.Knob2: minion.CVOutput(1, d2/127.0); break;
                case MidiController.BeatStepMap.Knob3: minion.CVOutput(2, d2/127.0); break;
                case MidiController.BeatStepMap.Knob4: minion.CVOutput(3, d2/127.0); break;
            }
            break;

    }

}

function getRandomNote() {
    let min = 36;
    let max = 72;
    let note = Math.floor(min+Math.random()*(max-min+1));
    return note;
}

function getRandomSequence(nextNote, min, max, density) {
    min = Math.floor(min/2)*2; // force even
    max = Math.floor(max/2)*2; // force even
    if (density < 0) density = 0;
    if (density > 1) density = 1;
    let length = Math.floor(min+Math.random()*(max-min+1));
    let seq = [];
    for (let i = 0; i < length; i++) {
        if (Math.random() < density) {
            if (i % 2 !== 0 && Math.random() < density) {
                seq.push(null);
            } else {
                seq.push([nextNote(), 127, 127]);
            }
        } else {
            seq.push(null);
        }
    }
    return seq;
}


let endCount = 0;
let seq = new Sequencer({
    instrument: MidiInstrument.instruments.BSPSeq1,
    chord: {
        root: "G",
        mode: "VI  Aeolian (Nat. Minor)"
    },
    rate: 4,
    data: getRandomSequence(getRandomNote, 8, 32, 0.7),
    play: (index, event) => {
        minion.CVOutput(0,Math.random());
        minion.CVOutput(1,index / seq.data.length);
        minion.CVOutput(2, 1.0 - (index / seq.data.length));
        seq.play(event[0], event[1], event[2]);
    },
    end: () => {
        if (endCount % 4) {
            // seq.data = getRandomSequence(getRandomNote, 8, 32, 0.7);
        }
        //Log.music(`Seq1 ended`);
        endCount++;
    }
});
controller.register(seq);



function randomizeSeq1() {

    seq.data = getRandomSequence(getRandomNote, 8, 32, 0.7);

    let modeCount = ChordHarmonizer.ModeNames.length;

    let newChord = {
        root: "G",
        mode: ChordHarmonizer.ModeNames[Math.floor(Math.random() * modeCount)]
    };

    seq.chord = Object.assign({}, newChord);

    chordSeq.chord = Object.assign({
        //third: true,
        fifth: true
    }, newChord);

    Log.music(`Voice 1 Sequence: ${seq.data.map((stage) => stage ? stage[0] : '__').join(' ')}`);

}


let chordSeq = new Sequencer({
    instrument: MidiInstrument.instruments.Minilogue,
    chord: {
        root: "G",
        mode: "VI  Aeolian (Nat. Minor)"
    },
    rate: 2,
    data: getRandomSequence(() => getRandomNote()+12, 8, 32, 0.7),
    play: (index, event) => {
        //Log.music(`minilogue note: ${event}`);
        chordSeq.play(event[0], event[1], event[2]);
    }
});
controller.register(chordSeq);

function randomChordSeq() {
    chordSeq.data = getRandomSequence(getRandomNote, 8, 32, 0.7);
    Log.music(`Chord Sequence: ${seq.data.map((stage) => stage ? stage[0] : '__').join(' ')}`);
}



let kick = MidiInstrument.drumMap[0];
let kickSeq = new Sequencer({
    instrument: MidiInstrument.instruments.BSPDrum,
    rate: 1,
    //data: getRandomSequence(() => kick, 4, 64, 0.5),
    data: [[kick, 127, 100]],
    end: () => {
        snareSeq.reset();
        seq.reset();
        chordSeq.reset();
        //Log.music(`Kick sequenced ended`);
    }
});
controller.register(kickSeq);

function randomKickSequence() {
    kickSeq.data = getRandomSequence(() => kick, 4, 64, 0.5);
    Log.music(`Kick Sequence: ${kickSeq.data.map((stage) => stage ? stage[0] : '__').join(' ')}`);
}

function randomSnareSequence() {
    snareSeq.data = getRandomSequence(() => snare, 4, 64, 0.5);
    Log.music(`Snare Sequence: ${snareSeq.data.map((stage) => stage ? stage[0] : '__').join(' ')}`);
}


let snare = MidiInstrument.drumMap[6];
let snareSeq = new Sequencer({
    instrument: MidiInstrument.instruments.BSPDrum,
    rate: 2,
    data: getRandomSequence(() => snare, 8, 32, 0.4)
});
controller.register(snareSeq);


let stageSeq = new Sequencer({
    partsPerQuant: 1,
    rate: 1,
    data: [
        () => {},
        () => {},
        () => {},
    ]
});


let stageIndex = 0;
let stages = [
    () => {},
    () => {},
    () => {},
];
function nextStage() {
    stages[++stageIndex % stages.length]();
}
