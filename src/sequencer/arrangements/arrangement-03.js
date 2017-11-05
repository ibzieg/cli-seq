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

const Arrangement = require("../arrangement");
const SequenceData = require("../sequence-data");
const Sequencer = require("../sequencer");
const ChordHarmonizer = require("../chord-harmonizer");
const Log = require("../../display/log-util");

const EuropiMinion = require("../../europi/europi-minion");
const MidiInstrument = require("../../midi/midi-instrument");

class Arrangement03 extends Arrangement {

    get title() {
        return `minimal 3 stage`;
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
                    label: "Root",
                    callback: (data) => {
                        let chord = Object.assign(this.state.chord, {
                            root: ChordHarmonizer.NoteNames[data % ChordHarmonizer.NoteNames.length]
                        });
                        this.setScale(chord);
                        return chord.root;
                    }
                },
                Knob2: {
                    label: "Mode",
                    callback: (data) => {
                        let chord = Object.assign(this.state.chord, {
                            mode: ChordHarmonizer.ModeNames[data % ChordHarmonizer.ModeNames.length]
                        });
                        this.setScale(chord);
                        return chord.mode;
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
                this.minion.CVOutput(0,index / this.voice1.data.length);
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
            rate: 4,
            data: this.state.data.voice2[0][0],
            play: (index, event) => {
                this.minion.CVOutput(1, 1.0 - (index / this.voice2.data.length));
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
                this.poly1.play(event[0], event[1], event[2]);
            }
        });
        this.addSequencer(this.poly1);

        ////////////////////////////////////////////////////////////////
        this.kickDrum = new Sequencer({
            instrument: MidiInstrument.instruments.BSPDrum,
            rate: 2,
            data: this.state.data.kickDrum[0][0],
            play: (index, event) => {
                this.minion.CVOutput(2,event[3]*0.5);
                this.kickDrum.play(event[0], event[1], event[2]);
            },
            end: () => {
                this.setStage(this.state.stageIndex+1);
            }
        });
        this.addSequencer(this.kickDrum);

        ////////////////////////////////////////////////////////////////
        this.ticksSinceSnare = 0;
        this.rainmakerCV = 0.0;
        this.rainmakerCVPeak = 0.5;
        this.rainmakerCVTickCount = 24;
        this.rainmakerCVDelayTicks = 6;
        this.rainmakerCVDirection = 1; // up

        this.snareDrum = new Sequencer({
            instrument: MidiInstrument.instruments.BSPDrum,
            rate: 2,
            data: this.state.data.snareDrum[0][0],
            play: (index, event) => {
                this.ticksSinceSnare = 0;

                this.rainmakerCVPeak = (Math.random() * 0.1) + 0.2;
                this.rainmakerCVDelayTicks = SequenceData.getRandomEven(4, 8);
                this.rainmakerCVTickCount = SequenceData.getRandomEven(8, 24);
                this.rainmakerCVDirection = Math.random() > 0.5 ? 1 : 0;

                //this.minion.CVOutput(3,event[3]*0.5);
                this.snareDrum.play(event[0], event[1], event[2]);
            },
        });
        this.addSequencer(this.snareDrum);

    }

    start() {

    }

    stop() {
        this.setStage(0);
        this.minion.GateOutput(3, 0);
    }

    postClock() {
        if (this.ticksSinceSnare <= this.rainmakerCVDelayTicks+this.rainmakerCVTickCount) {
            if (this.ticksSinceSnare === this.rainmakerCVDelayTicks) {
                this.minion.GateOutput(3, 1);
                if (this.rainmakerCVDirection > 0) { // up
                    this.rainmakerCV = 0.0;
                } else {
                    this.rainmakerCV = this.rainmakerCVPeak;
                }
            } else if (this.ticksSinceSnare < this.rainmakerCVDelayTicks+this.rainmakerCVTickCount) {
                let deltaCV = this.rainmakerCVPeak / this.rainmakerCVTickCount;
                if (this.rainmakerCVDirection > 0) { // up
                    this.rainmakerCV = this.rainmakerCV + deltaCV;
                } else {
                    this.rainmakerCV = this.rainmakerCV - deltaCV;
                }
            } else if (this.ticksSinceSnare === this.rainmakerCVDelayTicks+this.rainmakerCVTickCount) {
                if (this.rainmakerCVDirection > 0) { // up
                    this.rainmakerCV = this.rainmakerCVPeak;
                } else {
                    this.rainmakerCV = 0.0;
                }
                this.minion.GateOutput(3, 0);
            }
        } else {
            this.rainmakerCV = 0.0;
        }
        this.minion.CVOutput(3, this.rainmakerCV);
        this.ticksSinceSnare = this.ticksSinceSnare+1;
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

        this.iteration(iteration);

        this.updateTitle();


    }

    setSequencerStage(seqName, stage, iteration) {
        let stageData = this.state.data[seqName][stage];
        if (stageData) {
            this[seqName].data = stageData[iteration % stageData.length];
        } else {
            Log.warning(`setSequencerStage: stageData missing for ${seqName} @ ${iteration}.${stage}`);
        }
        this[seqName].reset();
    }

    iteration(count) {
        this.voice1.enabled = true;
        this.voice2.enabled = true;
        this.poly1.enabled = true;
        this.kickDrum.enabled = true;
        this.snareDrum.enabled = true;
        return;

        switch (count) {
            case 0:
                this.voice1.enabled = true;
                this.voice2.enabled = false;
                this.poly1.enabled = false;
                this.kickDrum.enabled = false;
                this.snareDrum.enabled = false;
                break;
            case 4:
                this.kickDrum.enabled = true;
                break;
            case 8:
                this.poly1.enabled = true;
                this.snareDrum.enabled = true;
                break;
            case 12:
                this.voice2.enabled = true;
                this.voice1.enabled = false;
                break;
            case 14:
                this.voice1.enabled = true;
                break;
            case 22:
                this.kickDrum.enabled = false;
                break;
            case 26:
                this.poly1.enabled = false;
                break;
            case 30:
                this.voice1.enabled = false;
                break;
            case 32:
                this.snareDrum.enabled = false;
                this.voice2.enabled = false;
                break;


        }
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
                [this.getRandomPoly1Data(), this.getRandomPoly1Data()],
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
        return SequenceData.getRandomSequence(() => SequenceData.getRandomNote(36, 72), 2, 16, 0.3);
    }

    ////////////////////////////////////////////////////////////////
    getRandomVoice2Data() {
        return SequenceData.getRandomSequence(() => SequenceData.getRandomNote(24, 60), 2, 16, 0.2);
    }

    ////////////////////////////////////////////////////////////////
    getRandomPoly1Data() {
        return SequenceData.getRandomSequence(() => SequenceData.getRandomNote(36, 72), 2, 16, 0.2);
    }

    ////////////////////////////////////////////////////////////////
    getRandomKickDrumData() {
        let makeKick = () => [MidiInstrument.drumMap[0], 127, 100, Math.random()];
/*        let data = SequenceData.getRandomSequence(makeKick, 2, 8, 0.5);
        data[0] = makeKick();
        data[0][3] = 1.0;*/

        let data = [
            makeKick(),
            null,
            makeKick(),
            null,
            makeKick(),
            null,
            makeKick(),
            null,
        ];

        return data;
    }

    ////////////////////////////////////////////////////////////////
    getRandomSnareDrumData() {
        //return SequenceData.getRandomSequence(() => [MidiInstrument.drumMap[1], 127, 100], 2, 8, 0.4);

        let makeSnare = () => [MidiInstrument.drumMap[1], 127, 100, Math.random()];

        let data = [
            null,
            null,
            makeSnare(),
            null,
            null,
            null,
            makeSnare(),
            null
        ];

        return data;

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
module.exports = Arrangement03;