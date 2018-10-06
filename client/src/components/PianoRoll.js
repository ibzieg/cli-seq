import React, { Component } from 'react';


import ReactJson from 'react-json-view';

import '../styles/track.css';

import NoteQuantizer from '../linked-classes/note-quantizer';

export default class PianoRoll extends Component {

    getNoteText(value) {
        const scale = NoteQuantizer.getSceneScale(this.props.scene);

        value--;
        let note = value % 12;
        let octave = Math.floor(value / 12);
        note = note % 6; // keep it on a 7 note scale

        // Use incoming note 0-11 as an index into the current master scale;
        note = NoteQuantizer.getNoteIndexFromName(scale[note]);
        let chord = NoteQuantizer.getHarmonizedChord(note, scale);

        if (chord) {
            return `${value} (${chord[0]})`;
        } else {
            return `${value}`;
        }
    }

    render() {
        let noteRange = [];
        if (this.props.track.note) {
            noteRange.push(this.props.track.note);
        } else {
            for (let i = this.props.scene.maxNote; i >= this.props.scene.minNote; i--) {
                noteRange.push(i);
            }
        }

        let w = `${100.0 / (this.props.data.length+1)}%`;

        return (
            <div className="piano-roll">
                {noteRange.map((v, i) =>
                    (<div className="piano-roll-row">
                        <div style={{width: w, maxWidth: w}} className="piano-roll-cell piano-cell-highlight">
                            {this.getNoteText(v)}
                        </div>
                        {this.props.data.map((note, j) => {

                            //let className = `piano-roll-cell ${note && note[0] === v ? 'piano-cell-note' : ''}`;
                            let className = `piano-roll-cell`;
                            if (note && note[0] === v) {
                                className += ` piano-cell-note`;
                            } else if ((j % 4) === 0) {
                                className += ` piano-cell-quarter`;
                            }

                            return (<div style={{width: w, maxWidth: w}} className={className}>
                                { note && note[0] === v ? <span>{this.getNoteText(note[0])}</span>
                                    : <span>{'-'}</span>}

                            </div>)
                        })}
                    </div>))}
            </div>
        );
    }
}