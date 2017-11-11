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

const MidiInstrument = require("./../midi/midi-instrument");
const ChordHarmonizer = require("./chord-harmonizer");

class Sequencer {

    get instrument() {
        return this._instrument
    }

    set instrument(value) {
        this._instrument = new MidiInstrument(value);
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
        this.setState({
            rate: value
        });
    }

    get arpRate() {
        return this._options.arpRate;
    }

    set arpRate(value) {
        this.setState({
            arpRate: value
        });
    }

    get arpMode() {
        return (typeof this._options.arpMode !== "string" || this._options.arpMode === "none") ?
            undefined : this._options.arpMode;
    }

    set arpMode(value) {
        this.setState({
            arpMode: value
        });
    }
    
    get chord() {
        return this._options.chord;
    }

    set chord(value) {
        this._options.chord = value;
        this.harmonizer.root = value.root;
        this.harmonizer.mode = value.mode;
    }

    get enabled() {
        return this._options.enabled === true;
    }

    set enabled(value) {
        this._options.enabled = value;
    }

    get harmonizer() {
        return this._harmonizer;
    }

    constructor(options) {
        this._options = Object.assign({
            enabled: true
        },options);
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

    setState(changes) {
        this._options = Object.assign(this._options, changes);
        if (this._options.setState) {
            this._options.setState(changes);
        }
    }

    initializeChord() {
        this._harmonizer = new ChordHarmonizer({
            root: this.chord.root,
            mode: this.chord.mode
        });
    }

    clock(bpm) {
        this._options.bpm = bpm;

        let clockMod = Math.floor(this._options.partsPerQuant / this.rate);
        let arpMod = Math.floor(this._options.partsPerQuant / this.arpRate);

        if (this._count % clockMod === 0) {
            let event = this.data[this._index];
            if (event && event.length && this.enabled) {

                this._lastEvent = [...event];
                // Set up arpeggiator for this note event
                if (this.harmonizer) {
                    this._arpSeq = this.generateArpSeq(event[0]);

                } else {
                    this._arpSeq = [];
                }
                this._arpIndex = 1;

                if (this.arpMode) {
                    // override duration with arp note length
                    event[2] = this.getArpNoteDuration();
                }

                // Execute the event
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
        } else if (this.arpMode && this._count % arpMod === 0 && this._arpSeq && this._arpSeq.length > 0) {
            //Log.debug(`playing arp mode '${this.arpMode}' at rate=${this.arpRate}`);
            let note = this._arpSeq[this._arpIndex];
            let velocity = this._lastEvent[1];
            let duration = this.getArpNoteDuration();
            this.play(note, velocity, duration);

            this._arpIndex = (this._arpIndex+1) % this._arpSeq.length;

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

    getArpNoteDuration() {
        return this.getNoteDuration(this.arpRate * 2) + "n";
    }

    getNoteDuration(quant) {
        quant = parseInt(quant);

        const millisPerMin = 60000;
        const ppq = this._options.partsPerQuant;
        const bpm = this._options.bpm;

        let millisPerQuarter = millisPerMin / bpm;
        let duration = (4.0 / quant) * millisPerQuarter;

        return duration;
    }

    /***
     *
     * @param note
     * @param velocity
     * @param duration
     * @returns {void}
     */
    play(note, velocity, duration) {

        if (typeof duration === "string") {
            duration = this.getNoteDuration(duration);
        }

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

    generateArpSeq(note) {
        let superchord = this.harmonizer.makeChord(note+12);
        let chord = this.harmonizer.makeChord(note);
        let subchord = this.harmonizer.makeChord(note-12);
        switch (this.arpMode) {
            case "up1":
                return [chord[0], chord[1]];
            case "up2":
                return [chord[0], chord[1], chord[2]];
            case "up3":
                return [chord[0], chord[1], chord[2], superchord[0]];
            case "up2alt":
                return [chord[0], chord[2], chord[1]];
            case "up3alt":
                return [chord[0], chord[2], chord[1], superchord[0]];
            case "down1":
                return [chord[0], subchord[2]];
            case "down2":
                return [chord[0], subchord[2], subchord[1]];
            case "down3":
                return [chord[0], subchord[2], subchord[1], subchord[0]];
            case "down2alt":
                return [chord[0], subchord[1], subchord[2]];
            case "down3alt":
                return [chord[0], subchord[1], subchord[2], subchord[0]];
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
        this._count = 0;
        this.reset();
    }

    reset() {
        if (typeof this._options.reset === "function") {
            this._options.reset();
        }
        this._index = 0;
        this._arpIndex = 0;
    }

}
module.exports = Sequencer;