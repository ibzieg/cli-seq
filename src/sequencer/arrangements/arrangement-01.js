const Arrangement = require("../arrangement");
const SequenceData = require("../sequence-data");
const Sequencer = require("../sequencer");
const ChordHarmonizer = require("../chord-harmonizer");
const Log = require("../../display/log-util");

const EuropiMinion = require("../../europi/europi-minion");
const MidiInstrument = require("../../midi/midi-instrument");

class Arrangement01 extends Arrangement {

    createControllerMap() {
        return {
            noteOn: {
                Pad1: {
                    label: "RndSQ",
                    callback: (velocity) => {
                        this.randomSeq1();
                        this.randomChordSeq();
                        this.randomSnareSeq();
                        this.randomKickSeq();
                    }
                },
                Pad2: {
                    label: "RndCH",
                    callback: (velocity) => {
                        this.randomScale();
                    }
                },
                Pad9: {
                    label: "GateA",
                    callback: (velocity) => {
                        this.minion.GateOutput(0, 1);
                    }
                },
                Pad10: {
                    label: "GateB",
                    callback: (velocity) => {
                        this.minion.GateOutput(0, 1);
                    }
                },
                Pad11: {
                    label: "GateC",
                    callback: (velocity) => {
                        this.minion.GateOutput(0, 1);
                    }
                },
                Pad12: {
                    //label: "Gate D",
                    callback: (velocity) => {
                        this.minion.GateOutput(0, 1);
                    }
                }
            },
            noteOff: {
                Pad9: {
                    callback: (velocity) => {
                        this.minion.GateOutput(0, 0);
                    }
                },
                Pad10: {
                    callback: (velocity) => {
                        this.minion.GateOutput(0, 0);
                    }
                },
                Pad11: {
                    callback: (velocity) => {
                        this.minion.GateOutput(0, 0);
                    }
                },
                Pad12: {
                    label: "GateD",
                    callback: (velocity) => {
                        this.minion.GateOutput(0, 0);
                    }
                }
            },
            controlChange: {
                Knob1: {
                    label: "CV A",
                    callback: (data) => {
                        this.minion.CVOutput(0, data/127.0);
                    }
                },
                Knob2: {
                    label: "CV B",
                    callback: (data) => {
                        this.minion.CVOutput(1, data/127.0);
                    }
                },
                Knob3: {
                    label: "CV C",
                    callback: (data) => {
                        this.minion.CVOutput(2, data/127.0);
                    }
                },
                Knob4: {
                    label: "CV D",
                    callback: (data) => {
                        this.minion.CVOutput(4, data/127.0);
                    }
                }
            }
        }
    }

    initialize() {
        ////////////////////////////////////////////////////////////////
        this.minion = new EuropiMinion();

        ////////////////////////////////////////////////////////////////
        this.seq1 = new Sequencer({
            instrument: MidiInstrument.instruments.BSPSeq1,
            chord: {
                root: "G",
                mode: "VI  Aeolian (Nat. Minor)"
            },
            rate: 4,
            data: SequenceData.getRandomSequence(() => SequenceData.getRandomNote(36, 72), 8, 32, 0.7),
            play: (index, event) => {
                this.minion.CVOutput(0,Math.random());
                this.minion.CVOutput(1,index / this.seq1.data.length);
                this.minion.CVOutput(2, 1.0 - (index / this.seq1.data.length));
                this.seq1.play(event[0], event[1], event[2]);
            },
            end: () => {
            }
        });
        this.addSequencer(this.seq1);

        ////////////////////////////////////////////////////////////////
        this.chordSeq = new Sequencer({
            instrument: MidiInstrument.instruments.Minilogue,
            chord: {
                root: "G",
                mode: "VI  Aeolian (Nat. Minor)"
            },
            rate: 2,
            data: SequenceData.getRandomSequence(() => SequenceData.getRandomNote(48, 84), 8, 32, 0.7),
            play: (index, event) => {
                this.chordSeq.play(event[0], event[1], event[2]);
            }
        });
        this.addSequencer(this.chordSeq);

        ////////////////////////////////////////////////////////////////
        this.kick = MidiInstrument.drumMap[0];
        this.kickSeq = new Sequencer({
            instrument: MidiInstrument.instruments.BSPDrum,
            rate: 1,
            data: [[this.kick, 127, 100]],
            end: () => {
                this.seq1.reset();
                this.chordSeq.reset();
                this.snareSeq.reset();
            }
        });
        this.addSequencer(this.kickSeq);

        ////////////////////////////////////////////////////////////////
        this.snare = MidiInstrument.drumMap[2];
        this.snareSeq = new Sequencer({
            instrument: MidiInstrument.instruments.BSPDrum,
            rate: 2,
            data: SequenceData.getRandomSequence(() => [this.snare, 127, 100], 8, 32, 0.4)
        });
        this.addSequencer(this.snareSeq);

    }

    start() {

    }

    stop() {

    }

    postClock() {

    }

    ////////////////////////////////////////////////////////////////
    randomSeq1() {
        this.seq1.data = SequenceData.getRandomSequence(() => SequenceData.getRandomNote(36, 72), 8, 32, 0.7);
        Log.music(`Voice 1 Sequence: ${this.seq1.data.map((stage) => stage ? stage[0] : '__').join(' ')}`);

    }

    ////////////////////////////////////////////////////////////////
    randomChordSeq() {
        this.chordSeq.data = SequenceData.getRandomSequence(() => SequenceData.getRandomNote(48, 84), 8, 32, 0.7);
    }

    ////////////////////////////////////////////////////////////////
    randomKickSeq() {
        this.kickSeq.data = SequenceData.getRandomSequence(() => [this.kick, 127, 100], 4, 64, 0.5);
    }

    ////////////////////////////////////////////////////////////////
    randomSnareSeq() {
        this.snareSeq.data = SequenceData.getRandomSequence(() => [this.snare, 127, 100], 8, 32, 0.4);
    }

    ////////////////////////////////////////////////////////////////
    randomScale() {
        let newChord = {
            root: ChordHarmonizer.NoteNames[Math.floor(Math.random() * ChordHarmonizer.NoteNames.length)],
            mode: ChordHarmonizer.ModeNames[Math.floor(Math.random() * ChordHarmonizer.ModeNames.length)]
        };

        this.seq1.chord = Object.assign({}, newChord);
        this.chordSeq.chord = Object.assign({ fifth: true }, newChord);

        Log.music(`Changed scale: ${newChord.root} '${newChord.mode}'`);
    }

}
module.exports = Arrangement01;