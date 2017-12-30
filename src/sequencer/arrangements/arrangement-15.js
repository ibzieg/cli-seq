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

const PerformanceArrangement = require("../performance-arrangement");


class Arrangement15 extends PerformanceArrangement {

    get defaultState() {
        let state = {
            stageCount: 3,
            stageIndex: 0,
            evolveAmount: 0.5,
            enableEvolve: false,
            noteSet: [64],
            noteSetSize: 15,
            rainmakerCVTickCountMin: 12,
            rainmakerCVTickCountMax: 36,
            data: {
                mono1: [[]],
                mono2: [[]],
                poly1: [[]],
                perc1: [[]],
                perc2: [[]],
                perc3: [[]],
                perc4: [[]]
            },
            mono1: {
                instrument: "BSPSeq1",
                rate: 2,
                low: 24,
                high: 64,
                algorithm: "ryk",
                density: 0.5,
                min: 16,
                max: 16,
                stages: [1, 1, 1]
            },
            mono2: {
                instrument: "BSPSeq2",
                rate: 2,
                low: 24,
                high: 64,
                algorithm: "ryk",
                density: 0.5,
                min: 32,
                max: 32,
                stages: [1, 1, 2]
            },
            poly1: {
                instrument: "Minilogue",
                rate: 4,
                low: 36,
                high: 72,
                algorithm: "random",
                density: 0.5,
                min: 8,
                max: 16,
                stages: [2, 1, 1]
            },
            perc1: {
                instrument: "BSPDrum",
                rate: 4,
                algorithm: "quarterbeat",
                density: 0.5,
                min: 16,
                max: 16,
                stages: [1, 1, 1]
            },
            perc2: {
                instrument: "BSPDrum",
                rate: 4,
                algorithm: "halfbeat",
                density: 0.5,
                min: 16,
                max: 16,
                stages: [1, 1, 1]
            },
            perc3: {
                instrument: "BSPDrum",
                rate: 4,
                algorithm: "perc",
                density: 0.5,
                min: 16,
                max: 16,
                stages: [0, 1, 1]
            },
            perc4: {
                instrument: "BSPDrum",
                rate: 4,
                algorithm: "perc",
                density: 0.5,
                min: 16,
                max: 16,
                stages: [1, 0, 1]
            }
        };
        return state;
    }

    get title() {
        return "perf_15-str8";
    }

}
module.exports = Arrangement15;