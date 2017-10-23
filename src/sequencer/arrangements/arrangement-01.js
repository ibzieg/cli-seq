const Arrangement = require("../arrangement");
const SequenceData = require("../sequence-data");
const Sequencer = require("../sequencer");
const ChordHarmonizer = require("../chord-harmonizer");
const Log = require("../../display/log-util");

const EuropiMinion = require("../../europi/europi-minion");
const MidiInstrument = require("../../midi/midi-instrument");

class Arrangement01 extends Arrangement {

    get title() {
        return "3 stages quantized";
    }

    get defaultState() {
        return {
            stageCount: 3,
            stageIndex: 0,
            enableEvolve: false,
            chord: this.getRandomScale(),
            data: this.getRandomStageData(),
            rainmakerCVTickCountMin: 12,
            rainmakerCVTickCountMax: 36,
            evolveAmount: 0.5
        };
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
                        this.state.data.mono1 = this.evolveSequenceStages(this.state.data.mono1, 0.5, this.getRandomMono1Data.bind(this));
                        return "Evolve";
                    }
                },
                Pad10: {
                    label: "Evo mono2",
                    callback: (velocity) => {
                        this.state.data.mono2 = this.evolveSequenceStages(this.state.data.mono2, 0.5, this.getRandomMono2Data.bind(this));
                        return "Evolve";
                    }
                },
                Pad11: {
                    label: "Evo poly1",
                    callback: (velocity) => {
                        this.state.data.poly1 = this.evolveSequenceStages(this.state.data.poly1, 0.5, this.getRandomPoly1Data.bind(this));
                        return "Evolve";
                    }
                },
                Pad12: {
                    label: "Evo kick",
                    callback: (velocity) => {
                        this.state.data.kickDrum = this.evolveSequenceStages(this.state.data.kickDrum, 0.5, this.getRandomKickDrumData.bind(this));
                        return "Evolve";
                    }
                },
                Pad13: {
                    label: "Evo snare",
                    callback: (velocity) => {
                        this.state.data.snareDrum = this.evolveSequenceStages(this.state.data.snareDrum, 0.5, this.getRandomSnareDrumData.bind(this));
                        return "Evolve";
                    }
                },
                Pad14: {

                },
                Pad15: {

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
                        let value = data/127.0;
                        this.minion.CVOutput(2, value);
                        return value;
                    }
                },
                Knob4: {
                    label: "CV D",
                    callback: (data) => {
                        let value = data/127.0;
                        this.minion.CVOutput(4, value);
                        return value;
                    }
                },
                Knob6: {
                    label: "Evo Amt",
                    callback: (data) => {
                        let pct = data / 127.0;
                        this.state.evolveAmount = pct;
                        return this.state.evolveAmount;
                    }
                },
                Knob7: {
                    label: "RMTicMin",
                    callback: (data) => {
                        let pct = data / 127.0;
                        this.state.rainmakerCVTickCountMin = Math.floor(pct * 128);
                        return this.state.rainmakerCVTickCountMin;
                    }
                },
                Knob8: {
                    label: "RMTicMax",
                    callback: (data) => {
                        let pct = data / 127.0;
                        this.state.rainmakerCVTickCountMax = Math.floor(pct * 128);
                        return this.state.rainmakerCVTickCountMax;
                    }
                }
            }
        }
    }

    initialize() {


        ////////////////////////////////////////////////////////////////
        this.mono1 = new Sequencer({
            instrument: MidiInstrument.instruments.BSPSeq1,
            chord: this.state.chord,
            rate: 2,
            data: this.state.data.mono1[0][0],
            play: (index, event) => {
                this.minion.CVOutput(0,index / this.mono1.data.length);
                this.mono1.play(event[0], event[1], event[2]);
            },
            end: () => {
            }
        });
        this.addSequencer(this.mono1);

        ////////////////////////////////////////////////////////////////
        this.mono2 = new Sequencer({
            instrument: MidiInstrument.instruments.BSPSeq2,
            chord: this.state.chord,
            rate: 2,
            data: this.state.data.mono2[0][0],
            play: (index, event) => {
                this.minion.CVOutput(1, 1.0 - (index / this.mono2.data.length));
                this.mono2.play(event[0], event[1], event[2]);
            },
            end: () => {
            }
        });
        this.addSequencer(this.mono2);

        ////////////////////////////////////////////////////////////////
        this.poly1 = new Sequencer({
            instrument: MidiInstrument.instruments.NordG2A,
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
        this.rainmakerFreezeCount = 0;

        this.rainmakerCV = 0.0;
        this.rainmakerCVPeak = 0.5;
        this.rainmakerCVTickCount = 24;
        this.rainmakerCVDelayTicks = 6;
        this.rainmakerCVDirection = 1; // up

        this.snareDrum = new Sequencer({
            instrument: MidiInstrument.instruments.BSPDrum,
            rate: 4,
            data: this.state.data.snareDrum[0][0],
            play: (index, event) => {
                this.ticksSinceSnare = 0;

                this.rainmakerCVPeak = (Math.random() * 0.1) + 0.2;
                this.rainmakerCVDelayTicks = SequenceData.getRandomEven(4, 8);
                this.rainmakerCVTickCount = SequenceData.getRandomEven(
                    Math.min(this.state.rainmakerCVTickCountMin,this.state.rainmakerCVTickCountMax),
                    Math.max(this.state.rainmakerCVTickCountMin,this.state.rainmakerCVTickCountMax));
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

        this.rainmakerFreezeCount = 0;
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

        this.setSequencerStage("mono1", stage, iteration);
        this.setSequencerStage("mono2", stage, iteration);
        this.setSequencerStage("poly1", stage, iteration);
        this.setSequencerStage("snareDrum", stage, iteration);
        this.setSequencerStage("kickDrum", stage, iteration);

        if (stage === 0) {
            this.iteration(iteration);
        }

        //Log.debug(`setStage index=${index} stage=${stage} iter=${iteration}`);
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

        if (this.state.enableEvolve) {
            if (count % 2 === 0) {
                this.state.data.kickDrum = this.evolveSequenceStages(this.state.data.kickDrum, this.state.evolveAmount, this.getRandomKickDrumData.bind(this));
            } else if (count % 4 === 0) {
                this.state.data.snareDrum = this.evolveSequenceStages(this.state.data.snareDrum, this.state.evolveAmount, this.getRandomSnareDrumData.bind(this));
            } else if (count % 3 === 0) {
                this.state.data.mono1 = this.evolveSequenceStages(this.state.data.mono1, this.state.evolveAmount, this.getRandomMono1Data.bind(this));
            } else if (count % 5 === 0) {
                this.state.data.mono2 = this.evolveSequenceStages(this.state.data.mono2, this.state.evolveAmount, this.getRandomMono2Data.bind(this));
            } else if (count % 4 === 0) {
                this.state.data.poly1 = this.evolveSequenceStages(this.state.data.poly1, this.state.evolveAmount, this.getRandomPoly1Data.bind(this));
            }
        }

    }

    getRandomStageData() {
        return {
            mono1: [
                [this.getRandomMono1Data()],
                [this.getRandomMono1Data(), this.getRandomMono1Data() ],
                [this.getRandomMono1Data()],
            ],
            mono2: [
                [this.getRandomMono2Data()],
                [this.getRandomMono2Data()],
                [this.getRandomMono2Data(), this.getRandomMono2Data()]
            ],
            poly1: [
                [this.getRandomPoly1Data(), this.getRandomPoly1Data()],
                [this.getRandomPoly1Data()],
                [this.getRandomPoly1Data()],
            ],
            snareDrum: [
                [this.getRandomSnareDrumData(), this.getRandomSnareDrumData()],
                [this.getRandomSnareDrumData()],
                [this.getRandomSnareDrumData()]
            ],
            kickDrum: [
                [this.getRandomKickDrumData()],
                [this.getRandomKickDrumData(), this.getRandomKickDrumData()],
                [this.getRandomKickDrumData()]
            ]
        }
    }

    ////////////////////////////////////////////////////////////////
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
        return SequenceData.getRandomSequence(() => SequenceData.getRandomNote(24, 60, Math.random() > 0.25 ? "8n" : "4n"), 8, 16, 0.5);
    }

    ////////////////////////////////////////////////////////////////
    getRandomMono2Data() {
        return SequenceData.getRandomSequence(() => SequenceData.getRandomNote(24, 60, Math.random() > 0.25 ? "16n" : "8n"), 16, 24, 0.5);
    }

    ////////////////////////////////////////////////////////////////
    getRandomPoly1Data() {
        return SequenceData.getRandomSequence(() => SequenceData.getRandomNote(36, 72, "4n"), 16, 16, 0.4);
    }

    ////////////////////////////////////////////////////////////////
    getRandomKickDrumData() {
        let makeKick = () => [MidiInstrument.drumMap[0], 127, "8n", Math.random()];
        let data = SequenceData.getRandomSequence(makeKick, 32, 32, 0.4);
        data[0] = makeKick();
        data[0][3] = 1.0;
        return data;
    }

    ////////////////////////////////////////////////////////////////
    getRandomSnareDrumData() {
        //return SequenceData.getRandomSequence(() => [MidiInstrument.drumMap[1], 127, 100], 2, 8, 0.4);

        let makeSnare = () => [MidiInstrument.drumMap[1], 127, "16n", Math.random()];

        let min = 12;
        let max = 16;

        min = Math.floor(min/2)*2; // force even
        max = Math.floor(max/2)*2; // force even
        let length = Math.floor(min+Math.random()*(max-min+1));

        let density = [0.4, 0.3, 0.2, 0.1];
        let half = Math.floor(length/2.0);
        let fourth = Math.floor(length/4.0);
        let eighth = Math.floor(length/8.0);
        let sixteenth = Math.floor(length/16.0);

        let seq = [];
        for (let i = 0; i < length; i++) {

            if (i !== 0 && (
                    (i % half === 0 && density[0] > Math.random()) ||
                    (i % fourth === 0 && density[1] > Math.random()) ||
                    (i % eighth === 0 && density[2] > Math.random()) ||
                    (i % sixteenth === 0 && density[3] > Math.random())
                )) {
                seq.push(makeSnare());
            } else {
                seq.push(null);
            }
        }
        return seq;

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
module.exports = Arrangement01;