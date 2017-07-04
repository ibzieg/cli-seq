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

    get chord() {
        return this._options.chord;
    }

    get harmonizer() {
        return this._harmonizer;
    }

    constructor(options) {
        this._options = options;
        this._instrument = new MidiInstrument(options.instrument);
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
        let clockMod = Math.floor(24 / this.rate);
        if (this._count % clockMod === 0) {
            let event = this.data[this._index];
            if (event && event.length) {
                this.play(event[0], event[1], event[2]);
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
            if (this._options.onEnd) {
                this._options.onEnd();
            }
            this._signalEnd = false;
        }
    }

    play(note, velocity, duration) {
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

    start() {
        this.reset();
    }

    stop() {
        this.reset();
    }

    reset() {
        this._count = 0;
        this._index = 0;
    }

}
module.exports = Sequencer;