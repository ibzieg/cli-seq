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

const Store = require("./store");

class SequenceGraph {

    get type() {
        let trackState = Store.instance.scene.tracks[this.props.index];
        return trackState.graphType;
    }

    get data() {
        let trackState = Store.instance.scene.tracks[this.props.index];
        return trackState.graphData;
    }

    get sequence() {
        return this.data[this.index];
    }

    get index() {
        // TODO Determine the index based on state.count & type
        return 0;
    }

    constructor(props) {
        this.props = {
            index: props.index
        };

        this.state = {
            count: 0
        };
    }

    clock() {
        this.state = Object.assign({}, this.state, { count: this.state.count++ });
    }

    reset() {
        this.state.count = 0;
    }

}
module.exports = SequenceGraph;