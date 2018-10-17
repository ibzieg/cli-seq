
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
const JSONFile = require("./json-file");
const ExternalDevices = require("../midi/external-devices");

/* eslint-disable prettier/prettier */
/* eslint-disable indent */
const SAVED_STATE_FILENAME = process.mainModule
  ? path.join(
      path.dirname(
        process.mainModule.filename),
        "..",
          "..",
        "data",
        "saved-state.json")
  : "saved-state.json";
/* eslint-disable prettier/prettier */
/* eslint-enable indent */

/***
 * Ordered array of scene addresses with a loop count for each.
 * Uses a 1-based index to refer to Performance and Scene because it's more
 * intuitive with the UI.
 * Example element:
     [ number: performance 1-12,
       number: scene 1-16,
       number: repeat count >= 1 ]
 * @type {*[]}
 */
const playlist = [

  [1, 1, 4],
  [1, 2, 4],
  [1, 3, 1],
  [1, 4, 8]
];

/***
 *
 * state schema: {
 *     selectedPerformance: number (0-12 index)
 *     playlistMode: boolean (true for playlist playback, otherwise regular looping mode)
 *     playlist: [
 *         ...,
 *         [ number: performance 1-12,
 *           number: scene 1-16,
 *           number: repeat count >= 1 ]
 *     ]
 *     performances: [
 *         ..., (there are 12 performances)
 *         {
 *             name: string (arrangement name)
 *             selectedTrack: number (0-7 index)
 *             selectedScene: number (0-15 index)
 *             scenes: [
 *                 ... (each performance has 16 scenes, with scenes[0] being the primary)
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

const SCENE0_NAME = "Scene 1";
const SCENE1_NAME = "Scene 2";
const SCENE2_NAME = "Scene 3";
const SCENE3_NAME = "Scene 4";
const SCENE4_NAME = "Scene 5";
const SCENE5_NAME = "Scene 6";
const SCENE6_NAME = "Scene 7";
const SCENE7_NAME = "Scene 8";
const SCENE8_NAME = "Scene 9";
const SCENE9_NAME = "Scene 10";
const SCENE10_NAME = "Scene 11";
const SCENE11_NAME = "Scene 12";
const SCENE12_NAME = "Scene 13";
const SCENE13_NAME = "Scene 14";
const SCENE14_NAME = "Scene 15";
const SCENE15_NAME = "Scene 16";

const TRACK_DEFAULTS = [
  {
    name: "mono1",
    instrument: "UnoBSPSeq1"
  },
  {
    name: "mono2",
    instrument: "UnoBSPSeq2"
  },
  {
    name: "poly1",
    instrument: "UnoKorg",
    velocity: 120
  },
  {
    name: "poly2",
    instrument: "NordG2A"
  },
  {
    name: "perc1",
    instrument: "UnoBSPDrum",
    constants: [0],
    sequenceType: "quarterbeat",
    note: ExternalDevices.drumMap[0]
  },
  {
    name: "perc2",
    instrument: "UnoBSPDrum",
    sequenceType: "halfbeat",
    note: ExternalDevices.drumMap[1]
  },
  {
    name: "perc3",
    instrument: "UnoBSPDrum",
    sequenceType: "ryk",
    note: ExternalDevices.drumMap[2]
  },
  {
    name: "perc4",
    instrument: "UnoBSPDrum",
    sequenceType: "perc",
    note: ExternalDevices.drumMap[3]
  }
];

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
      playlistMode: false,
      playlist: [],
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
        Store.getDefaultPerformance(PERFORMANCE11_NAME)
      ]
    };
  }

  static mergeState(source, destination) {
    if (!destination.performances) {
      destination.performances = [];
    }
    let p = Object.assign({}, source, destination);
    p.performances = [];
    for (let i = 0; i < Store.PERFORMANCE_COUNT; i++) {
      p.performances[i] = Store.mergePerformance(
        source.performances[i],
        destination.performances[i]
      );
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
        Store.getDefaultScene(SCENE7_NAME, true),
        Store.getDefaultScene(SCENE8_NAME, true),
        Store.getDefaultScene(SCENE9_NAME, true),
        Store.getDefaultScene(SCENE10_NAME, true),
        Store.getDefaultScene(SCENE11_NAME, true),
        Store.getDefaultScene(SCENE12_NAME, true),
        Store.getDefaultScene(SCENE13_NAME, true),
        Store.getDefaultScene(SCENE14_NAME, true),
        Store.getDefaultScene(SCENE15_NAME, true)
      ]
    };
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
        Store.getDefaultTrackState(TRACK_DEFAULTS[0], isEmpty),
        Store.getDefaultTrackState(TRACK_DEFAULTS[1], isEmpty),
        Store.getDefaultTrackState(TRACK_DEFAULTS[2], isEmpty),
        Store.getDefaultTrackState(TRACK_DEFAULTS[3], isEmpty),
        Store.getDefaultTrackState(TRACK_DEFAULTS[4], isEmpty),
        Store.getDefaultTrackState(TRACK_DEFAULTS[5], isEmpty),
        Store.getDefaultTrackState(TRACK_DEFAULTS[6], isEmpty),
        Store.getDefaultTrackState(TRACK_DEFAULTS[7], isEmpty)
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
    state.options = Store.mergeSceneOptions(
      source.options,
      destination.options
    );
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
   Events output via the EuropiMinion CV Outputs
   pitch.1-8 // 1V/Octave CV of midi note event on tracks 1-8
   vel.1-8 // Velocity CV of midi note event on tracks 1-8
   mod.1-8 // Extra Mod CV related to midi note event on tracks 1-8
   step.1-8 // Increasing CV indicates progress through sequence on tracks 1-8
   cv.a-d // Corresponding to the modA-B properties in Scene Options

   Events output via the EuropiMinion Gate Outputs
   gate.1-8 // Gate output corresponding to midi not event on tracks 1-8
   tog.1-8 // Send trigger at beginning and end of Gate on tracks 1-8
   end.1-8 // Gate indicating squence has reach end on tracks 1-8
   scene // Gate indicating scene change.

   * @param isEmpty
   * @returns {{root: string, mode: string, minNote: number, maxNote: number, noteSetSize: number, resentEvent: string}}
   */
  static getDefaultSceneOptions(isEmpty) {
    if (isEmpty) {
      return {
        noteSet: []
      };
    } else {
      return {
        root: "G",
        mode: "VI Aeolian (Nat. Minor)",
        minNote: 48,
        maxNote: 64,
        resetEvent: 4, // perc1
        noteSetSize: 7,
        noteSet: [48, 56, 62, 68, 76],
        modA: 0.2,
        modB: 0.4,
        modC: 0.6,
        modD: 0.8,
        cvA: "pitch.0",
        cvB: "pitch.1",
        cvC: "cv.c",
        cvD: "cv.d",
        gateA: "gate.0",
        gateB: "gate.1",
        gateC: "end.4",
        gateD: "scene"
      };
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
  static getDefaultTrackState(defaults, isEmpty) {
    if (isEmpty) {
      return {};
    } else {
      let state = {
        name: "",
        instrument: "",

        partsPerQuant: 24,
        rate: 4,
        octave: 0,
        length: 16,
        end: 16,
        steps: 4,
        graphType: "linear",
        sequenceType: "random",
        arp: "none",
        arpRate: 2,

        loop: true, // reset count back to zero after end
        follow: null, // reset this track every time the Follow track plays an event

        note: null, // always play this note (e.g. drum machine mapping)
        velocity: null, // always play with this velocity
        constants: [], // always trigger event at these steps (e.g. always trigger Kick drum on first step)

        enabled: true,
        arpLoop: true,
        probability: true,
        sequenceData: Array.apply(null, Array(8)).map(() => []),
        graphData: {
          linear: [0],
          markov: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
          ]
        }
      };
      return Store.mergeTrackState(state, defaults);
    }
  }

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
    state.sequenceData = Store.mergeArray(
      source.sequenceData,
      destination.sequenceData
    );
    //state.graphData = Store.mergeArray(source.graphData, destination.graphData);
    if (source.graphData || destination.graphData) {
      state.graphData = Object.assign(
        {},
        source.graphData,
        destination.graphData
      );
    }

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
   * Create singleton
   * @returns {Promise}
   */
  static create() {
    if (!_instance) {
      _instance = new Store();
    }
    return Store.instance.loadState();
  }

  static destroy() {
    _instance = null;
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
    if (!this._cachedScene) {
      let perf = this.performance;
      let state = perf.scenes[0];
      for (let i = 1; i <= perf.selectedScene; i++) {
        state = Store.mergeScene(state, perf.scenes[i]);
      }
      this._cachedScene = state;
    }
    return this._cachedScene;
  }

  /***
   *
   */
  constructor() {
    this._state = Store.getDefaultState();
    this.stateChanged();
  }

  /***
   *
   */
  stateChanged() {
    this._cachedScene = null;

    // TODO is this slow?
    process.send({ type: "state", state: this.state });
    process.send({ type: "scene", data: this.scene });
  }

  /***
   *
   * @returns {Promise}
   */
  saveState() {
    return JSONFile.writeFile(SAVED_STATE_FILENAME, this.state);
  }

  /***
   *
   * @returns {Promise}
   */
  loadState() {
    return JSONFile.readFile(SAVED_STATE_FILENAME).then(newState => {
      this._state = Store.mergeState(this.state, newState);
      this.stateChanged();
    });
  }

  /***
   *
   * @param perfIndex
   */
  copySceneToPerformance(perfIndex) {
    if (perfIndex < 0 || perfIndex > Store.PERFORMANCE_COUNT) {
      throw new Error(`Index out of bounds: ${perfIndex}`);
    }

    // clone the active scene
    let scene = Store.mergeScene(
      Store.getDefaultScene("asdf", false),
      this.scene
    );

    // create an empty performance
    let perf = Store.getDefaultPerformance(
      `(copy) Performance ${perfIndex + 1}`
    );
    // set the cloned scene as the base scene
    perf.scenes[0] = scene;

    this._state.performances[perfIndex] = perf;
    this.stateChanged();
  }

  /***
   *
   */
  clearActiveTrack() {
    let perf = this._state.performances[this.state.selectedPerformance];
    let scene = perf.scenes[perf.selectedScene];
    scene.tracks[perf.selectedTrack] = Store.getDefaultTrackState(
      TRACK_DEFAULTS[perf.selectedTrack],
      perf.selectedScene > 0
    );
    this.stateChanged();
  }

  /***
   *
   * @param key
   * @param value
   */
  setProperty(key, value) {
    this._state[key] = value;
    this.stateChanged();
  }

  /***
   *
   * @param key
   * @param value
   */
  setPerformanceProperty(key, value) {
    this._state.performances[this.state.selectedPerformance][key] = value;
    this.stateChanged();
  }

  /***
   *
   * @param key
   * @param value
   */
  setSceneProperty(key, value) {
    let perf = this.performance;
    let scene = perf.scenes[perf.selectedScene];
    let options = scene.options;
    options[key] = value;
    this.stateChanged();
  }

  /***
   *
   * @param index
   * @param key
   * @param value
   */
  setTrackProperty(index, key, value) {
    let perf = this.performance;
    let scene = perf.scenes[perf.selectedScene];
    let track = scene.tracks[index];
    track[key] = value;
    this.stateChanged();
  }

  /***
   *
   * @param key
   * @param value
   */
  setSelectedTrackProperty(key, value) {
    let perf = this.performance;
    let scene = perf.scenes[perf.selectedScene];
    let track = scene.tracks[perf.selectedTrack];
    track[key] = value;
    this.stateChanged();
  }
}

Store.PERFORMANCE_COUNT = 12;
Store.TRACK_COUNT = 8;
Store.SCENE_COUNT = 16;
Store.SEQUENCE_COUNT = 8;
Store.GRAPH_COUNT = 8;

module.exports = Store;
