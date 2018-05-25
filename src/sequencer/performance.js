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

const MidiController = require("../midi/midi-controller");

const ChordHarmonizer = require("./chord-harmonizer");
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
                        this.selectScene(0);
                        return "Scene 1";
                    }
                },
                Pad2: {
                    label: "Scene 2",
                    callback: (velocity) => {
                        this.selectScene(1);
                        return "Scene 2";
                    }
                },
                Pad3: {
                    label: "Scene 3",
                    callback: (velocity) => {
                        this.selectScene(2);
                        return "Scene 3";
                    }
                },
                Pad4: {
                    label: "Scene 4",
                    callback: (velocity) => {
                        this.selectScene(3);
                        return "Scene 4";
                    }
                },
                Pad5: {
                    label: "Scene 5",
                    callback: (velocity) => {
                        this.selectScene(4);
                        return "Scene 5";
                    }
                },
                Pad6: {
                    label: "Scene 6",
                    callback: (velocity) => {
                        this.selectScene(5);
                        return "Scene 6";
                    }
                },
                Pad7: {
                    label: "Scene 7",
                    callback: (velocity) => {
                        this.selectScene(6);
                        return "Scene 7";
                    }
                },
                Pad8: {
                    label: "Scene 8",
                    callback: (velocity) => {
                        this.selectScene(7);
                        return "Scene 8";
                    }
                }

            },
            noteOff: {
            Pad1: {
                    label: "Scene 1",
                    callback: (velocity) => {
                        if (this.state.selectedScene === 0) {
                            return "Scene 1";
                        }
                    }
                },
                Pad2: {
                    label: "Scene 2",
                    callback: (velocity) => {
                        if (this.state.selectedScene === 1) {
                            return "Scene 2";
                        }
                    }
                },
                Pad3: {
                    label: "Scene 3",
                    callback: (velocity) => {
                        if (this.state.selectedScene === 2) {
                            return "Scene 3";
                        }
                    }
                },
                Pad4: {
                    label: "Scene 4",
                    callback: (velocity) => {
                        if (this.state.selectedScene === 3) {
                            return "Scene 4";
                        }
                    }
                },
                Pad5: {
                    label: "Scene 5",
                    callback: (velocity) => {
                        if (this.state.selectedScene === 4) {
                            return "Scene 5";
                        }
                    }
                },
                Pad6: {
                    label: "Scene 6",
                    callback: (velocity) => {
                        if (this.state.selectedScene === 5) {
                            return "Scene 6";
                        }
                    }
                },
                Pad7: {
                    label: "Scene 7",
                    callback: (velocity) => {
                        if (this.state.selectedScene === 6) {
                            return "Scene 7";
                        }
                    }
                },
                Pad8: {
                    label: "Scene 8",
                    callback: (velocity) => {
                        this.selectScene(7);
                        return "Scene 8";
                    }
                }
            },
            controlChange: {
                Knob1: {
                    label: "Rate",
                    callback: (data) => {
                        let rate = data % 8;
                        Store.instance.setTrackProperty("rate", rate);
                        return rate.toString();
                    }
                },

                Knob2: {
                    label: "Octave",
                    callback: (data) => {
                        let options = [-3, -2, -1, 0, 1, 2, 3];
                        let i = data % options.length;
                        let octave = options[i];
                        Store.instance.setTrackProperty("octave", octave);
                        return octave.toString();
                    }
                },

                Knob3: {
                    label: "Length",
                    callback: (data) => {
                        let length = data;
                        Store.instance.setTrackProperty("length", length);
                        return length;
                    }
                },

                Knob4: {
                    label: "Steps",
                    callback: (data) => {
                        let steps = data;
                        Store.instance.setTrackProperty("steps", steps);
                        return steps;
                    }
                },

                Knob5: {
                    label: "Sequence",
                    callback: (data) => {
                        let algos = [
                            "euclid",
                            "perc",
                            "quarterbeat",
                            "halfbeat",
                            "ryk",
                            "random" ];
                        let i = data % algos.length;
                        let algo = algos[i];
                        Store.instance.setTrackProperty("sequenceType", algo);
                        return algo;
                    }
                },


                Knob6: {
                    label: "Graph",
                    callback: (data) => {
                        let algos = [
                            "linear",
                            "markov",
                            "evolve" ];
                        let i = data % algos.length;
                        let algo = algos[i];
                        Store.instance.setTrackProperty("graphType", algo);
                        return algo;
                    }
                },


                Knob7: {
                    label: "Arp",
                    callback: (data) => {
                        let arpTypes = [
                            "none",
                            "up1",
                            "up2",
                            "up3",
                            "up2alt",
                            "up3alt",
                            "down1",
                            "down2",
                            "down3",
                            "down2alt",
                            "down3alt" ];
                        let i = data % arpTypes.length;
                        let type = arpTypes[i];
                        Store.instance.setTrackProperty("arp", type);
                        return type;
                    }
                },


                Knob8: {
                    label: "ArpRate",
                    callback: (data) => {
                        let rate = data % 8;
                        Store.instance.setTrackProperty("arpRate", rate);
                        return rate.toString();
                    }
                },

                Knob9: {
                    label: "Root",
                    callback: (data) => {
                        let note = ChordHarmonizer.NoteNames[data % ChordHarmonizer.NoteNames.length]
                        Store.instance.setSceneProperty("root", note);
                        return note;
                    }
                },
                Knob10: {
                    label: "Mode",
                    callback: (data) => {
                        let mode = ChordHarmonizer.ModeNames[data % ChordHarmonizer.ModeNames.length]
                        Store.instance.setSceneProperty("mode", mode);
                        return mode;
                    }
                },
                Knob11: {
                    label: "Min Note",
                    callback: (data) => {
                        Store.instance.setSceneProperty("minNote", data);
                        return data;
                    }
                },
                Knob12: {
                    label: "Max Note",
                    callback: (data) => {
                        Store.instance.setSceneProperty("maxNote", data);
                        return data;
                    }
                },
                Knob13: {
                    label: "Master",
                    callback: (data) => {
                        let i = data % Store.TRACK_COUNT;
                        Store.instance.setSceneProperty("master", i);
                        return Store.instance.scene.tracks[i].name;
                    }
                },
                Knob14: {
                    label: "Set Size",
                    callback: (data) => {
                        Store.instance.setSceneProperty("noteSetSize", data);
                        return data;
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
                        Store.instance.setPerformanceProperty("selectedTrack", data % 8);
                        this.updateDisplay();
                        let tracks = Store.instance.scene.tracks;
                        return tracks[Store.instance.performance.selectedTrack].name;
                    }
                }
            }
        }
    }

    selectScene(index) {
        Store.instance.setPerformanceProperty("selectedScene", index);
        Log.music(`Select scene ${index+1}`);
        this.updateDisplay();
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
            title: `{green-fg}[Performance ${Store.instance.state.selectedPerformance+1}:{/} ${this.state.name} {green-fg}Scene ${Store.instance.performance.selectedScene+1}{/}`
        });
    }

    updateDeviceState() {
        // TODO should be called TrackState ?
        let tracks = Store.instance.scene.tracks;

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

    updateAllPads() {
        this.updateControllerPad(MidiController.BeatStepMap.Pad1, this.state.selectedScene === 0 ? "Scene 1" : "");
        this.updateControllerPad(MidiController.BeatStepMap.Pad2, this.state.selectedScene === 1 ? "Scene 2" : "");
        this.updateControllerPad(MidiController.BeatStepMap.Pad3, this.state.selectedScene === 2 ? "Scene 3" : "");
        this.updateControllerPad(MidiController.BeatStepMap.Pad4, this.state.selectedScene === 3 ? "Scene 4" : "");
        this.updateControllerPad(MidiController.BeatStepMap.Pad5, this.state.selectedScene === 4 ? "Scene 5" : "");
        this.updateControllerPad(MidiController.BeatStepMap.Pad6, this.state.selectedScene === 5 ? "Scene 6" : "");
        this.updateControllerPad(MidiController.BeatStepMap.Pad7, this.state.selectedScene === 6 ? "Scene 7" : "");
        this.updateControllerPad(MidiController.BeatStepMap.Pad8, this.state.selectedScene === 7 ? "Scene 8" : "");
    }

    updateAllKnobs() {

        let trackState = Store.instance.scene.tracks[this.state.selectedTrack];

        this.updateControllerKnob(MidiController.BeatStepMap.Knob1, trackState.rate);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob2, trackState.octave);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob3, trackState.length);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob4, trackState.steps);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob5, trackState.sequenceType);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob6, trackState.graphType);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob7, trackState.arp);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob8, trackState.arpRate);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob9,  Store.instance.scene.options.root);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob10, Store.instance.scene.options.mode);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob11, Store.instance.scene.options.minNote);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob12, Store.instance.scene.options.maxNote);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob13, Store.instance.scene.tracks[Store.instance.scene.options.resetEvent].name);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob14, Store.instance.scene.options.noteSetSize);
        this.updateControllerKnob(MidiController.BeatStepMap.Knob15, "");
        this.updateControllerKnob(MidiController.BeatStepMap.Knob16, Store.instance.scene.tracks[this.state.selectedTrack].name);
    }

    updateDisplay() {
        this.updateTitle();
        this.updateAllPads();
        this.updateAllKnobs();
        this.updateDeviceState();
    }

}

module.exports = Performance;