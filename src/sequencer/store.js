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

const SAVED_STATE_FILENAME = path.join(path.dirname(process.mainModule.filename),"..","data","saved-state.json");

/***
 *
 * state schema: {
 *     performances: [
 *         ..., (there are 16 arrangements)
 *         {
 *             name: string (arrangement name)
 *             selectedTrack: number (0-7 index)
 *             selectedPart: number (0-7 index)
 *             parts: [
 *                 ... (each arrangement has 8 parts, with parts[0] being the primary)
 *                 {
 *                     options: {
 *                         root: string (root note)
 *                         mode: string (scale mode)
 *                         minNote: number (0-127 midi note)
 *                         maxNote: number (0-127 midi note)
 *                         noteSetSize: number (0-64 size of set of possible notes to be generated)
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
 *                             pattern: string (generation algorithm)
 *                             progression: string (sequence progression type)
 *                             arp: string (arpeggiator pattern)
 *                             arpRate: number (necessary ?)
 *
 *                             // toggles & triggers
 *                             enabled: boolean
 *                             arpLoop: boolean
 *                             progression?: {} (trigger to randomize/generate. data to drive the progression type)
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

const PART0_NAME = "Part 1";
const PART1_NAME = "Part 2";
const PART2_NAME = "Part 3";
const PART3_NAME = "Part 4";
const PART4_NAME = "Part 5";
const PART5_NAME = "Part 6";
const PART6_NAME = "Part 7";
const PART7_NAME = "Part 8";

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
     * @returns {{performances: [*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*]}}
     */
    static getDefaultState() {
        return {
            selectedPerformance: 0,
            performances: [
                Store.getDefaultPerformance(Store.PERFORMANCE0_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE1_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE2_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE3_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE4_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE5_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE6_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE7_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE8_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE9_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE10_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE11_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE12_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE13_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE14_NAME),
                Store.getDefaultPerformance(Store.PERFORMANCE15_NAME)
            ]
        }
    }

    static mergeState(source, destination) {
        if (!destination.performances) {
            destination.performances = [];
        }
        let p = Object.assign({}, source, destination, { performances: [] });
        for (let i = 0; i < 16; i++) {
            p.performances[i] = Store.mergePerformance(source.performances[i], destination.performances[i]);
        }
        return p;
    }

    /***
     *
     * @param name
     * @returns {{name: *, selectedTrack: number, parts: [*,*,*,*,*,*,*,*]}}
     */
    static getDefaultPerformance(name) {
        return {
            name: name,
            selectedTrack: 0,
            selectedPart: 0,
            parts: [
                Store.getDefaultPerformancePart(Store.PART0_NAME),
                Store.getDefaultPerformancePart(Store.PART1_NAME, true),
                Store.getDefaultPerformancePart(Store.PART2_NAME, true),
                Store.getDefaultPerformancePart(Store.PART3_NAME, true),
                Store.getDefaultPerformancePart(Store.PART4_NAME, true),
                Store.getDefaultPerformancePart(Store.PART5_NAME, true),
                Store.getDefaultPerformancePart(Store.PART6_NAME, true),
                Store.getDefaultPerformancePart(Store.PART7_NAME, true)
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
        if (!destination.parts) {
            destination.parts = [];
        }
        let p = Object.assign({}, source, destination, { parts: [] });
        for (let i = 0; i < 8; i++) {
            p.parts[i] = Store.mergePerformancePart(source.parts[i], destination.parts[i]);
        }
        return p;
    }

    /***
     *
     * @param name
     * @param isEmpty
     * @returns {{name: *, options: {root: string, mode: string, minNote: number, maxNote: number, noteSetSize: number, resentEvent: string}, tracks: [*,*,*,*,*,*,*,*]}}
     */
    static getDefaultPerformancePart(name, isEmpty) {
        let p = {
            options: Store.getDefaultPerformancePartOptions(isEmpty),
            tracks: [
                Store.getDefaultTrackState(Store.TRACK0_DEFAULT_NAME, Store.TRACK0_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(Store.TRACK1_DEFAULT_NAME, Store.TRACK1_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(Store.TRACK2_DEFAULT_NAME, Store.TRACK2_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(Store.TRACK3_DEFAULT_NAME, Store.TRACK3_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(Store.TRACK4_DEFAULT_NAME, Store.TRACK4_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(Store.TRACK5_DEFAULT_NAME, Store.TRACK5_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(Store.TRACK6_DEFAULT_NAME, Store.TRACK6_DEFAULT_INSTRUMENT, isEmpty),
                Store.getDefaultTrackState(Store.TRACK7_DEFAULT_NAME, Store.TRACK7_DEFAULT_INSTRUMENT, isEmpty)
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
    static mergePerformancePart(source, destination) {
        if (!destination) {
            destination = {};
        }
        if (!destination.tracks) {
            destination.tracks = [];
        }
        let state = Object.assign({}, source, destination);
        state.options = Store.mergePerformancePartOptions(source.options, destination.options),
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
    static getDefaultPerformancePartOptions(isEmpty) {
        return isEmpty ? {} : {
            root: "A", // TODO get a default from enum
            mode: "V", // TODO get a default from enum
            minNote: 48,
            maxNote: 64,
            noteSetSize: 4,
            resentEvent: ""
        }

    }

    /***
     *
     * @param source
     * @param destination
     * @returns {*}
     */
    static mergePerformancePartOptions(source, destination) {
        return Object.assign({}, source, destination);
    }

    /***
     *
     * @param voiceName
     * @param instrumentName
     * @param isEmpty
     * @returns {{name: *, instrument: *, rate: number, octave: number, length: number, steps: number, patternType: string, sequenceType: string, arp: string, arpRate: number, enabled: boolean, arpLoop: boolean, probability: boolean, sequenceData: [number], patternData: Array}}
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
            patternType: "random",
            sequenceType: "graph",
            arp: "none",
            arpRate: 2,

            loop: true, // reset count back to zero after end
            note: null, // always play this note (e.g. drum machine mapping)

            //TODO this will need a merge
            constants: [], // always trigger event at these steps (e.g. always trigger Kick drum on first step)
            follow: null, // reset this track every time the Follow track plays an event

            enabled: true,
            arpLoop: true,
            probability: true,
            sequenceData: [0],
            patternData: Array.apply(null, Array(8)).map(() => [])
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

        let sequenceData = destination.sequenceData;
        if (!sequenceData) {
            sequenceData = source.sequenceData;
            if (!sequenceData) {
                sequenceData = []; 
            }
        }

        let patternData = destination.patternData;
        if (!patternData) {
            patternData = source.patternData;
            if (!patternData) {
                patternData = [];
            }
        }

        state.sequenceData = sequenceData.slice();
        state.patternData = patternData.slice();
        return state;
    }

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
    get performancePart() {
        let perf = this.performance;
        let state = perf.parts[0];
        for (let i = 1; i <= perf.selectedPart; i++) {
            state = Store.mergePerformancePart(state, perf.parts[i]);
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
                            //this._state = Object.assign({}, this.state, newState);
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

}
module.exports = Store;