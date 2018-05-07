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
                Pad1: {
                    label: "Rnd Seq",
                    callback: (velocity) => {
                        /*                  Log.success(`Randomized stage data`);
                        this.state.data = this.getRandomStageData();*/
                        return "Randomize";
                    }
                },
                Pad2: {
                    label: "Rnd Scale",
                    callback: (velocity) => {
                        /* this.setScale(this.getRandomScale());*/
                        return "Randomize";
                    }
                },
                Pad9: {
                    label: "Evo mono1",
                    callback: (velocity) => {
                        /*   this.state.data.mono1 = this.evolveSequenceStages(this.state.data.mono1, this.state.evolveAmount, this.getRandomMono1Data.bind(this));
                     */   return "Evolve";
                    }
                },
                Pad10: {
                    label: "Evo mono2",
                    callback: (velocity) => {
                        /* this.state.data.mono2 = this.evolveSequenceStages(this.state.data.mono2, this.state.evolveAmount, this.getRandomMono2Data.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad11: {
                    label: "Evo poly1",
                    callback: (velocity) => {
                        /* this.state.data.poly1 = this.evolveSequenceStages(this.state.data.poly1, this.state.evolveAmount, this.getRandomPoly1Data.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad12: {
                    label: "Evo perc1",
                    callback: (velocity) => {
                        /* this.state.data.perc1 = this.evolveSequenceStages(this.state.data.perc1, this.state.evolveAmount, this.getRandomPerc1DrumData.bind(this));
                      */  return "Evolve";
                    }
                },
                Pad13: {
                    label: "Evo perc2",
                    callback: (velocity) => {
                        /* this.state.data.perc2 = this.evolveSequenceStages(this.state.data.perc2, this.state.evolveAmount, this.getRandomPerc2DrumData.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad14: {
                    label: "Evo perc3",
                    callback: (velocity) => {
                        /* this.state.data.perc3 = this.evolveSequenceStages(this.state.data.perc3, this.state.evolveAmount, this.getRandomPerc3DrumData.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad15: {
                    label: "Evo perc4",
                    callback: (velocity) => {
                        /* this.state.data.perc4 = this.evolveSequenceStages(this.state.data.perc4, this.state.evolveAmount, this.getRandomPerc4DrumData.bind(this));
                       */ return "Evolve";
                    }
                },
                Pad16: {
                    label: "EnableEvo",
                    callback: (velocity) => {
                        /*           this.state.enableEvolve = !this.state.enableEvolve;
                        return this.state.enableEvolve ? "ON" : "OFF";*/
                        return "OFF";
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
                    label: "LowNote",
                    callback: (data) => {
                        let note = data;
                        // this.state[this.getSeqName(this.state.selectedDeviceIndex)].low = note;
                        return note;
                    }
                },


                Knob3: {
                    label: "HighNote",
                    callback: (data) => {
                        let note = data;
                        // this.state[this.getSeqName(this.state.selectedDeviceIndex)].high = note;
                        return note;
                    }
                },


                Knob4: {
                    label: "Density",
                    callback: (data) => {
                        let d = data / 128;
                        //this.state[this.getSeqName(this.state.selectedDeviceIndex)].density = d;
                        return Math.round(d*100)+"%";
                    }
                },


                Knob5: {
                    label: "MinLength",
                    callback: (data) => {
                        let m = data;
                        //this.state[this.getSeqName(this.state.selectedDeviceIndex)].min = m;
                        return m;
                    }
                },


                Knob6: {
                    label: "MaxLength",
                    callback: (data) => {
                        let m = data;
                        //this.state[this.getSeqName(this.state.selectedDeviceIndex)].max = m;
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
                        //this.state[this.getSeqName(this.state.selectedDeviceIndex)].stages = s;
                        return s.toString();
                    }
                },


                Knob8: {
                    label: "Algorithm",
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
                    label: "Evo Amt",
                    callback: (data) => {
                        /*                       let pct = data / 127.0;
                        this.state.evolveAmount = pct;
                        return Math.round(100*this.state.evolveAmount)+'%';*/
                        return 1;
                    }
                },
                Knob12: {
                    label: "RMTicMin",
                    callback: (data) => {
                        // let pct = data / 127.0;
                        // this.state.rainmakerCVTickCountMin = Math.floor(pct * 128);
                        // return this.state.rainmakerCVTickCountMin;
                        return 1;
                    }
                },
                Knob13: {
                    label: "RMTicMax",
                    callback: (data) => {
                        // let pct = data / 127.0;
                        // this.state.rainmakerCVTickCountMax = Math.floor(pct * 128);
                        // return this.state.rainmakerCVTickCountMax;
                        return 1;
                    }
                },
                Knob16: {
                    label: "Device",
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

}

module.exports = Performance;