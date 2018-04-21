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
const ExternalDevices = require("../midi/external-devices");

const Store = require("./store");

class Sequencer {

    get state() {
        return Store.instance.scene.tracks[this.props.index];
    }

    get midiDevice() {
        let instrument = ExternalDevices.instruments[this.state.instrument];
        return MidiDevice.getInstance(instrument.device);
    }

    get midiChannel() {
        let instrument = ExternalDevices.instruments[this.state.instrument];
        return instrument.channel;
    }

/*    get harmonizer() {
        return this._harmonizer;
    }*/

    constructor(props) {
        this.props = {
            index: props.index,
            play: props.play,
            end: props.end
        };

/*        if (this.chord) {
            this.initializeChord();
        }*/
        this.reset();
    }

/*    initializeChord() {
        this._harmonizer = new ChordHarmonizer({
            root: this.chord.root,
            mode: this.chord.mode
        });
    }*/

    clock(bpm) {
        this._bpm = bpm;

        let clockMod = Math.floor(this.state.partsPerQuant / this.state.rate);
        let arpMod = Math.floor(this.state.partsPerQuant / this.state.arpRate);

        if (this._count % clockMod === 0) {
            let event = this.data[this._index];
            if (event && event.length && this.state.enabled) {

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
                if (typeof this.props.play === "function") {
                    this.props.play(this._index, event);
                } else {
                    this.play(event[0], event[1], event[2]);
                }
                
                
            }
            this._index = (this._index+1) % this.data.length;
            if (this._index === 0) {
                this._signalEnd = true;
            }
        } else if (this.state.arpMode && this._count % arpMod === 0 && this._arpSeq && this._arpSeq.length > 0) {
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
            if (this.props.end) {
                this.props.end();
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
        const ppq = this.state.partsPerQuant;
        const bpm = this._bpm;

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

        if (this.midiDevice) {
            if (!this.harmonizer) {
                this.midiDevice.play(this.midiChannel, note, velocity, duration);
            } else {
                let chord = this.harmonizer.makeChord(note);
                if (this.chord.first !== false) {
                    this.midiDevice.play(this.midiChannel, chord[0], velocity, duration);
                }
                if (this.chord.third && chord[1]) {
                    this.midiDevice.play(this.midiChannel, chord[1], velocity, duration);
                }
                if (this.chord.fifth && chord[2]) {
                    this.midiDevice.play(this.midiChannel, chord[2], velocity, duration);
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