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
const Sequencer = require("./sequencer");
const SequenceData = require("./sequence-data");
const Store = require("./store");

class Track {
  get state() {
    return Store.instance.scene.tracks[this.props.index];
  }

  constructor(props) {
    this.props = {
      index: props.index,
      playEvent: props.playEvent,
      endEvent: props.endEvent
    };

    this.sequencer = new Sequencer({
      index: props.index,
      cvEvent: props.cvEvent,
      play: (note, velocity, duration) => {
        this.playEvent(note, velocity, duration);
      },
      end: () => {
        this.endEvent();
      }
    });
  }

  endEvent() {
    if (typeof this.props.endEvent === "function") {
      this.props.endEvent();
    }
  }

  playEvent(note, velocity, duration) {
    if (typeof this.props.playEvent === "function") {
      this.props.playEvent(note, velocity, duration);
    }
  }

  clock(bpm) {
    // do all the sequencer things
    // look up the midi instrument and send events
    // the sequencer things will require helper methods
    this.sequencer.clock(bpm);
  }

  continue() {
    this.sequencer.continue();
  }

  postClock() {
    this.sequencer.postClock();
  }

  start() {
    this.sequencer.start();
  }

  stop() {
    this.sequencer.stop();
  }

  reset() {
    this.sequencer.reset();
  }

  /***
   * Generate data to drive the current graph type
   */
  generateGraphData() {
    this.sequencer.generateGraphData();
  }

  /***
   * Generate a sequence of events based on selected sequence type
   * @param index
   */
  generateSequenceData(index) {
    let data = [...this.state.sequenceData];
    data[index] = SequenceData.getSequence(
      this.generateRandomNote.bind(this),
      this.state
    );
    Store.instance.setTrackProperty(this.props.index, "sequenceData", data);
  }

  /***
   * Generate all patterns
   */
  generateAllSequences() {
    let data = [];
    for (let i = 0; i < Store.SEQUENCE_COUNT; i++) {
      data[i] = SequenceData.getSequence(
        this.generateRandomNote.bind(this),
        this.state
      );
    }
    Store.instance.setTrackProperty(this.props.index, "sequenceData", data);
    this.generateGraphData();
  }

  /**
   *
   * @returns {[*,*,string,*]}
   */
  generateRandomNote() {
    let note;
    if (typeof this.state.note === "number") {
      note = this.state.note;
    } else {
      let noteSet = Store.instance.scene.options.noteSet;
      let i = Math.round(Math.random() * (noteSet.length - 1));
      note = noteSet[i];
    }

    let velocity;
    if (typeof this.state.velocity === "number") {
      velocity = this.state.velocity;
    } else {
      velocity = Math.round(Math.random() * 127);
    }

    return [
      note,
      velocity,
      "8n", // duration
      Math.random() // cv
    ];
  }
}

module.exports = Track;
