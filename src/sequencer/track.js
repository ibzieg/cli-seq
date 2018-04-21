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

class Track {

    constructor(props) {
        this.props = {
            index: props.index
        }
    }

    clock() {
        // do all the sequencer things
        // look up the midi instrument and send events
        // the sequencer things will require helper methods
    }

    /***
     * Generate sequence for playing the pattern data.
     */
    generateSequence() {
        // generate sequence data
    }

    /***
     * Generate a pattern of events based on selected pattern type
     * @param index
     */
    generatePattern(index) {

    }

    /***
     * Generate all patterns
     */
    generatePatterns() {

    }

}