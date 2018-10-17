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
const MidiDevice = require("../midi/midi-device");
const ExternalDevices = require("../midi/external-devices");
const Store = require("./store");
const EuropiMinion = require("../europi/europi-minion");

const NoteQuantizer = require("./note-quantizer");
const SequenceData = require("./sequence-data");
const Track = require("./track");
const EventScheduler = require("./event-scheduler");

class Performance {
  get state() {
    return Store.instance.performance;
  }

  /***
   *
   * @param props
   */
  constructor(props) {
    this.props = {
      context: props.context
    };

    this.tracks = [];
    for (let i = 0; i < Store.TRACK_COUNT; i++) {
      this.tracks[i] = new Track({
        index: i,
        cvEvent: (eventType, value) => {
          this.cvEvent(eventType, value, i);
        },
        playEvent: (note, velocity, duration) => {
          this.playEvent(i, note, velocity, duration);
        },
        endEvent: () => {
          this.endEvent(i);
        }
      });
    }

    this.eventScheduler = new EventScheduler();

    this.queuedSceneIndex = null;
  }

  /***
   *
   * @param eventType
   * @param value
   * @param trackIndex
   */
  cvEvent(eventType, value, trackIndex) {
    let sceneOptions = Store.instance.scene.options;
    const keys = [
      "cvA",
      "cvB",
      "cvC",
      "cvD",
      "gateA",
      "gateB",
      "gateC",
      "gateD"
    ];
    for (let i = 0; i < keys.length; i++) {
      let eventRoute = sceneOptions[keys[i]].split(".");
      if (eventRoute[0] === eventType && eventRoute[1] == trackIndex) {
        this.routeCVEvent(
          eventType,
          value,
          i % 4 /*dependent on keys[] order*/
        );
      }
    }
  }

  /***
   *
   * @param type
   * @param value
   * @param channel
   */
  routeCVEvent(type, value, channel) {
    let minion = this.props.context.minion;
    switch (type) {
      case "tog":
        // first trigger
        this.eventScheduler.schedule(2, () => {
          minion.GateOutput(channel, 0);
        });
        minion.GateOutput(channel, 1);

        // second trigger
        this.eventScheduler.schedule(parseInt(value), () => {
          this.eventScheduler.schedule(2, () => {
            minion.GateOutput(channel, 0);
          });
          minion.GateOutput(channel, 1);
        });
        break;
      case "gate":
      case "end":
      case "scene":
        this.eventScheduler.schedule(parseInt(value), () => {
          minion.GateOutput(channel, 0);
        });
        minion.GateOutput(channel, 1);
        break;

      case "pitch":
        minion.CVOutput(channel, EuropiMinion.pitchToCV(value));
        break;
      case "vel":
      case "mod":
      case "step":
      case "cv":
        minion.CVOutput(channel, value);
        break;
    }
  }

  /***
   *
   * @param index
   */
  endEvent(index) {
    this.cvEvent("end", 1, index);
    if (
      Store.instance.scene.options.resetEvent === index &&
      typeof this.queuedSceneIndex === "number"
    ) {
      this.resetAllTracks();
      this.selectScene(this.queuedSceneIndex);
    }
    // TODO Play from playlist here
  }

  /***
   *
   */
  resetAllTracks() {
    for (let i = 0; i < Store.TRACK_COUNT; i++) {
      this.tracks[i].reset();
    }
  }

  /***
   *
   * @param index
   * @param note
   * @param velocity
   * @param duration
   */
  playEvent(index, note, velocity, duration) {
    this.notifyFollowers(index);
  }

  /***
   *
   * @param index
   */
  notifyFollowers(index) {
    for (let i = 0; i < Store.TRACK_COUNT; i++) {
      let track = this.tracks[i];
      if (track.state.follow === index) {
        track.continue();
      }
    }
  }

  /***
   *
   * @param index
   */
  select(index) {
    // TODO Queue this for beat syncing
    Store.instance.setProperty("selectedPerformance", index);
  }

  /***
   *
   * @param bpm
   */
  clock(bpm) {
    for (let i = 0; i < Store.TRACK_COUNT; i++) {
      this.tracks[i].clock(bpm);
    }
    this.eventScheduler.clock();
  }

  /***
   *
   */
  postClock() {
    for (let i = 0; i < Store.TRACK_COUNT; i++) {
      this.tracks[i].postClock();
    }
  }

  /***
   *
   */
  start() {
    for (let i = 0; i < Store.TRACK_COUNT; i++) {
      this.tracks[i].start();
    }
  }

  /***
   *
   */
  stop() {
    for (let i = 0; i < Store.TRACK_COUNT; i++) {
      this.tracks[i].stop();
    }
    this.eventScheduler.flushAllEvents();
  }

  /***
   *
   */
  createControllerMap() {
    return {
      noteOn: {
        Pad9: {
          label: "Enabled",
          callback: velocity => {
            let enabled =
              Store.instance.scene.tracks[this.state.selectedTrack].enabled;
            Store.instance.setSelectedTrackProperty("enabled", !enabled);
            return enabled ? "Disabled" : "Enabled";
          }
        },
        Pad10: {
          label: "Arp Loop",
          callback: velocity => {
            /* TODO */
            return "";
          }
        },
        Pad11: {
          label: "Step Prob",
          callback: velocity => {
            /* TODO */
            return "";
          }
        },
        Pad12: {
          label: "Rnd Graph",
          callback: velocity => {
            this.tracks[this.state.selectedTrack].generateGraphData();
            Log.info(
              `tracks[${this.state.selectedTrack}].graphData=${JSON.stringify(
                Store.instance.scene.tracks[this.state.selectedTrack].graphData
              )}`
            );
            return "Graph";
          }
        },
        Pad13: {
          label: "Rnd Track",
          callback: velocity => {
            let track = this.tracks[this.state.selectedTrack];
            let seqIndex = parseInt(track.state.graphType);
            if (seqIndex >= 0) {
              // If a specific sequence index is chosen, only randomize that slot
              track.generateSequenceData(seqIndex);
            } else {
              track.generateAllSequences();
            }
            return "Randomize";
          }
        },
        Pad14: {
          label: "Rnd All",
          callback: velocity => {
            this.generateAllTracks();
            return "Randomize";
          }
        },
        Pad15: {
          label: "Gen Notes",
          callback: velocity => {
            this.generateNoteSet();
            Log.debug(
              `generated note set ${Store.instance.scene.options.noteSet}`
            );
            return "Randomize";
          }
        },
        Pad16: {
          label: "Play Mode",
          callback: velocity => {
            return;
          }
        },
        Pad1: {
          label: "Track 1",
          callback: velocity => {
            return this.selectTrack(0);
          }
        },
        Pad2: {
          label: "Track 2",
          callback: velocity => {
            return this.selectTrack(1);
          }
        },
        Pad3: {
          label: "Track 3",
          callback: velocity => {
            return this.selectTrack(2);
          }
        },
        Pad4: {
          label: "Track 4",
          callback: velocity => {
            return this.selectTrack(3);
          }
        },
        Pad5: {
          label: "Track 5",
          callback: velocity => {
            return this.selectTrack(4);
          }
        },
        Pad6: {
          label: "Track 6",
          callback: velocity => {
            return this.selectTrack(5);
          }
        },
        Pad7: {
          label: "Track 7",
          callback: velocity => {
            return this.selectTrack(6);
          }
        },
        Pad8: {
          label: "Track 8",
          callback: velocity => {
            return this.selectTrack(7);
          }
        }
      },
      noteOff: {
        Pad1: {
          label: "Track 1",
          callback: velocity => {
            if (this.state.selectedTrack === 0) {
              return Store.instance.scene.tracks[this.state.selectedTrack].name;
            }
          }
        },
        Pad2: {
          label: "Track 2",
          callback: velocity => {
            if (this.state.selectedTrack === 1) {
              return Store.instance.scene.tracks[this.state.selectedTrack].name;
            }
          }
        },
        Pad3: {
          label: "Track 3",
          callback: velocity => {
            if (this.state.selectedTrack === 2) {
              return Store.instance.scene.tracks[this.state.selectedTrack].name;
            }
          }
        },
        Pad4: {
          label: "Track 4",
          callback: velocity => {
            if (this.state.selectedTrack === 3) {
              return Store.instance.scene.tracks[this.state.selectedTrack].name;
            }
          }
        },
        Pad5: {
          label: "Track 5",
          callback: velocity => {
            if (this.state.selectedTrack === 4) {
              return Store.instance.scene.tracks[this.state.selectedTrack].name;
            }
          }
        },
        Pad6: {
          label: "Track 6",
          callback: velocity => {
            if (this.state.selectedTrack === 5) {
              return Store.instance.scene.tracks[this.state.selectedTrack].name;
            }
          }
        },
        Pad7: {
          label: "Track 7",
          callback: velocity => {
            if (this.state.selectedTrack === 6) {
              return Store.instance.scene.tracks[this.state.selectedTrack].name;
            }
          }
        },
        Pad8: {
          label: "Track 8",
          callback: velocity => {
            if (this.state.selectedTrack === 7) {
              return Store.instance.scene.tracks[this.state.selectedTrack].name;
            }
          }
        }
      },
      controlChange: {
        Knob1: {
          label: "Rate",
          callback: data => {
            let rate = data % 9;
            Store.instance.setSelectedTrackProperty("rate", rate);
            return rate.toString();
          }
        },

        Knob2: {
          label: "Octave",
          callback: data => {
            let options = [-3, -2, -1, 0, 1, 2, 3];
            let i = data % options.length;
            let octave = options[i];
            Store.instance.setSelectedTrackProperty("octave", octave);
            return octave.toString();
          }
        },

        Knob3: {
          label: "Length",
          callback: data => {
            let length = data;
            Store.instance.setSelectedTrackProperty("length", length);
            return length;
          }
        },

        Knob4: {
          label: "Steps",
          callback: data => {
            let steps = data;
            Store.instance.setSelectedTrackProperty("steps", steps);
            return steps;
          }
        },
        Knob5: {
          label: "Sequence",
          callback: data => {
            let algos = [
              "euclid",
              "perc",
              "quarterbeat",
              "halfbeat",
              "ryk",
              "brmnghm",
              "expfwd",
              "exprev",
              "random"
            ];
            let i = data % algos.length;
            let algo = algos[i];
            Store.instance.setSelectedTrackProperty("sequenceType", algo);
            return algo;
          }
        },

        Knob6: {
          label: "Graph",
          callback: data => {
            let algos = [
              "linear",
              "markov",
              "evolve",
              "0",
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7"
            ];
            let i = data % algos.length;
            let algo = algos[i];
            Store.instance.setSelectedTrackProperty("graphType", algo);
            return algo;
          }
        },

        Knob7: {
          label: "Arp",
          callback: data => {
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
              "down3alt"
            ];
            let i = data % arpTypes.length;
            let type = arpTypes[i];
            Store.instance.setSelectedTrackProperty("arp", type);
            return type;
          }
        },

        Knob8: {
          label: "ArpRate",
          callback: data => {
            let rate = data % 8;
            Store.instance.setSelectedTrackProperty("arpRate", rate);
            return rate.toString();
          }
        },

        Knob9: {
          label: "Root",
          callback: data => {
            let note =
              NoteQuantizer.NoteNames[data % NoteQuantizer.NoteNames.length];
            Store.instance.setSceneProperty("root", note);
            return note;
          }
        },
        Knob10: {
          label: "Mode",
          callback: data => {
            let mode =
              NoteQuantizer.ModeNames[data % NoteQuantizer.ModeNames.length];
            Store.instance.setSceneProperty("mode", mode);
            return mode;
          }
        },
        Knob11: {
          label: "Min Note",
          callback: data => {
            Store.instance.setSceneProperty("minNote", data);
            return data;
          }
        },
        Knob12: {
          label: "Max Note",
          callback: data => {
            Store.instance.setSceneProperty("maxNote", data);
            return data;
          }
        },
        Knob13: {
          label: "Master",
          callback: data => {
            let i = data % Store.TRACK_COUNT;
            Store.instance.setSceneProperty("resetEvent", i);
            return Store.instance.scene.tracks[i].name;
          }
        },
        Knob14: {
          label: "Set Size",
          callback: data => {
            Store.instance.setSceneProperty("noteSetSize", data);
            return data;
          }
        },
        Knob15: {
          label: "End",
          callback: data => {
            Store.instance.setSelectedTrackProperty("end", data);
            return data;
          }
        },
        Knob16: {
          label: "Follow",
          callback: data => {
            let index = data % (Store.TRACK_COUNT + 1);
            let name;
            if (index === Store.TRACK_COUNT) {
              Store.instance.setSelectedTrackProperty("follow", null);
              name = "none";
            } else {
              let tracks = Store.instance.scene.tracks;
              Store.instance.setSelectedTrackProperty("follow", index);
              name = tracks[index].name;
            }
            return name;
          }
        }
      }
    };
  }

  /***
   *
   * @param index
   * @returns {*}
   */
  selectTrack(index) {
    Store.instance.setPerformanceProperty("selectedTrack", index);
    let tracks = Store.instance.scene.tracks;
    return tracks[Store.instance.performance.selectedTrack].name;
  }

  /***
   *
   * @param index
   */
  queueScene(index) {
    if (typeof Store.instance.scene.options.resetEvent === "number") {
      this.queuedSceneIndex = index;
      Log.music(`Queue scene ${index + 1}`);
    } else {
      this.selectScene(index);
    }
  }

  /***
   *
   * @param index
   */
  selectScene(index) {
    this.queuedSceneIndex = null;
    Store.instance.setPerformanceProperty("selectedScene", index);
    let sceneOptions = Store.instance.scene.options;
    this.cvEvent("scene", 1);
    this.cvEvent("cv", sceneOptions.modA, "a");
    this.cvEvent("cv", sceneOptions.modB, "b");
    this.cvEvent("cv", sceneOptions.modC, "c");
    this.cvEvent("cv", sceneOptions.modD, "d");
    Log.music(`Select scene ${index + 1}`);
  }

  /***
   *
   * @param index
   * @returns {MidiDevice|boolean}
   */
  isTrackMidiAvailable(index) {
    let track = Store.instance.scene.tracks[index];
    let instrument = ExternalDevices.instruments[track.instrument];
    return MidiDevice.getInstance(instrument.device) && true;
  }

  /***
   *
   */
  generateAllTracks() {
    for (let i = 0; i < Store.TRACK_COUNT; i++) {
      this.tracks[i].generateAllSequences();
    }
  }

  /***
   *
   */
  generateNoteSet() {
    Store.instance.setSceneProperty(
      "noteSet",
      SequenceData.generateNoteSet(
        Store.instance.scene.options.minNote,
        Store.instance.scene.options.maxNote,
        Store.instance.scene.options.noteSetSize
      )
    );
  }
}

module.exports = Performance;
