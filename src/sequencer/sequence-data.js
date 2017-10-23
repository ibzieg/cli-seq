
class SequenceData {

    /***
     *
     * @returns {Array}
     */
    static getRandomNote(min, max, duration) {
        if (!duration) {
            duration = "8n";
        }
        return [Math.floor(min+Math.random()*(max-min+1)), 127, duration, Math.random()];
    }

    static getSequence(fn, config) {
        switch (config.algorithm) {
            case "perc":
                return SequenceData.getRandomPercData(fn, config);
            case "random":
            default:
                return SequenceData.getRandomSequence(fn, config);
        }
    }

    /***
     *
     * @param nextNote
     * @param config
     * @returns {Array}
     */
    static getRandomSequence(nextNote, config) {
        let min = config.min;
        let max = config.max;
        let density = config.density;
        // min = Math.floor(min/2)*2; // force even
        // max = Math.floor(max/2)*2; // force even
        if (density < 0) density = 0;
        if (density > 1) density = 1;
        let length = Math.floor(min+Math.random()*(max-min+1));
        if (length % 2 !== 0) {
            length = length + 1;
        }
        let seq = [];
        for (let i = 0; i < length; i++) {
            if (Math.random() < density) {
                if (i % 2 !== 0 && Math.random() < density) {
                    //seq.push(null);
                    seq[i] = null;
                } else {
                    //seq.push(nextNote());
                    seq[i] = nextNote();
                }
            } else {
                seq.push(null);
            }
        }
        return seq;
    }

    /***
     *
     * @param makeSnare
     * @param config
     * @returns {Array}
     */
    static getRandomPercData(makeSnare, config) {
        let min = config.min;
        let max = config.max;
        let d = config.density;

        min = Math.floor(min/2)*2; // force even
        max = Math.floor(max/2)*2; // force even
        let length = Math.floor(min+Math.random()*(max-min+1));

        let density = [0.4*d, 0.3*d, 0.2*d, 0.1*d];
        let half = Math.floor(length/2.0);
        let fourth = Math.floor(length/4.0);
        let eighth = Math.floor(length/8.0);
        let sixteenth = Math.floor(length/16.0);

        let seq = [];
        for (let i = 0; i < length; i++) {

            if (i !== 0 && (
                    (i % half === 0 && density[0] > Math.random()) ||
                    (i % fourth === 0 && density[1] > Math.random()) ||
                    (i % eighth === 0 && density[2] > Math.random()) ||
                    (i % sixteenth === 0 && density[3] > Math.random())
                )) {
                seq.push(makeSnare());
            } else {
                seq.push(null);
            }
        }
        return seq;

    }

    static getRandomEven(min, max) {
        min = Math.floor(min/2)*2; // force even
        max = Math.floor(max/2)*2; // force even
        return Math.floor(min+Math.random()*(max-min+1));
    }

    static evolveSequence(oldSeq, newSeq, prob) {

        let p = Math.random();
        let delta = 0;
        let length = oldSeq.length;
        if (p < prob) {
            if (oldSeq.length < newSeq.length) {
                delta = newSeq.length - oldSeq.length;
                delta = Math.ceil(p * delta);
                if (delta % 2 !== 0) {
                    delta = delta + 1;
                }
                length = length + delta;
            } else if (oldSeq.length > newSeq.length) {
                delta = oldSeq.length - newSeq.length;
                delta = Math.ceil(p * delta);
                if (delta % 2 !== 0) {
                    delta = delta + 1;
                }
                length = length - delta;
            }
        }

        let seq = [];
        for (let i = 0; i < length; i++) {
            if (i < oldSeq.length) {
                if (Math.random() < prob) {
                    seq.push(newSeq[i]);
                } else {
                    seq.push(oldSeq[i]);
                }
            } else if (i < newSeq.length) {
                seq.push(newSeq[i]);
            }
        }

        return seq;

    }

    static toString(seq) {
        return seq.map((v) => v ? v[0] : "__").join(" ");
    }

}
module.exports = SequenceData;