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

const Log = require("./../display/log-util");
const MidiDevice = require("./../midi/midi-device");
const ExternalDevices = require("../midi/external-devices");
const SequenceGraph = require("./sequence-graph");
const NoteQuantizer = require("./note-quantizer");
const Store = require("./store");
const EventScheduler = require("./event-scheduler");

class Sequencer {
  /***
   * @returns {*}
   */
  get state() {
    return Store.instance.scene.tracks[this.props.index];
  }

  /***
   *
   * @returns {MidiDevice}
   */
  get midiDevice() {
    let instrument = ExternalDevices.instruments[this.state.instrument];
    return MidiDevice.getInstance(instrument.device);
  }

  /***
   *
   * @returns {number|*}
   */
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

  /***
   *
   * @param props
   */
  constructor(props) {
    this.props = {
      cvEvent: props.cvEvent,
      index: props.index,
      play: props.play,
      end: props.end
    };

    this.eventScheduler = new EventScheduler();

    this.graph = new SequenceGraph({
      index: props.index
    });

    this.reset();
  }

  /***
   *
   * @param bpm
   */
  clock(bpm) {
    this._bpm = bpm;

    this.eventScheduler.clock();

    if (!this.state) {
      let scene = Store.instance.scene;
      Log.error(
        `state not defined! index=${this.props.index} tracks.length=${
          scene.tracks.length
        }`
      );
      return;
    }

    let clockMod = Math.floor(this.state.partsPerQuant / this.state.rate);
    let arpMod = Math.floor(this.state.partsPerQuant / this.state.arpRate);
    let eventTriggered = false;

    let shouldLoop = true;
    if (typeof this.state.follow === "number") {
      shouldLoop = !this._loopEnd;
    } else if (this.state.loop === false) {
      shouldLoop = !this._loopEnd;
    }

    if (shouldLoop) {
      if (this._count % clockMod === 0) {
        let event = this.data[this._index];
        this.props.cvEvent("step", this._index / this.data.length);
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
          eventTriggered = true;
          if (typeof this.props.play === "function") {
            // TODO this is the unquantized note value
            this.props.play(note, event[1], event[2], event[3]);
          }
          this.play(note, event[1], event[2], event[3]);
        }
        this._index =
          (this._index + 1) % Math.min(this.data.length, this.state.end);
        if (this._index === 0) {
          this._signalEnd = true;
        }
      }

      if (
        !eventTriggered &&
        this.state.arp &&
        this._count % arpMod === 0 &&
        this._arpSeq &&
        this._arpSeq.length > 0
      ) {
        let note = this._arpSeq[this._arpIndex];
        let velocity = this._lastEvent[1];
        let duration = this.getArpNoteDuration();
        this.play(note, velocity, duration, this._lastEvent[3]);

        this._arpIndex = (this._arpIndex + 1) % this._arpSeq.length;
      }
    }

    this._count++;
  }

  /***
   *
   */
  postClock() {
    if (this._signalEnd) {
      if (this.props.end) {
        this.props.end();
      }
      if (typeof this.state.follow !== "number") {
        this.graph.clock();
      }
      this._signalEnd = false;
      this._loopEnd = true;
    }
  }

  /***
   *
   * @returns {string}
   */
  getArpNoteDuration() {
    return this.getNoteDuration(this.state.arpRate * 2) + "n";
  }

  /***
   *
   * @param quant
   * @returns {number}
   */
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
  play(note, velocity, duration, mod) {
    if (this.midiDevice) {
      let chord = NoteQuantizer.makeChord(note);
      if (this.state.note || !chord || chord.length < 1) {
        this.playMidiNote(note, velocity);
        this.playCVNote(note, velocity, mod);
      } else {
        if (this.state.scaleFirst !== false) {
          this.playMidiNote(chord[0], velocity);
          this.playCVNote(chord[0], velocity, mod);
        }
        if (this.state.scaleThird && chord[1]) {
          this.playMidiNote(chord[1], velocity);
        }
        if (this.state.scaleFifth && chord[2]) {
          this.playMidiNote(chord[2], velocity);
        }
      }
    }
  }

  /***
   *
   * @param note
   * @param velocity
   */
  playMidiNote(note, velocity) {
    let ticks = Math.floor(this.state.partsPerQuant / this.state.rate / 2);
    this.eventScheduler.schedule(ticks, () => {
      this.midiDevice.noteOff(this.midiChannel, note, velocity);
    });
    this.midiDevice.noteOn(this.midiChannel, note, velocity);
  }

  /***
   *
   * @param note
   * @param velocity
   * @param mod
   */
  playCVNote(note, velocity, mod) {
    let ticks = Math.floor(this.state.partsPerQuant / this.state.rate / 2);
    this.props.cvEvent("pitch", note);
    this.props.cvEvent("vel", velocity);
    this.props.cvEvent("mod", mod);
    this.props.cvEvent("gate", ticks);
    this.props.cvEvent("tog", ticks);
  }

  /***
   *
   * @param note
   * @returns {*}
   */
  generateArpSeq(note) {
    let superchord = NoteQuantizer.makeChord(note + 12);
    let chord = NoteQuantizer.makeChord(note);
    let subchord = NoteQuantizer.makeChord(note - 12);
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

  /***
   * Generate data to drive the current graph type
   */
  generateGraphData() {
    this.graph.generateData();
  }

  /***
   *
   */
  start() {
    if (typeof this.props.start === "function") {
      this.props.start();
    }
    this.reset();
  }

  /***
   *
   */
  stop() {
    this.eventScheduler.flushAllEvents(this.props.index === 2);
    if (typeof this.props.stop === "function") {
      this.props.stop();
    }
    this._count = 0;
    this.reset();
  }

  /***
   *
   */
  continue() {
    if (typeof this.state.follow === "number") {
      this.graph.clock();
    }
    this._index = 0;
    this._arpIndex = 0;
    this._loopEnd = false;
  }

  /***
   *
   */
  reset() {
    if (typeof this.props.reset === "function") {
      this.props.reset();
    }
    this.midiDevice.allNotesOff(this.midiChannel);
    this._index = 0;
    this._arpIndex = 0;
    this._loopEnd = false;
    this.graph.reset();
  }
}

module.exports = Sequencer;
