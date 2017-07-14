const process = require("process");
const midi = require("midi");
const colors = require("colors");
const NanoTimer = require("nanotimer");

const MidiDevice = require("./midi-device");
const MidiController = require("./midi-controller");
const MidiInstrument = require("./midi-instrument");

const Sequencer = require("./sequencer");
const Log = require("./log-util");


let controller = new MidiController({
    device: MidiDevice.devices.BeatStepPro,
    postClock: () => {

    },
    stop: () => {
        seq.data = getRandomSequence();
    }
});


function getRandomNote() {
    let min = 36;
    let max = 72;
    let note = Math.floor(min+Math.random()*(max-min+1));
    return note;
}

function getRandomSequence() {
    let min = 4;
    let max = 16;
    let length = Math.floor(min+Math.random()*(max-min+1));
    length = length * 2;
    let seq = [];
    for (let i = 0; i < length; i++) {
        if (i % 2 !== 0 && Math.random() < 0.4) {
            seq.push(null);
        } else {
            seq.push([getRandomNote(), 127, 127]);
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
    data: getRandomSequence(),
    onEnd: () => {
        if (endCount % 12) {
            seq.data = getRandomSequence();
        }
        Log.music(`Seq1 ended`);
        endCount++;
    }
});
controller.register(seq);


let kick = MidiInstrument.drumMap[0];
let kickSeq = new Sequencer({
    instrument: MidiInstrument.instruments.BSPDrum,
    rate: 24,
    data: [
        [kick, 127, 127],
        [kick, 127, 127],
        [kick, 127, 127],
        [kick, 127, 127],
        [kick, 127, 127],
        null,
        [kick, 127, 127],
        null,
        [kick, 127, 127],
        null,
        null,
        null,
        [kick, 127, 127],
        null,
        null,
        null,
        [kick, 127, 127],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [kick, 127, 127],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [kick, 127, 127],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [kick, 127, 127],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [kick, 127, 127],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [kick, 127, 127],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
    ]
});
controller.register(kickSeq);



