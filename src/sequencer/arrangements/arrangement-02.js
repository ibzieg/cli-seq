const Arrangement = require("../arrangement");
const SequenceData = require("../sequence-data");
const Sequencer = require("../sequencer");
const ChordHarmonizer = require("../chord-harmonizer");
const Log = require("../../display/log-util");

const EuropiMinion = require("../../europi/europi-minion");
const MidiInstrument = require("../../midi/midi-instrument");

class Arrangement02 extends Arrangement {

    get title() {
        let stage = this.state.stageIndex % this.state.stageCount;
        let iteration = Math.floor(this.state.stageIndex / this.state.stageCount);

        return `Multistage {green-fg}${iteration}.${stage}{/}`;
    }

    createControllerMap() {
        return {
            noteOn: {
                Pad1: {
                    label: "Rnd Seq",
                    callback: (velocity) => {
                        Log.success(`Randomized stage data`);
                        this.state.data = this.getRandomStageData();
                    }
                },
                Pad2: {
                    label: "Rnd Scl",
                    callback: (velocity) => {
                        this.setScale(this.getRandomScale());
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

        this.state = {
            stageCount: 3,
            stageIndex: 0,
            chord: this.getRandomScale(),
            data: this.getRandomStageData()
        };

        ////////////////////////////////////////////////////////////////
        this.voice1 = new Sequencer({
            instrument: MidiInstrument.instruments.BSPSeq1,
            chord: this.state.chord,
            rate: 4,
            data: this.state.data.voice1[0][0],
            play: (index, event) => {
                this.minion.CVOutput(1,index / this.voice1.data.length);
                this.voice1.play(event[0], event[1], event[2]);
            },
            end: () => {
            }
        });
        this.addSequencer(this.voice1);

        ////////////////////////////////////////////////////////////////
        this.voice2 = new Sequencer({
            instrument: MidiInstrument.instruments.BSPSeq2,
            chord: this.state.chord,
            rate: 2,
            data: this.state.data.voice1[0][0],
            play: (index, event) => {
                this.minion.CVOutput(2, 1.0 - (index / this.voice2.data.length));
                this.voice2.play(event[0], event[1], event[2]);
            },
            end: () => {
            }
        });
        this.addSequencer(this.voice2);

        ////////////////////////////////////////////////////////////////
        this.poly1 = new Sequencer({
            instrument: MidiInstrument.instruments.Minilogue,
            chord: this.state.chord,
            rate: 1,
            data: this.state.data.poly1[0][0],
            play: (index, event) => {
                this.minion.CVOutput(0,Math.random());
                this.poly1.play(event[0], event[1], event[2]);
            }
        });
        this.addSequencer(this.poly1);

        ////////////////////////////////////////////////////////////////
        this.kickDrum = new Sequencer({
            instrument: MidiInstrument.instruments.BSPDrum,
            rate: 1,
            data: this.state.data.kickDrum[0][0],
            end: () => {
                this.setStage(this.state.stageIndex+1);
            }
        });
        this.addSequencer(this.kickDrum);

        ////////////////////////////////////////////////////////////////
        this.snare = MidiInstrument.drumMap[1];
        this.snareDrum = new Sequencer({
            instrument: MidiInstrument.instruments.BSPDrum,
            rate: 2,
            data: this.state.data.snareDrum[0][0]
        });
        this.addSequencer(this.snareDrum);

    }

    start() {

    }

    stop() {
        this.setStage(0);
    }

    postClock() {

    }

    setStage(index) {
        this.state.stageIndex = index;
        let stage = index % this.state.stageCount;
        let iteration = Math.floor(index / this.state.stageCount);

        this.setSequencerStage("voice1", stage, iteration);
        this.setSequencerStage("voice2", stage, iteration);
        this.setSequencerStage("poly1", stage, iteration);
        this.setSequencerStage("snareDrum", stage, iteration);
        this.setSequencerStage("kickDrum", stage, iteration);

        //Log.debug(`setStage index=${index} stage=${stage} iter=${iteration}`);
        this.updateTitle();

    }

    setSequencerStage(seqName, stage, iteration) {
        let stageData = this.state.data[seqName][stage];
        this[seqName].data =  stageData[iteration % stageData.length];
        this[seqName].reset();
    }

    getRandomStageData() {
        return {
            voice1: [
                [this.getRandomVoice1Data()],
                [this.getRandomVoice1Data(), this.getRandomVoice1Data() ],
                [this.getRandomVoice1Data()]
            ],
            voice2: [
                [this.getRandomVoice2Data()],
                [this.getRandomVoice2Data()],
                [this.getRandomVoice2Data()],
            ],
            poly1: [
                [this.getRandomPoly1Data()],
                [this.getRandomPoly1Data()],
                [this.getRandomPoly1Data()]
            ],
            snareDrum: [
                [this.getRandomSnareDrumData()],
                [this.getRandomSnareDrumData()],
                [this.getRandomSnareDrumData()],
            ],
            kickDrum: [
                [
                    this.getRandomKickDrumData(),
                    this.getRandomKickDrumData()
                ],
                [
                    this.getRandomKickDrumData(),
                    this.getRandomKickDrumData()
                ],
                [
                    this.getRandomKickDrumData(),
                    this.getRandomKickDrumData()
                ]
            ]
        }
    }

    ////////////////////////////////////////////////////////////////
    getRandomVoice1Data() {
        return SequenceData.getRandomSequence(() => SequenceData.getRandomNote(36, 72), 8, 32, 0.7);
    }

    ////////////////////////////////////////////////////////////////
    getRandomVoice2Data() {
        return SequenceData.getRandomSequence(() => SequenceData.getRandomNote(24, 60), 8, 32, 0.7);
    }

    ////////////////////////////////////////////////////////////////
    getRandomPoly1Data() {
        return SequenceData.getRandomSequence(() => SequenceData.getRandomNote(48, 84), 8, 32, 0.7);
    }

    ////////////////////////////////////////////////////////////////
    getRandomKickDrumData() {
        return SequenceData.getRandomSequence(() => [MidiInstrument.drumMap[0], 127, 100], 2, 6, 0.5);
    }

    ////////////////////////////////////////////////////////////////
    getRandomSnareDrumData() {
        return SequenceData.getRandomSequence(() => [MidiInstrument.drumMap[1], 127, 100], 8, 32, 0.4);
    }

    ////////////////////////////////////////////////////////////////
    getRandomScale() {
        return {
            root: ChordHarmonizer.NoteNames[Math.floor(Math.random() * ChordHarmonizer.NoteNames.length)],
            mode: ChordHarmonizer.ModeNames[Math.floor(Math.random() * ChordHarmonizer.ModeNames.length)]
        };
    }

    ////////////////////////////////////////////////////////////////
    setScale(scale) {
        this.state.chord = scale;
        this.voice1.chord = Object.assign({}, this.state.chord);
        this.voice2.chord = Object.assign({}, this.state.chord);
        this.poly1.chord = Object.assign({ fifth: true }, this.state.chord);
        Log.music(`Set Scale: ${scale.root} '${scale.mode}'`);
    }

}
module.exports = Arrangement02;