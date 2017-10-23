const PerformanceArrangement = require("../performance-arrangement");


class Arrangement16 extends PerformanceArrangement {

    get defaultState() {
        let state = {
            stageCount: 3,
            stageIndex: 0,
            evolveAmount: 0.5,
            enableEvolve: false,
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
                algorithm: "random",
                density: 0.5,
                min: 8,
                max: 16,
                stages: [1, 2, 1]
            },
            mono2: {
                instrument: "BSPSeq2",
                rate: 2,
                low: 24,
                high: 64,
                algorithm: "random",
                density: 0.5,
                min: 8,
                max: 16,
                stages: [1, 1, 2]
            },
            poly1: {
                instrument: "Minilogue",
                rate: 1,
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
                algorithm: "perc",
                density: 0.5,
                min: 32,
                max: 32,
                stages: [2, 1, 2]
            },
            perc2: {
                instrument: "BSPDrum",
                rate: 2,
                algorithm: "perc",
                density: 0.5,
                min: 16,
                max: 16,
                stages: [1, 1, 1]
            },
            perc3: {
                instrument: "BSPDrum",
                rate: 2,
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
        return "perf_16_x3";
    }

}
module.exports = Arrangement16;