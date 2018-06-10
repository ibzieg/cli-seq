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


const MidiDevice = require("./../midi/midi-device");
const MidiInstrument = require("./../midi/midi-instrument");
// const ChordHarmonizer = require("./chord-harmonizer");
const ExternalDevices = require("../midi/external-devices");
const SequenceGraph = require("./sequence-graph");
const NoteQuantizer = require("./note-quantizer");

const Log = require("./../display/log-util");

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

    /***
     * Get the correct sequence based on the graph and graph counter
     */
    get data() {
        return this.graph.sequence;
    }

    constructor(props) {
        this.props = {
            index: props.index,
            play: props.play,
            end: props.end
        };

        this.graph = new  SequenceGraph({
            index: props.index
        });

/*        if (this.chord) {
            this.initializeChord();
        }*/
        this.reset();
    }

    clock(bpm) {
        this._bpm = bpm;

        if (!this.state) {
            let scene = Store.instance.scene;
            Log.error(`state not defined! index=${this.props.index} tracks.length=${scene.tracks.length}`);
            return;
        }

        let clockMod = Math.floor(this.state.partsPerQuant / this.state.rate);
        let arpMod = Math.floor(this.state.partsPerQuant / this.state.arpRate);

        if (this._count % clockMod === 0) {
            let event = this.data[this._index];
            if (event && event.length && this.state.enabled) {

                let note = event[0];
                if (typeof this.state.octave === "number") {
                    note += this.state.octave * 12;
                }

                this._lastEvent = [...event];
                // Set up arpeggiator for this note event
                this._arpSeq = this.generateArpSeq(note);
                this._arpIndex = 1;

                if (this.state.arp) {
                    // override duration with arp note length
                    event[2] = this.getArpNoteDuration();
                }

                // Execute the event
                if (typeof this.props.play === "function") {
                    this.props.play(this._index, event);
                } else {
                    this.play(note, event[1], event[2]);
                }

            }
            this._index = (this._index+1) % this.data.length; // TODO
            if (this._index === 0) {
                this._signalEnd = true;
            }
        } else if (this.state.arp && this._count % arpMod === 0 && this._arpSeq && this._arpSeq.length > 0) {
            //Log.debug(`playing arp mode '${this.state.arp}' at rate=${this.state.arpRate}`);
            let note = this._arpSeq[this._arpIndex];
            let velocity = this._lastEvent[1];
            let duration = this.getArpNoteDuration();
            Log.debug(`play arp note: ${note} ${velocity} ${duration}`);
            this.play(note, velocity, duration);

            this._arpIndex = (this._arpIndex+1) % this._arpSeq.length;

        }
        this._count++;
    }

    postClock() {
        if (this._signalEnd) {
            if (this.props.end) {
                this.graph.clock();
                this.props.end();
            }
            this._signalEnd = false;
        }
    }

    getArpNoteDuration() {
        return this.getNoteDuration(this.state.arpRate * 2) + "n";
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

        // TODO implement track properties loop, note, follow
        if (this.props.index == 0) {
            Log.debug(`track[0].play `);
        }

        if (typeof duration === "string") {
            duration = this.getNoteDuration(duration);
        }

        if (this.midiDevice) {
            let chord = NoteQuantizer.makeChord(note);
            if (this.state.note || !chord || chord.length < 1) {
                this.midiDevice.play(this.midiChannel, note, velocity, duration);
            } else {
                if (this.state.scaleFirst !== false) {
                    this.midiDevice.play(this.midiChannel, chord[0], velocity, duration);
                }
                if (this.state.scaleThird && chord[1]) {
                    this.midiDevice.play(this.midiChannel, chord[1], velocity, duration);
                }
                if (this.state.scaleFifth && chord[2]) {
                    this.midiDevice.play(this.midiChannel, chord[2], velocity, duration);
                }
                //this.instrument.play(note, velocity, duration);
            }
        }

    }

    generateArpSeq(note) {
        let superchord = NoteQuantizer.makeChord(note+12);
        let chord = NoteQuantizer.makeChord(note);
        let subchord = NoteQuantizer.makeChord(note-12);
        switch (this.state.arp) {
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
        if (typeof this.props.start === "function") {
            this.props.start();
        }
        this.reset();
    }

    stop() {
        if (typeof this.props.stop === "function") {
            this.props.stop();
        }
        this._count = 0;
        this.reset();
    }

    reset() {
        if (typeof this.props.reset === "function") {
            this.props.reset();
        }
        this._index = 0;
        this._arpIndex = 0;
        this.graph.reset();
    }

}
module.exports = Sequencer;