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

const Arrangement = require("./arrangement");
const SequenceData = require("./sequence-data");
const Sequencer = require("./sequencer");
const ChordHarmonizer = require("./chord-harmonizer");
const Log = require("../display/log-util");

const MidiController = require("../midi/midi-controller");
const EuropiMinion = require("../europi/europi-minion");
const MidiInstrument = require("../midi/midi-instrument");

class PerformanceArrangement extends Arrangement {

    get defaultState() {
        let state = {
            selectedDeviceIndex: 0,
            stageCount: 3,
            stageIndex: 0,
            evolveAmount: 0.5,
            noteSet: [64],
            noteSetSize: 15,
            enableEvolve: false,
            rainmakerCVTickCountMin: 12,
            rainmakerCVTickCountMax: 36,
            mono1: {
                instrument: "BSPSeq1",
                rate: 2,
                low: 36,
                high: 64,
                algorithm: "random",
                density: 0.5,
                min: 8,
                max: 16,
                stages: [1, 2, 1]
            },
            mono2: {
                instrument: "BSPSeq2",
                rate: 2,
                low: 36,
                high: 64,
                algorithm: "random",
                density: 0.5,
                min: 8,
                max: 16,
                stages: [1, 1, 2]
            },
            poly1: {
                instrument: "NordG2A",
                rate: 2,
                low: 36,
                high: 64,
                algorithm: "random",
                density: 0.5,
                min: 8,
                max: 16,
                stages: [2, 1, 1]
            },
            perc1: {
                instrument: "BSPDrum",
                rate: 2,
                algorithm: "perc",
                density: 0.5,
                min: 32,
                max: 32,
                stages: [2, 1, 2]
            },
            perc2: {
                instrument: "BSPDrum",
                rate: 2,
                algorithm: "perc",
                density: 0.5,
                min: 16,
                max: 16,
                stages: [1, 1, 1]
            },
            perc3: {
                instrument: "BSPDrum",
                rate: 2,
                algorithm: "perc",
                density: 0.5,
                min: 16,
                max: 16,
                stages: [0, 1, 1]
            },
            perc4: {
                instrument: "BSPDrum",
                rate: 2,
                algorithm: "perc",
                density: 0.5,
                min: 16,
                max: 16,
                stages: [1, 0, 1]
            }
        };
        // state.chord = this.getRandomScale();
        // state.data = this.getRandomStageData();
        return state;
    }

    get title() {
        return "PerformanceArrangement";
    }

    get screenTitle() {
        let stage = this.state.stageIndex % this.state.stageCount;
        let iteration = Math.floor(this.state.stageIndex / this.state.stageCount);
        return `${this.title} {green-fg}${iteration}.${stage}{/}`;
    }

    get deviceState() {
        if (this.mono1) {
            return [
                { name: this.state.mono1.instrument, enabled: this.mono1.enabled, selected: this.state.selectedDeviceIndex === 0, connected: this.mono1.instrument.isConnected },
                { name: this.state.mono2.instrument, enabled: this.mono2.enabled, selected: this.state.selectedDeviceIndex === 1, connected: this.mono2.instrument.isConnected },
                { name: this.state.poly1.instrument, enabled: this.poly1.enabled, selected: this.state.selectedDeviceIndex === 2, connected: this.poly1.instrument.isConnected },
                { name: "-",                         enabled: false,              selected: this.state.selectedDeviceIndex === 3, connected: false },
                { name: this.state.perc1.instrument, enabled: this.perc1.enabled, selected: this.state.selectedDeviceIndex === 4, connected: this.perc1.instrument.isConnected },
                { name: this.state.perc2.instrument, enabled: this.perc2.enabled, selected: this.state.selectedDeviceIndex === 5, connected: this.perc2.instrument.isConnected },
                { name: this.state.perc3.instrument, enabled: this.perc3.enabled, selected: this.state.selectedDeviceIndex === 6, connected: this.perc3.instrument.isConnected },
                { name: this.state.perc4.instrument, enabled: this.perc4.enabled, selected: this.state.selectedDeviceIndex === 7, connected: this.perc4.instrument.isConnected },
            ];
        } else {
            return [
                { name: "-", enabled: false, selected: false, connected: false },
                { name: "-", enabled: false, selected: false, connected: false },
                { name: "-", enabled: false, selected: false, connected: false },
                { name: "-", enabled: false, selected: false, connected: false },
                { name: "-", enabled: false, selected: false, connected: false },
                { name: "-", enabled: false, selected: false, connected: false },
                { name: "-", enabled: false, selected: false, connected: false },
                { name: "-", enabled: false, selected: false, connected: false }
            ]
        }
    }

    updateDeviceState() {
        process.send({
            type: "deviceState",
            deviceState:this.deviceState
        });
    }

    updateControllerState() {
        let seqState = this.state[this.getSeqName(this.state.selectedDeviceIndex)];
        if (!seqState) {
            seqState = {};
        }
        this.updateControllerKnob(MidiController.BeatStepMap.Knob1, seqState.rate);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob2, seqState.low);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob3, seqState.high);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob4, Math.round(seqState.density*100)+"%");
        this.updateControllerKnob(MidiController.BeatStepMap.Knob5, seqState.min);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob6, seqState.max);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob7, seqState.stages);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob8, seqState.algorithm);



    }

    getSeqName(index) {
        switch (index) {
            case 0: return "mono1";
            case 1: return "mono2";
            case 2: return "poly1";
            case 3: return "poly2";
            case 4: return "perc1";
            case 5: return "perc2";
            case 6: return "perc3";
            case 7: return "perc4";
        }
    }

    createControllerMap() {
        return {
            noteOn: {
                Pad1: {
                    label: "Rnd Seq",
                    callback: (velocity) => {
                        Log.success(`Randomized stage data`);
                        this.state.data = this.getRandomStageData();
                        return "Randomize";
                    }
                },
                Pad2: {
                    label: "Rnd Scale",
                    callback: (velocity) => {
                        this.setScale(this.getRandomScale());
                        return "Randomize";
                    }
                },
                Pad9: {
                    label: "Evo mono1",
                    callback: (velocity) => {
                        this.state.data.mono1 = this.evolveSequenceStages(this.state.data.mono1, this.state.evolveAmount, this.getRandomMono1Data.bind(this));
                        return "Evolve";
                    }
                },
                Pad10: {
                    label: "Evo mono2",
                    callback: (velocity) => {
                        this.state.data.mono2 = this.evolveSequenceStages(this.state.data.mono2, this.state.evolveAmount, this.getRandomMono2Data.bind(this));
                        return "Evolve";
                    }
                },
                Pad11: {
                    label: "Evo poly1",
                    callback: (velocity) => {
                        this.state.data.poly1 = this.evolveSequenceStages(this.state.data.poly1, this.state.evolveAmount, this.getRandomPoly1Data.bind(this));
                        return "Evolve";
                    }
                },
                Pad12: {
                    label: "Evo perc1",
                    callback: (velocity) => {
                        this.state.data.perc1 = this.evolveSequenceStages(this.state.data.perc1, this.state.evolveAmount, this.getRandomPerc1DrumData.bind(this));
                        return "Evolve";
                    }
                },
                Pad13: {
                    label: "Evo perc2",
                    callback: (velocity) => {
                        this.state.data.perc2 = this.evolveSequenceStages(this.state.data.perc2, this.state.evolveAmount, this.getRandomPerc2DrumData.bind(this));
                        return "Evolve";
                    }
                },
                Pad14: {
                    label: "Evo perc3",
                    callback: (velocity) => {
                        this.state.data.perc3 = this.evolveSequenceStages(this.state.data.perc3, this.state.evolveAmount, this.getRandomPerc3DrumData.bind(this));
                        return "Evolve";
                    }
                },
                Pad15: {
                    label: "Evo perc4",
                    callback: (velocity) => {
                        this.state.data.perc4 = this.evolveSequenceStages(this.state.data.perc4, this.state.evolveAmount, this.getRandomPerc4DrumData.bind(this));
                        return "Evolve";
                    }
                },
                Pad16: {
                    label: "EnableEvo",
                    callback: (velocity) => {
                        this.state.enableEvolve = !this.state.enableEvolve;
                        return this.state.enableEvolve ? "ON" : "OFF";
                    }
                }
            },
            noteOff: {
            },
            controlChange: {
                Knob1: {
                    label: "Rate",
                    callback: (data) => {
                        let rate = data % 8;
                        let seq = this[this.getSeqName(this.state.selectedDeviceIndex)];
                        if (seq) {
                            seq.rate = rate;
                        }
                        return rate;
                    }
                },

                Knob2: {
                    label: "LowNote",
                    callback: (data) => {
                        let note = data;
                        this.state[this.getSeqName(this.state.selectedDeviceIndex)].low = note;
                        return note;
                    }
                },


                Knob3: {
                    label: "HighNote",
                    callback: (data) => {
                        let note = data;
                        this.state[this.getSeqName(this.state.selectedDeviceIndex)].high = note;
                        return note;
                    }
                },


                Knob4: {
                    label: "Density",
                    callback: (data) => {
                        let d = data / 128;
                        this.state[this.getSeqName(this.state.selectedDeviceIndex)].density = d;
                        return Math.round(d*100)+"%";
                    }
                },


                Knob5: {
                    label: "MinLength",
                    callback: (data) => {
                        let m = data;
                        this.state[this.getSeqName(this.state.selectedDeviceIndex)].min = m;
                        return m;
                    }
                },


                Knob6: {
                    label: "MaxLength",
                    callback: (data) => {
                        let m = data;
                        this.state[this.getSeqName(this.state.selectedDeviceIndex)].max = m;
                        return m;
                    }
                },


                Knob7: {
                    label: "Stages",
                    callback: (data) => {
                        let i = data % 8;
                        let s = [];
                        s[0] = (i & 0b001) > 0 ? 2 : 1;
                        s[1] = (i & 0b010) > 0 ? 2 : 1;
                        s[2] = (i & 0b100) > 0 ? 2 : 1;
                        this.state[this.getSeqName(this.state.selectedDeviceIndex)].stages = s;
                        return s.toString();
                    }
                },


                Knob8: {
                    label: "Algorithm",
                    callback: (data) => {
                        let algos = ["euclid", "perc","quarterbeat","halfbeat", "ryk", "random"];
                        let i = data % algos.length;
                        let algo = algos[i];
                        this.state[this.getSeqName(this.state.selectedDeviceIndex)].algorithm = algo;
                        return algo;
                    }
                },

                Knob9: {
                    label: "Root",
                    callback: (data) => {
                        let chord = Object.assign(this.state.chord, {
                            root: ChordHarmonizer.NoteNames[data % ChordHarmonizer.NoteNames.length]
                        });
                        this.setScale(chord);
                        return chord.root;
                    }
                },
                Knob10: {
                    label: "Mode",
                    callback: (data) => {
                        let chord = Object.assign(this.state.chord, {
                            mode: ChordHarmonizer.ModeNames[data % ChordHarmonizer.ModeNames.length]
                        });
                        this.setScale(chord);
                        return chord.mode;
                    }
                },
                Knob11: {
                    label: "Evo Amt",
                    callback: (data) => {
                        let pct = data / 127.0;
                        this.state.evolveAmount = pct;
                        return Math.round(100*this.state.evolveAmount)+'%';
                    }
                },
                Knob12: {
                    label: "RMTicMin",
                    callback: (data) => {
                        let pct = data / 127.0;
                        this.state.rainmakerCVTickCountMin = Math.floor(pct * 128);
                        return this.state.rainmakerCVTickCountMin;
                    }
                },
                Knob13: {
                    label: "RMTicMax",
                    callback: (data) => {
                        let pct = data / 127.0;
                        this.state.rainmakerCVTickCountMax = Math.floor(pct * 128);
                        return this.state.rainmakerCVTickCountMax;
                    }
                },
                Knob16: {
                    label: "Device",
                    callback: (data) => {
                        this.state.selectedDeviceIndex = data % 8;
                        this.updateDeviceState();
                        this.updateControllerState();
                        return `${this.state.selectedDeviceIndex}:${this.deviceState[this.state.selectedDeviceIndex].name}`;
                    }
                }
            }
        }
    }

    /***
     *
     * @param changes
     */
    setState(changes) {
        this.state = Object.assign(state, changes);
    }

    /***
     *
     */
    initialize() {

        if (!this.state.chord) {
            this.state.chord = this.getRandomScale();
        }

        if (!this.state.data) {
            this.state.data = this.getRandomStageData();
        }

        ////////////////////////////////////////////////////////////////
        this.mono1 = new Sequencer({
            instrument: MidiInstrument.instruments[this.state.mono1.instrument],
            chord: this.state.chord,
            arpMode: this.state.mono1.arpMode,
            arpRate: this.state.mono1.arpRate,
            rate: this.state.mono1.rate,
            data: this.state.data.mono1[0][0],
            play: (index, event) => {
                this.minion.CVOutput(0, event[3]);
                this.mono1.play(event[0], event[1], event[2]);
            },
            end: () => {
            }
        });
        this.addSequencer(this.mono1);

        ////////////////////////////////////////////////////////////////
        this.mono2 = new Sequencer({
            instrument: MidiInstrument.instruments[this.state.mono2.instrument],
            chord: this.state.chord,
            rate: this.state.mono2.rate,
            data: this.state.data.mono2[0][0],
            play: (index, event) => {
                this.minion.CVOutput(1, event[3]);
                let duration = event[2];
                if (typeof duration === "string") {
                    duration = this.poly1.getNoteDuration(duration);
                }
                //let duration = this.poly1.getNoteDuration("4n");
                this.morphageneTrigger(duration);
                this.mono2.play(event[0], event[1], event[2]);
            },
            end: () => {
            }
        });
        this.addSequencer(this.mono2);

        ////////////////////////////////////////////////////////////////
        this.poly1 = new Sequencer({
            instrument: MidiInstrument.instruments[this.state.poly1.instrument],
            chord: this.state.chord,
            rate: this.state.poly1.rate,
            data: this.state.data.poly1[0][0],
            play: (index, event) => {
                let duration = event[2];
                if (typeof duration === "string") {
                    duration = this.poly1.getNoteDuration(duration);
                }
                this.minion.GatePulse(2, duration);
                this.poly1.play(event[0], event[1], event[2]);
            }
        });
        this.addSequencer(this.poly1);

        ////////////////////////////////////////////////////////////////
        this.perc1 = new Sequencer({
            instrument: MidiInstrument.instruments[this.state.perc1.instrument],
            rate: this.state.perc1.rate,
            data: this.state.data.perc1[0][0],
            play: (index, event) => {
                this.minion.CVOutput(2,event[3]);
                this.perc1.play(event[0], event[1], event[2]);
            },
            end: () => {
                this.setStage(this.state.stageIndex+1);
            }
        });
        this.addSequencer(this.perc1);

        ////////////////////////////////////////////////////////////////


        this.perc2 = new Sequencer({
            instrument: MidiInstrument.instruments[this.state.perc1.instrument],
            rate: this.state.perc2.rate,
            data: this.state.data.perc2[0][0],
            play: (index, event) => {
                this.rainmakerTrigger();
                this.perc2.play(event[0], event[1], event[2]);
            },
        });
        this.addSequencer(this.perc2);

        this.perc3 = new Sequencer({
            instrument: MidiInstrument.instruments[this.state.perc3.instrument],
            rate: this.state.perc3.rate,
            data: this.state.data.perc2[0][0],
            play: (index, event) => {
                this.perc2.play(event[0], event[1], event[2]);
            },
        });
        this.addSequencer(this.perc3);

        this.perc4 = new Sequencer({
            instrument: MidiInstrument.instruments[this.state.perc4.instrument],
            rate: this.state.perc4.rate,
            data: this.state.data.perc2[0][0],
            play: (index, event) => {
                this.perc2.play(event[0], event[1], event[2]);
            },
        });
        this.addSequencer(this.perc4);

        // init rainmaker states
        this.ticksSinceRainmaker = 0;
        this.rainmakerFreezeCount = 0;
        this.rainmakerCV = 0.0;
        this.rainmakerCVPeak = 0.5;
        this.rainmakerCVTickCount = 24;
        this.rainmakerCVDelayTicks = 6;
        this.rainmakerCVDirection = 1; // up

        // init random gate states
        this.randomGateLength = 0; // 4, 8, 16
        this.randomGateTicks = 0;
        this.randomGateState = 0;

    }

    morphageneTrigger(duration) {
        if (!this.morphageneState) {
            let pulseInterval = Math.round(duration * 0.75);
            let pulseLength = Math.round(duration / 8);
            this.morphageneState = 1;
            this.minion.GatePulse(2, pulseLength); // start recording
            setTimeout(() => {
                this.minion.GatePulse(2, pulseLength); // stop recording
            }, pulseInterval);
            setTimeout(() => {
                this.morphageneState = 0;
            }, pulseInterval + pulseLength*2);
        }
    }

    rainmakerTrigger() {
        this.ticksSinceRainmaker = 0;

        this.rainmakerCVPeak = (Math.random() * 0.1) + 0.2;
        this.rainmakerCVDelayTicks = SequenceData.getRandomEven(4, 8);
        this.rainmakerCVTickCount = SequenceData.getRandomEven(
            Math.min(this.state.rainmakerCVTickCountMin,this.state.rainmakerCVTickCountMax),
            Math.max(this.state.rainmakerCVTickCountMin,this.state.rainmakerCVTickCountMax));
        this.rainmakerCVDirection = Math.random() > 0.5 ? 1 : 0;
    }

    rainmakerClock() {
        if (this.ticksSinceRainmaker <= this.rainmakerCVDelayTicks+this.rainmakerCVTickCount) {
            if (this.ticksSinceRainmaker === this.rainmakerCVDelayTicks) {
                this.minion.GateOutput(3, 1);
                if (this.rainmakerCVDirection > 0) { // up
                    this.rainmakerCV = 0.0;
                } else {
                    this.rainmakerCV = this.rainmakerCVPeak;
                }
            } else if (this.ticksSinceRainmaker < this.rainmakerCVDelayTicks+this.rainmakerCVTickCount) {
                let deltaCV = this.rainmakerCVPeak / this.rainmakerCVTickCount;
                if (this.rainmakerCVDirection > 0) { // up
                    this.rainmakerCV = this.rainmakerCV + deltaCV;
                } else {
                    this.rainmakerCV = this.rainmakerCV - deltaCV;
                }
            } else if (this.ticksSinceRainmaker === this.rainmakerCVDelayTicks+this.rainmakerCVTickCount) {
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
        this.ticksSinceRainmaker = this.ticksSinceRainmaker+1;
    }

    randomGateClock() {
        const ppq = 24; // TODO add to default state?

        this.randomGateTicks = this.randomGateTicks+1;
        if (this.randomGateTicks >= this.randomGateLength) {
            this.randomGateState = this.randomGateState > 0 ? 0 : 1; // invert
            this.minion.GateOutput(1, this.randomGateState);

            let r = Math.round(Math.random() * 2);
            let p = [4, 8, 16];
            let n = p[r];

            this.randomGateLength = ppq / (n / 4);
            this.randomGateTicks = 0;
        }

    }

    /***
     *
     */
    start() {

    }

    /***
     *
     */
    stop() {
        this.setStage(0);
        this.randomGateTicks = 0;
        this.rainmakerFreezeCount = 0;
        this.minion.GateOutput(3, 0);
    }

    /***
     *
     */
    postClock() {
        //this.randomGateClock();
        this.rainmakerClock();
    }

    /***
     *
     * @param index
     */
    setStage(index) {
        this.state.stageIndex = index;
        let stage = index % this.state.stageCount;
        let iteration = Math.floor(index / this.state.stageCount);

        this.setSequencerStage("mono1", stage, iteration);
        this.setSequencerStage("mono2", stage, iteration);
        this.setSequencerStage("poly1", stage, iteration);
        this.setSequencerStage("perc1", stage, iteration);
        this.setSequencerStage("perc2", stage, iteration);
        this.setSequencerStage("perc3", stage, iteration);
        this.setSequencerStage("perc4", stage, iteration);

        if (stage === 0) {
            this.minion.GatePulse(0, this.perc1.getNoteDuration("8n"));
            this.iteration(iteration);
        }

        this.updateTitle();

    }

    /***
     *
     * @param seqName
     * @param stage
     * @param iteration
     */
    setSequencerStage(seqName, stage, iteration) {
        let stageData = this.state.data[seqName][stage];
        if (stageData) {
            this[seqName].data = stageData[iteration % stageData.length];
        } else {
            Log.warning(`setSequencerStage: stageData missing for ${seqName} @ ${iteration}.${stage}`);
        }
        this[seqName].reset();
    }

    /***
     *
     * @param count
     */
    iteration(count) {

        if (this.state.enableEvolve) {
            if (count % 2 === 0) {
                this.state.data.perc1 = this.evolveSequenceStages(this.state.data.perc1, this.state.evolveAmount, this.getRandomPerc1DrumData.bind(this));
            } else if (count % 4 === 0) {
                this.state.data.perc2 = this.evolveSequenceStages(this.state.data.perc2, this.state.evolveAmount, this.getRandomPerc2DrumData.bind(this));
            } else if (count % 3 === 0) {
                this.state.data.mono1 = this.evolveSequenceStages(this.state.data.mono1, this.state.evolveAmount, this.getRandomMono1Data.bind(this));
            } else if (count % 5 === 0) {
                this.state.data.mono2 = this.evolveSequenceStages(this.state.data.mono2, this.state.evolveAmount, this.getRandomMono2Data.bind(this));
            } else if (count % 4 === 0) {
                this.state.data.poly1 = this.evolveSequenceStages(this.state.data.poly1, this.state.evolveAmount, this.getRandomPoly1Data.bind(this));
            }
        }

    }

    /***
     *
     * @returns {{mono1: Array, mono2: Array, poly1: Array, perc1: Array, perc2: Array, perc3: Array, perc4: Array}}
     */
    getRandomStageData() {

        // Each

        this.state.noteSet = SequenceData.generateNoteSet(36, 60, this.state.noteSetSize);

        return {
            mono1: this.generateStages(this.getRandomMono1Data.bind(this), this.state.mono1),
            mono2: this.generateStages(this.getRandomMono2Data.bind(this), this.state.mono2),
            poly1: this.generateStages(this.getRandomPoly1Data.bind(this), this.state.poly1),
            perc1: this.generateStages(this.getRandomPerc1DrumData.bind(this), this.state.perc1),
            perc2: this.generateStages(this.getRandomPerc2DrumData.bind(this), this.state.perc2),
            perc3: this.generateStages(this.getRandomPerc3DrumData.bind(this), this.state.perc3),
            perc4: this.generateStages(this.getRandomPerc4DrumData.bind(this), this.state.perc4)
        }
    }

    generateRandomNoteFromSet() {
        let i = Math.round(Math.random() * (this.state.noteSet.length-1));
        return [
            this.state.noteSet[i], // note
            Math.round(Math.random()*127), // velocity
            "8n", // duration
            Math.random() // cv
        ]
    }

    /***
     *
     * @param fn
     * @param seq
     * @returns {Array}
     */
    generateStages(fn, seq) {
        let stages = [];
        for (let i = 0; i < this.state.stageCount; i++) {
            let stage = [];
            if (seq.stages[i] > 0) {
                for (let j = 0; j < seq.stages[i]; j++) {
                    stage.push(fn());
                }
            } else {
                stage.push([]);
            }
            stages.push(stage);
        }
        return stages;
    }

    /***
     *
     * @param stages
     * @param prob
     * @param generatorFn
     * @returns {Array|*}
     */
    evolveSequenceStages(stages, prob, generatorFn) {
        return stages.map((stage) => stage.map((data) => {
            if (Math.random() < prob) {
                return data;
            } else {
                return SequenceData.evolveSequence(data, generatorFn(), prob);
            }
        }));
    }

    ////////////////////////////////////////////////////////////////
    getRandomMono1Data() {
        return SequenceData.getSequence(() => {
                /*let nextNote = SequenceData.getRandomNote(
                    this.state.mono1.low,
                    this.state.mono1.high,
                    Math.random() > 0.25 ? "8n" : "4n");
                nextNote[1] = Math.round(Math.random()*127); // random velocity
                return nextNote;*/
                return this.generateRandomNoteFromSet();
            },
            this.state.mono1);
    }

    ////////////////////////////////////////////////////////////////
    getRandomMono2Data() {
        return SequenceData.getSequence(() => {
 /*               let nextNote = SequenceData.getRandomNote(
                    this.state.mono2.low,
                    this.state.mono2.high,
                    Math.random() > 0.25 ? "8n" : "4n");
                nextNote[1] = Math.round(Math.random()*127); // random velocity
                return nextNote;*/
                return this.generateRandomNoteFromSet()
            },
            this.state.mono2);
    }

    ////////////////////////////////////////////////////////////////
    getRandomPoly1Data() {
        return SequenceData.getSequence(() => {
/*            return SequenceData.getRandomNote(
                this.state.poly1.low,
                this.state.poly1.high,
                "4n");*/
                return this.generateRandomNoteFromSet();
            },
            this.state.poly1);
    }

    ////////////////////////////////////////////////////////////////
    getRandomPerc1DrumData() {
        let makeKick = () => [MidiInstrument.drumMap[0], 127, "16n", Math.random()];
        let data = SequenceData.getSequence(makeKick, this.state.perc1);
        data[0] = makeKick();
        data[0][3] = 1.0;
        return data;
    }

    ////////////////////////////////////////////////////////////////
    getRandomPerc2DrumData() {
        let makeSnare = () => [MidiInstrument.drumMap[1], 127, "16n", Math.random()];
        return SequenceData.getSequence(makeSnare, this.state.perc2);
    }

    ////////////////////////////////////////////////////////////////
    getRandomPerc3DrumData() {
        let makeSnare = () => [MidiInstrument.drumMap[2], 127, "16n", Math.random()];
        return SequenceData.getSequence(makeSnare, this.state.perc3);
    }

    ////////////////////////////////////////////////////////////////
    getRandomPerc4DrumData() {
        let makeSnare = () => [MidiInstrument.drumMap[3], 127, "16n", Math.random()];
        return SequenceData.getSequence(makeSnare, this.state.perc4);
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
        this.mono1.chord = Object.assign({}, this.state.chord);
        this.mono2.chord = Object.assign({}, this.state.chord);
        this.poly1.chord = Object.assign({ third: true }, this.state.chord);
        Log.music(`Set Scale: ${scale.root} '${scale.mode}'`);
    }

}
module.exports = PerformanceArrangement;