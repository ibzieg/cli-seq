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

    constructor(props) {
        this.props = {
            index: props.index
        };

        this.sequencer = new Sequencer({
            index: props.index
        });
    }

    clock(bpm) {
        // do all the sequencer things
        // look up the midi instrument and send events
        // the sequencer things will require helper methods
        this.sequencer.clock(bpm);
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

    /***
     * Generate a sequence of events based on selected sequence type
     * @param index
     */
    generateSequenceData(index) {
        // generate sequence data
    }

    /***
     * Generate data to drive the current graph type
     */
    generateGraphData() {

    }

    /***
     * Generate all patterns
     */
    generateAllSequences() {

    }

    generateNoteSet() {
        Store.instance.setSceneProperty("noteSet",
            SequenceData.generateNoteSet(
                Store.instance.scene.options.minNote,
                Store.instance.scene.options.maxNote,
                Store.instance.scene.options.noteSetSize
            ));
    }

    generateRandomNoteFromSet() {
        let noteSet = Store.instance.scene.options.noteSet;
        let i = Math.round(Math.random() * (noteSet.length-1));
        return [
            noteSet[i], // note
            Math.round(Math.random()*127), // velocity
            "8n", // duration
            Math.random() // cv
        ]
    }

}

module.exports = Track;