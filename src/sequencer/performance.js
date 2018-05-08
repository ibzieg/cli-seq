/******************************************************************************
 * Copyright 2018 Ian Bertram Zieg
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

const fs = require("fs");
const Log = require("../display/log-util");

const Store = require("./store");
const Track = require("./track");

class Performance {



    get state() {
        return Store.instance.performance;
    }


    constructor() {
        this.tracks = [];
        for (let i = 0; i < Store.TRACK_COUNT; i++) {
            this.tracks[i] = new Track({
                index: i
            });
        }
    }

    select(index) {
        // TODO Set selected Performance Index
        Store.instance.setProperty("selectedPerformance", index);
        this.updateDisplay();
    }

    clock(bpm) {
        for (let i = 0; i < Store.TRACK_COUNT; i++) {
            this.tracks[i].clock(bpm);
        }
    }

    postClock() {
        for (let i = 0; i < Store.TRACK_COUNT; i++) {
            this.tracks[i].postClock();
        }
    }

    start() {
        for (let i = 0; i < Store.TRACK_COUNT; i++) {
            this.tracks[i].start();
        }
    }

    stop() {
        for (let i = 0; i < Store.TRACK_COUNT; i++) {
            this.tracks[i].stop();
        }
    }

    createControllerMap() {
        return {
            noteOn: {
                Pad9: {
                    label: "Enabled",
                    callback: (velocity) => {
                        /*                  Log.success(`Randomized stage data`);
                        this.state.data = this.getRandomStageData();*/
                        return "Randomize";
                    }
                },
                Pad10: {
                    label: "Arp Loop",
                    callback: (velocity) => {
                        /* this.setScale(this.getRandomScale());*/
                        return "Randomize";
                    }
                },
                Pad11: {
                    label: "Step Prob",
                    callback: (velocity) => {
                        /*   this.state.data.mono1 = this.evolveSequenceStages(this.state.data.mono1, this.state.evolveAmount, this.getRandomMono1Data.bind(this));
                     */   return "Evolve";
                    }
                },
                Pad12: {
                    label: "Rnd Graph",
                    callback: (velocity) => {
                        /* this.state.data.mono2 = this.evolveSequenceStages(this.state.data.mono2, this.state.evolveAmount, this.getRandomMono2Data.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad13: {
                    label: "Rnd Track",
                    callback: (velocity) => {
                        /* this.state.data.poly1 = this.evolveSequenceStages(this.state.data.poly1, this.state.evolveAmount, this.getRandomPoly1Data.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad14: {
                    label: "Rnd All",
                    callback: (velocity) => {
                        /* this.state.data.perc1 = this.evolveSequenceStages(this.state.data.perc1, this.state.evolveAmount, this.getRandomPerc1DrumData.bind(this));
                      */  return "Evolve";
                    }
                },
                Pad15: {
                    label: "",
                    callback: (velocity) => {
                        /* this.state.data.perc2 = this.evolveSequenceStages(this.state.data.perc2, this.state.evolveAmount, this.getRandomPerc2DrumData.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad16: {
                    label: "",
                    callback: (velocity) => {
                        /* this.state.data.perc3 = this.evolveSequenceStages(this.state.data.perc3, this.state.evolveAmount, this.getRandomPerc3DrumData.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad1: {
                    label: "Scene 1",
                    callback: (velocity) => {
                        /* this.state.data.perc4 = this.evolveSequenceStages(this.state.data.perc4, this.state.evolveAmount, this.getRandomPerc4DrumData.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad2: {
                    label: "Scene 2",
                    callback: (velocity) => {
                        /*           this.state.enableEvolve = !this.state.enableEvolve;
                        return this.state.enableEvolve ? "ON" : "OFF";*/
                        return "Scene 2";
                    }
                },
                Pad3: {
                    label: "Scene 3",
                    callback: (velocity) => {
                        /* this.state.data.perc4 = this.evolveSequenceStages(this.state.data.perc4, this.state.evolveAmount, this.getRandomPerc4DrumData.bind(this));
                         */ return "Scene 3";
                    }
                },
                Pad4: {
                    label: "Scene 4",
                    callback: (velocity) => {
                        /*           this.state.enableEvolve = !this.state.enableEvolve;
                         return this.state.enableEvolve ? "ON" : "OFF";*/
                        return "Scene 4";
                    }
                },
                Pad5: {
                    label: "Scene 5",
                    callback: (velocity) => {
                        /*           this.state.enableEvolve = !this.state.enableEvolve;
                         return this.state.enableEvolve ? "ON" : "OFF";*/
                        return "Scene 5";
                    }
                },
                Pad6: {
                    label: "Scene 6",
                    callback: (velocity) => {
                        /*           this.state.enableEvolve = !this.state.enableEvolve;
                         return this.state.enableEvolve ? "ON" : "OFF";*/
                        return "Scene 6";
                    }
                },
                Pad7: {
                    label: "Scene 7",
                    callback: (velocity) => {
                        /*           this.state.enableEvolve = !this.state.enableEvolve;
                         return this.state.enableEvolve ? "ON" : "OFF";*/
                        return "Scene 7";
                    }
                },
                Pad8: {
                    label: "Scene 8",
                    callback: (velocity) => {
                        /*           this.state.enableEvolve = !this.state.enableEvolve;
                         return this.state.enableEvolve ? "ON" : "OFF";*/
                        return "Scene 8";
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
                        /*              let seq = this[this.getSeqName(this.state.selectedDeviceIndex)];
                        if (seq) {
                            seq.rate = rate;
                        }*/
                        return rate;
                    }
                },

                Knob2: {
                    label: "Octave",
                    callback: (data) => {
                        let note = data;
                        // this.state[this.getSeqName(this.state.selectedDeviceIndex)].low = note;
                        return note;
                    }
                },


                Knob3: {
                    label: "Length",
                    callback: (data) => {
                        let note = data;
                        // this.state[this.getSeqName(this.state.selectedDeviceIndex)].high = note;
                        return note;
                    }
                },


                Knob4: {
                    label: "Steps",
                    callback: (data) => {
                        let d = data / 128;
                        //this.state[this.getSeqName(this.state.selectedDeviceIndex)].density = d;
                        return Math.round(d*100)+"%";
                    }
                },


                Knob5: {
                    label: "Pattern",
                    callback: (data) => {
                        let m = data;
                        //this.state[this.getSeqName(this.state.selectedDeviceIndex)].min = m;
                        return m;
                    }
                },


                Knob6: {
                    label: "Graph",
                    callback: (data) => {
                        let m = data;
                        //this.state[this.getSeqName(this.state.selectedDeviceIndex)].max = m;
                        return m;
                    }
                },


                Knob7: {
                    label: "Arp",
                    callback: (data) => {
                        let i = data % 8;
                        let s = [];
                        s[0] = (i & 0b001) > 0 ? 2 : 1;
                        s[1] = (i & 0b010) > 0 ? 2 : 1;
                        s[2] = (i & 0b100) > 0 ? 2 : 1;
                        //this.state[this.getSeqName(this.state.selectedDeviceIndex)].stages = s;
                        return s.toString();
                    }
                },


                Knob8: {
                    label: "ArpRate",
                    callback: (data) => {
                        let algos = ["euclid", "perc","quarterbeat","halfbeat", "ryk", "random"];
                        let i = data % algos.length;
                        let algo = algos[i];
                        //this.state[this.getSeqName(this.state.selectedDeviceIndex)].algorithm = algo;
                        return algo;
                    }
                },

                Knob9: {
                    label: "Root",
                    callback: (data) => {
                        /*                 let chord = Object.assign(this.state.chord, {
                            root: ChordHarmonizer.NoteNames[data % ChordHarmonizer.NoteNames.length]
                        });
                        this.setScale(chord);
                        return chord.root;*/
                        return "N";
                    }
                },
                Knob10: {
                    label: "Mode",
                    callback: (data) => {
/*                        let chord = Object.assign(this.state.chord, {
                            mode: ChordHarmonizer.ModeNames[data % ChordHarmonizer.ModeNames.length]
                        });
                        this.setScale(chord);
                        return chord.mode;*/
                        return "M";
                    }
                },
                Knob11: {
                    label: "LowNote",
                    callback: (data) => {
                        /*                       let pct = data / 127.0;
                        this.state.evolveAmount = pct;
                        return Math.round(100*this.state.evolveAmount)+'%';*/
                        return 1;
                    }
                },
                Knob12: {
                    label: "HighNote",
                    callback: (data) => {
                        // let pct = data / 127.0;
                        // this.state.rainmakerCVTickCountMin = Math.floor(pct * 128);
                        // return this.state.rainmakerCVTickCountMin;
                        return 1;
                    }
                },
                Knob13: {
                    label: "Master",
                    callback: (data) => {
                        // let pct = data / 127.0;
                        // this.state.rainmakerCVTickCountMax = Math.floor(pct * 128);
                        // return this.state.rainmakerCVTickCountMax;
                        return 1;
                    }
                },
                Knob14: {
                    label: "SetSize",
                    callback: (data) => {
                        // this.state.selectedDeviceIndex = data % 8;
                        // this.updateDeviceState();
                        // this.updateControllerState();
                        //return `${this.state.selectedDeviceIndex}:${this.deviceState[this.state.selectedDeviceIndex].name}`;
                        return 1;
                    }
                },
                Knob15: {
                    label: "",
                    callback: (data) => {
                        // this.state.selectedDeviceIndex = data % 8;
                        // this.updateDeviceState();
                        // this.updateControllerState();
                        //return `${this.state.selectedDeviceIndex}:${this.deviceState[this.state.selectedDeviceIndex].name}`;
                        return 1;
                    }
                },
                Knob16: {
                    label: "Track",
                    callback: (data) => {
                        // this.state.selectedDeviceIndex = data % 8;
                        // this.updateDeviceState();
                        // this.updateControllerState();
                        //return `${this.state.selectedDeviceIndex}:${this.deviceState[this.state.selectedDeviceIndex].name}`;
                        return 1;
                    }
                }
            }
        }
    }

    updateControllerPad(d1, d2) {
        process.send({
            type: "controller",
            status: 144,
            d1: d1,
            d2: d2
        });
    }

    updateControllerKnob(d1, d2) {
        process.send({
            type: "controller",
            status: 176,
            d1: d1,
            d2: d2
        });
    }

    updateTitle() {
        process.send({
            type: "arrangement",
            title: `{blue-fg}[${Store.instance.state.selectedPerformance}:{/} ${this.state.name}{blue-fg}]{/}`
        });
    }

    updateDeviceState() {
        // TODO should be called TrackState ?
        let tracks = this.state.scenes[this.state.selectedScene].tracks;

        process.send({
            type: "deviceState",
            deviceState: [
                { name: tracks[0].name, enabled: tracks[0].enabled, selected: this.state.selectedTrack === 0 },
                { name: tracks[1].name, enabled: tracks[1].enabled, selected: this.state.selectedTrack === 1 },
                { name: tracks[2].name, enabled: tracks[2].enabled, selected: this.state.selectedTrack === 2 },
                { name: tracks[3].name, enabled: tracks[3].enabled, selected: this.state.selectedTrack === 3 },
                { name: tracks[4].name, enabled: tracks[4].enabled, selected: this.state.selectedTrack === 4 },
                { name: tracks[5].name, enabled: tracks[5].enabled, selected: this.state.selectedTrack === 5 },
                { name: tracks[6].name, enabled: tracks[6].enabled, selected: this.state.selectedTrack === 6 },
                { name: tracks[7].name, enabled: tracks[7].enabled, selected: this.state.selectedTrack === 7 },
            ]

        });
    }

    updateAllKnobs() {
        /*
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
        */

    }

    updateDisplay() {
        this.updateTitle();
        this.updateAllKnobs();
        this.updateDeviceState();
    }

}

module.exports = Performance;