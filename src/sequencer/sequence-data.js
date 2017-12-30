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

class SequenceData {

    static generateNoteSet(min, max, size) {
        let notes = [];
        while (notes.length < size) {
            let note = Math.floor(min+Math.random()*(max-min+1));
            if (notes.indexOf(note) < 0) {
                notes.push(note);
            }
        }
        return notes;
    }

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
            case "euclid":
                return SequenceData.euclidPattern(fn, config);
            case "perc":
                return SequenceData.getRandomPercData(fn, config);
            case "quarterbeat":
                return SequenceData.getQuarterBeat(fn, config);
            case "halfbeat":
                return SequenceData.getHalfBeat(fn, config);
            case "ryk":
                return SequenceData.getRykSequence(fn, config);
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
     * @param nextNote
     * @param config
     * @returns {Array}
     */
    static getRykSequence(nextNote, config) {
        let min = config.min;
        let max = config.max;
        let d = config.density;

        min = Math.floor(min/2)*2; // force even
        max = Math.floor(max/2)*2; // force even
        let length = Math.floor(min+Math.random()*(max-min+1));

        let seq = [];
        let r;

        while (seq.length < length) {
            let note = nextNote();
            note[2] = "16n";
            let repeats = Math.random() > 0.5 ? 1 : SequenceData.getRandomEven(2, 4);
            for (r = 0; r < repeats; r++) {
                seq.push(note);
            }

            let s;
            if (repeats === 1) {
                s = [1, 3, 5];
            } else {
                s = [0, 2, 4]
            }
            let rests = s[Math.round((1.0 - d) * Math.random() * 2)];
            for (r = 0; r < rests; r++) {
                seq.push(null);
            }
        }

        if (seq.length > length) {
            seq = seq.slice(0, length);
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

    /***
     *
     * @param makeSnare
     * @param config
     * @returns {Array}
     */
    static getQuarterBeat(nextNote, config) {
        let min = config.min;
        let max = config.max;
        let d = config.density;

        min = Math.floor(min/2)*2; // force even
        max = Math.floor(max/2)*2; // force even
        let length = Math.floor(min+Math.random()*(max-min+1));

        let quarter = Math.round(length / 4);
        let seq = [];
        for (let i = 0; i < length; i++) {
            if (i % quarter === 0) {
                seq.push(nextNote());
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
    static getHalfBeat(nextNote, config) {
        let min = config.min;
        let max = config.max;
        let d = config.density;

        min = Math.floor(min/2)*2; // force even
        max = Math.floor(max/2)*2; // force even
        let length = Math.floor(min+Math.random()*(max-min+1));

        let quarter = Math.round(length / 4);
        let half = Math.round(length / 2);

        let seq = [];

        for (let i = 0; i < length; i++) {
            if (i % quarter === 0 && i % half !== 0) {
                seq.push(nextNote());
            } else {
                seq.push(null);
            }
        }

        return seq;

    }


    static euclidPattern(nextNote, config) {
        let min = config.min ? config.min : (config.max ? config.max : config.n);
        let max = config.max ? config.max : (config.min ? config.min : config.n);
        min = Math.floor(min/2)*2; // force even
        max = Math.floor(max/2)*2; // force even
        let n = Math.floor(min+Math.random()*(max-min+1));

        let kmin = config.kmin ? config.kmin : (config.kmax ? config.kmax : config.k);
        let kmax = config.kmax ? config.kmax : (config.kmin ? config.kmin : config.k);
        let k = Math.floor(kmin+Math.random()*(kmax-kmin+1));

        let d = config.density ? config.density : 1;

        let i;
        let p = [];
        for (i = 0; i < k; i++) {
            p.push([Math.random() < d ? nextNote() : null]);
        }
        let r = [];
        for (i = 0; i < n-k; i++) {
            r.push([null]);
        }

        return SequenceData.euclid(p, r);
    }

    /***
     * Euclidean common divisor algorithm
     * @param P Pattern sets with equal distribution
     * @param R Remainder sets to be distributed
     * @returns {*}
     */
    static euclid(P, R) {
        if (R.length < 2) {
            // Reached final remainder. Concatenate the results;
            return [ ...P, ...R].reduce((result, item) => {
                return [ ...result, ...item];
            }, []);
        } else {
            let len = Math.min(P.length, R.length);
            let p = [];
            let r = [];
            let j = 0;
            for ( ; j < len; j++) {
                p.push([...P[j], ...R[j]]);
            }
            if (len < P.length) {
                for ( ; j < P.length; j++) {
                    r.push(P[j]);
                }
            } else if (len < R.length) {
                for ( ; j < R.length; j++) {
                    r.push(R[j]);
                }
            }
            return SequenceData.euclid(p, r);
        }

    };


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