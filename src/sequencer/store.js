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

const fs = require("fs");
const path = require("path");
const Log = require("../display/log-util");

const SAVED_STATE_FILENAME = path.join(path.dirname(process.mainModule.filename),"..","..","data","saved-state.json");

/***
 *
 * state schema: {
 *     performances: [
 *         ..., (there are 16 arrangements)
 *         {
 *             name: string (arrangement name)
 *             selectedTrack: number (0-7 index)
 *             selectedScene: number (0-7 index)
 *             scenes: [
 *                 ... (each arrangement has 8 scenes, with scenes[0] being the primary)
 *                 {
 *                     options: {
 *                         root: string (root note)
 *                         mode: string (scale mode)
 *                         minNote: number (0-127 midi note)
 *                         maxNote: number (0-127 midi note)
 *                         noteSetSize: number (0-64 size of set of possible notes to be generated)
 *                         noteSet: number[]
 *                         resentEvent: string ("none" | track# to reset on end)
 *                     },
 *                     tracks: [
 *                         ...,
 *                         {
 *                             // properties
 *                             name: string (voice name)
 *                             instrument: string (midi device name)
 *
 *                             // settings
 *                             rate: number (multiplier)
 *                             octave: number (offset)
 *                             length: number (n)
 *                             steps: number (k) where k <= n
 *                             sequenceType: string (generation algorithm)
 *                             graphType: string (sequence progression type)
 *                             arp: string (arpeggiator pattern)
 *                             arpRate: number (necessary ?)
 *
 *                             // toggles & triggers
 *                             enabled: boolean
 *                             arpLoop: boolean
 *                             graph: {} (trigger to randomize/generate. data to drive the graph type)
 *                             probability: boolean (if true, check prob of note event to play or ratchet)
 *
 *                             // data
 *                             data: [
 *                                 ..., (there are 8 data sequences per track)
 *                                 [..., {note event} ]
 *                             ]
 *                         }
 *                     ]
 *                 }
 *             ]
 * }
 *
 */


const PERFORMANCE0_NAME = "Performance 1";
const PERFORMANCE1_NAME = "Performance 2";
const PERFORMANCE2_NAME = "Performance 3";
const PERFORMANCE3_NAME = "Performance 4";
const PERFORMANCE4_NAME = "Performance 5";
const PERFORMANCE5_NAME = "Performance 6";
const PERFORMANCE6_NAME = "Performance 7";
const PERFORMANCE7_NAME = "Performance 8";
const PERFORMANCE8_NAME = "Performance 9";
const PERFORMANCE9_NAME = "Performance 10";
const PERFORMANCE10_NAME = "Performance 11";
const PERFORMANCE11_NAME = "Performance 12";
const PERFORMANCE12_NAME = "Performance 13";
const PERFORMANCE13_NAME = "Performance 14";
const PERFORMANCE14_NAME = "Performance 15";
const PERFORMANCE15_NAME = "Performance 16";

const SCENE0_NAME = "Scene 1";
const SCENE1_NAME = "Scene 2";
const SCENE2_NAME = "Scene 3";
const SCENE3_NAME = "Scene 4";
const SCENE4_NAME = "Scene 5";
const SCENE5_NAME = "Scene 6";
const SCENE6_NAME = "Scene 7";
const SCENE7_NAME = "Scene 8";

const TRACK0_DEFAULT_NAME = "mono1";
const TRACK1_DEFAULT_NAME = "mono2";
const TRACK2_DEFAULT_NAME = "poly1";
const TRACK3_DEFAULT_NAME = "poly2";
const TRACK4_DEFAULT_NAME = "perc1";
const TRACK5_DEFAULT_NAME = "perc2";
const TRACK6_DEFAULT_NAME = "perc3";
const TRACK7_DEFAULT_NAME = "perc4";

const TRACK0_DEFAULT_INSTRUMENT = "BSPSeq1";
const TRACK1_DEFAULT_INSTRUMENT = "BSPSeq2";
const TRACK2_DEFAULT_INSTRUMENT = "Minilogue";
const TRACK3_DEFAULT_INSTRUMENT = "NordG2A";
const TRACK4_DEFAULT_INSTRUMENT = "BSPDrum";
const TRACK5_DEFAULT_INSTRUMENT = "BSPDrum";
const TRACK6_DEFAULT_INSTRUMENT = "BSPDrum";
const TRACK7_DEFAULT_INSTRUMENT = "BSPDrum";

let _instance;

class Store {

    /***
     *
     * @param source
     * @param destination
     * @returns {string|Array.<T>|Blob|ArrayBuffer}
     */
    static mergeArray(source, destination) {
        if (!destination || destination.length < 1) {
            return source ? source.slice() : source;
        } else {
            return destination.slice();
        }
    }

    /***
     *
     * @returns {{performances: [*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*]}}
     */
    static getDefaultState() {
        return {
            selectedPerformance: 0,
            performances: [
                Store.getDefaultPerformance(PERFORMANCE0_NAME),
                Store.getDefaultPerformance(PERFORMANCE1_NAME),
                Store.getDefaultPerformance(PERFORMANCE2_NAME),
                Store.getDefaultPerformance(PERFORMANCE3_NAME),
                Store.getDefaultPerformance(PERFORMANCE4_NAME),
                Store.getDefaultPerformance(PERFORMANCE5_NAME),
                Store.getDefaultPerformance(PERFORMANCE6_NAME),
                Store.getDefaultPerformance(PERFORMANCE7_NAME),
                Store.getDefaultPerformance(PERFORMANCE8_NAME),
                Store.getDefaultPerformance(PERFORMANCE9_NAME),
                Store.getDefaultPerformance(PERFORMANCE10_NAME),
                Store.getDefaultPerformance(PERFORMANCE11_NAME),
                Store.getDefaultPerformance(PERFORMANCE12_NAME),
                Store.getDefaultPerformance(PERFORMANCE13_NAME),
                Store.getDefaultPerformance(PERFORMANCE14_NAME),
                Store.getDefaultPerformance(PERFORMANCE15_NAME)
            ]
        }
    }

    static mergeState(source, destination) {
        if (!destination.performances) {
            destination.performances = [];
        }
        let p = Object.assign({}, source, destination);
        p.performances = [];
        for (let i = 0; i < Store.PERFORMANCE_COUNT; i++) {
            p.performances[i] = Store.mergePerformance(source.performances[i], destination.performances[i]);
        }
        return p;
    }

    /***
     *
     * @param name
     * @returns {{name: *, selectedTrack: number, scenes: [*,*,*,*,*,*,*,*]}}
     */
    static getDefaultPerformance(name) {
        return {
            name: name,
            selectedTrack: 0,
            selectedScene: 0,
            scenes: [
                Store.getDefaultScene(SCENE0_NAME),
                Store.getDefaultScene(SCENE1_NAME, true),
                Store.getDefaultScene(SCENE2_NAME, true),
                Store.getDefaultScene(SCENE3_NAME, true),
                Store.getDefaultScene(SCENE4_NAME, true),
                Store.getDefaultScene(SCENE5_NAME, true),
                Store.getDefaultScene(SCENE6_NAME, true),
                Store.getDefaultScene(SCENE7_NAME, true)
            ]
        }
    }

    /***
     *
     * @param source
     * @param destination
     * @returns {*}
     */
    static mergePerformance(source, destination) {
        if (!destination) {
            destination = {};
        }
        if (!destination.scenes) {
            destination.scenes = [];
        }
        let p = Object.assign({}, source, destination);
        p.scenes = [];
        for (let i = 0; i < Store.SCENE_COUNT; i++) {
            p.scenes[i] = Store.mergeScene(source.scenes[i], destination.scenes[i]);
        }
        return p;
    }

    /***
     *
     * @param name
     * @param isEmpty
     * @returns {{name: *, options: {root: string, mode: string, minNote: number, maxNote: number, noteSetSize: number, resentEvent: string}, tracks: [*,*,*,*,*,*,*,*]}}
     */
    static getDefaultScene(name, isEmpty) {
        let p = {
            options: Store.getDefaultSceneOptions(isEmpty),
            tracks: [
                Store.getDefaultTrackState(TRACK0_DEFAULT_NAME, TRACK0_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(TRACK1_DEFAULT_NAME, TRACK1_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(TRACK2_DEFAULT_NAME, TRACK2_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(TRACK3_DEFAULT_NAME, TRACK3_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(TRACK4_DEFAULT_NAME, TRACK4_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(TRACK5_DEFAULT_NAME, TRACK5_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(TRACK6_DEFAULT_NAME, TRACK6_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(TRACK7_DEFAULT_NAME, TRACK7_DEFAULT_INSTRUMENT, isEmpty)
            ]
        };

        if (!isEmpty) {
            p.name = name;
        }

        return p;
    }

    /***
     *
     * @param source
     * @param destination
     * @returns {*}
     */
    static mergeScene(source, destination) {
        if (!destination) {
            destination = {};
        }
        if (!destination.tracks) {
            destination.tracks = [];
        }
        if (!destination.options) {
            destination.options = {};
        }

        let state = Object.assign({}, source, destination);
        state.options = Store.mergeSceneOptions(source.options, destination.options);
        state.tracks = [
            Store.mergeTrackState(source.tracks[0], destination.tracks[0]),
            Store.mergeTrackState(source.tracks[1], destination.tracks[1]),
            Store.mergeTrackState(source.tracks[2], destination.tracks[2]),
            Store.mergeTrackState(source.tracks[3], destination.tracks[3]),
            Store.mergeTrackState(source.tracks[4], destination.tracks[4]),
            Store.mergeTrackState(source.tracks[5], destination.tracks[5]),
            Store.mergeTrackState(source.tracks[6], destination.tracks[6]),
            Store.mergeTrackState(source.tracks[7], destination.tracks[7])
        ];
        return state;
    }

    /***
     *
     * @param isEmpty
     * @returns {{root: string, mode: string, minNote: number, maxNote: number, noteSetSize: number, resentEvent: string}}
     */
    static getDefaultSceneOptions(isEmpty) {
        return isEmpty ? {
            noteSet: []
        } : {
            root: "G",
            mode: "VI Aeolian (Nat. Minor)",
            minNote: 48,
            maxNote: 64,
            noteSetSize: 5,
            noteSet: [48, 56, 62, 68, 76],
            resetEvent: 4 // perc1
        }

    }

    /***
     *
     * @param source
     * @param destination
     * @returns {*}
     */
    static mergeSceneOptions(source, destination) {
        if (!destination) {
            destination = {};
        }
        let options = Object.assign({}, source, destination);

        options.noteSet = Store.mergeArray(source.noteSet, destination.noteSet);

        return options;
    }

    /***
     *
     * @param voiceName
     * @param instrumentName
     * @param isEmpty
     * @returns {{name: *, instrument: *, rate: number, octave: number, length: number, steps: number, graphType: string, sequenceType: string, arp: string, arpRate: number, enabled: boolean, arpLoop: boolean, probability: boolean, sequenceData: [number], graphData: Array}}
     */
    static getDefaultTrackState(voiceName, instrumentName, isEmpty) {
        return isEmpty ? {} : {
            name: voiceName,
            instrument: instrumentName,

            partsPerQuant: 24,
            rate: 1,
            octave: 0,
            length: 16,
            steps: 4,
            graphType: "linear",
            sequenceType: "random",
            arp: "none",
            arpRate: 2,

            loop: true, // reset count back to zero after end
            follow: null, // reset this track every time the Follow track plays an event

            note: null, // always play this note (e.g. drum machine mapping)
            constants: [], // always trigger event at these steps (e.g. always trigger Kick drum on first step)


            enabled: true,
            arpLoop: true,
            probability: true,
            sequenceData: Array.apply(null, Array(8)).map(() => []),
            graphData: [0]
        }
    };

    /***
     *
     * @param source
     * @param destination
     * @returns {*}
     */
    static mergeTrackState(source, destination) {
        if (!destination) {
            destination = {};
        }
        let state = Object.assign({}, source, destination);

        state.constants = Store.mergeArray(source.constants, destination.constants);
        state.sequenceData = Store.mergeArray(source.sequenceData, destination.sequenceData);
        state.graphData = Store.mergeArray(source.graphData, destination.graphData);

        return state;
    }

    /***
     *
      * @returns {*}
     */
    static get instance() {
        return _instance;
    }

    /***
     *
     * @returns {Promise}
     */
    static create() {
        if (!_instance) {
           _instance = new Store();
        }
        return Store.instance.loadState();
    }

    /***
     *
     * @returns {{}|*}
     */
    get state() {
        return this._state;
    }

    /***
     *
     * @returns {*}
     */
    get performance() {
        return this.state.performances[this.state.selectedPerformance];
    }

    /***
     *
     * @returns {*}
     */
    get scene() {
        let perf = this.performance;
        let state = perf.scenes[0];
        for (let i = 1; i <= perf.selectedScene; i++) {
            state = Store.mergeScene(state, perf.scenes[i]);
        }
        return state;
    }

    /***
     *
     */
    constructor() {
        this._state = Store.getDefaultState();
    }

    /***
     *
     * @returns {Promise}
     */
    saveState() {
        return new Promise((resolve, reject) => {
            let json = JSON.stringify(this.state, null, ' ');
            fs.writeFile(SAVED_STATE_FILENAME, json, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /***
     *
     * @returns {Promise}
     */
    loadState() {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(SAVED_STATE_FILENAME)) {
                fs.readFile(SAVED_STATE_FILENAME, {encoding: 'utf-8'}, (error, text) => {
                    if (error) {
                        reject(error);
                    } else {
                        try {
                            let newState = JSON.parse(text);
                            this._state = Store.mergeState(this.state, newState);
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }

                    }
                });
            } else {
                resolve();
            }
        });
    }

    setProperty(key, value) {
        this._state[key] = value;
    }

    setPerformanceProperty(key, value) {
        this._state.performances[this.state.selectedPerformance][key] = value;
    }

    setSceneProperty(key, value) {
        let perf = this.performance;
        let scene = perf.scenes[perf.selectedScene];
        let options = scene.options;
        options[key] = value;
    }

    setTrackProperty(key, value) {
        let perf = this.performance;
        let scene = perf.scenes[perf.selectedScene];
        let track = scene.tracks[perf.selectedTrack];
        track[key] = value;
    }

}

Store.PERFORMANCE_COUNT = 16;
Store.TRACK_COUNT = 8;
Store.SCENE_COUNT = 8;

module.exports = Store;