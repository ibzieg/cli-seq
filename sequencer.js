const MidiInstrument = require("./midi-instrument");
const ChordHarmonizer = require("./chord-harmonizer");

class Sequencer {

    get instrument() {
        return this._instrument
    }

    set data(value) {
        this._options.data = value;
    }

    get data() {
        return this._options.data;
    }

    get rate() {
        return this._options.rate;
    }

    set rate(value) {
        this._options.rate = value;
    }

    get chord() {
        return this._options.chord;
    }

    set chord(value) {
        this._options.chord = value;
        this.harmonizer.root = value.root;
        this.harmonizer.mode = value.mode;
    }

    get harmonizer() {
        return this._harmonizer;
    }

    constructor(options) {
        this._options = options;
        if (options.instrument) {
            this._instrument = new MidiInstrument(options.instrument);
        }

        this._options.partsPerQuant = options.partsPerQuant ? options.partsPerQuant : 24;
        this._options.rate = options.rate ? options.rate : 1;

        if (this.chord) {
            this.initializeChord();
        }
        this.reset();
    }

    initializeChord() {
        this._harmonizer = new ChordHarmonizer({
            root: this.chord.root,
            mode: this.chord.mode
        });
    }

    clock() {
        let clockMod = Math.floor(this._options.partsPerQuant / this.rate);
        if (this._count % clockMod === 0) {
            let event = this.data[this._index];
            if (event && event.length) {
                if (typeof this._options.play === "function") {
                    this._options.play(this._index, event);
                } else {
                    this.play(event[0], event[1], event[2]);
                }
            }
            this._index = (this._index+1) % this.data.length;
            if (this._index === 0) {
                this._signalEnd = true;
            }
        }
        this._count++;
    }

    postClock() {
        if (this._signalEnd) {
            if (this._options.end) {
                this._options.end();
            }
            this._signalEnd = false;
        }
    }

    /***
     *
     * @param note
     * @param velocity
     * @param duration
     * @returns {void}
     */
    play(note, velocity, duration) {
        if (this.instrument) {
            if (!this.harmonizer) {
                this.instrument.play(note, velocity, duration);
            } else {
                let chord = this.harmonizer.makeChord(note);
                if (this.chord.first !== false) {
                    this.instrument.play(chord[0], velocity, duration);
                }
                if (this.chord.third && chord[1]) {
                    this.instrument.play(chord[1], velocity, duration);
                }
                if (this.chord.fifth && chord[2]) {
                    this.instrument.play(chord[2], velocity, duration);
                }
                this.instrument.play(note, velocity, duration);
            }
        }
    }

    start() {
        if (typeof this._options.start === "function") {
            this._options.start();
        }
        this.reset();
    }

    stop() {
        if (typeof this._options.stop === "function") {
            this._options.stop();
        }
        this.reset();
    }

    reset() {
        if (typeof this._options.reset === "function") {
            this._options.reset();
        }
        this._count = 0;
        this._index = 0;
    }

}
module.exports = Sequencer;