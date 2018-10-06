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

const Notes = [
    { Name: "C" , Type: "natural" },
    { Name: "C#", Type: "sharp"   },
    { Name: "D" , Type: "natural" },
    { Name: "D#", Type: "sharp"   },
    { Name: "E" , Type: "natural" },
    { Name: "F" , Type: "natural" },
    { Name: "F#", Type: "sharp"   },
    { Name: "G" , Type: "natural" },
    { Name: "G#", Type: "sharp"   },
    { Name: "A" , Type: "natural" },
    { Name: "A#", Type: "sharp"   },
    { Name: "B" , Type: "natural" }
];

const Modes = [
    { Name: "I Ionian (Major)",        Sequence: [2, 2, 1, 2, 2, 2, 1] },
    { Name: "II Dorian",               Sequence: [2, 1, 2, 2, 2, 1, 2] },
    { Name: "III Phrygian",            Sequence: [1, 2, 2, 2, 1, 2, 2] },
    { Name: "IV Lydian",               Sequence: [2, 2, 2, 1, 2, 2, 1] },
    { Name: "V Mixolydian",            Sequence: [2, 2, 1, 2, 2, 1, 2] },
    { Name: "VI Aeolian (Nat. Minor)", Sequence: [2, 1, 2, 2, 1, 2, 2] },
    { Name: "VII Locrian",             Sequence: [1, 2, 2, 1, 2, 2, 2] }
];

class NoteQuantizer {

    static get NoteNames() {
        return Notes.map((note) => {
            return note.Name;
        });
    }

    static get ModeNames() {
        return Modes.map((mode) => {
            return mode.Name;
        });
    }

    /***
     *
     * @returns {*}
     */
    static getSceneScale(sceneOptions) {
        let rootNoteIndex = NoteQuantizer.getNoteIndexFromName(sceneOptions.root) % 11;
        let modeIndex = NoteQuantizer.getModeIndexFromName(sceneOptions.mode) % 6;
        return NoteQuantizer.generateScaleFromIndex(rootNoteIndex, modeIndex, false);
    }

    /***
     *
     * @param noteName
     * @returns {number}
     */
    static getNoteIndexFromName(noteName) {
        let i, n;
        for (i = 0, n = Notes.length; i < n; i++) {
            if (noteName == Notes[i].Name) {
                return i;
            }
        }
    };

    /***
     *
     * @param modeName
     * @returns {number}
     */
    static getModeIndexFromName(modeName) {
        let i, n;
        for (i = 0, n = Modes.length; i < n; i++) {
            if (modeName == Modes[i].Name) {
                return i;
            }
        }
    };

    /***
     *
     * @param rootIndex
     * @param scaleIndex
     * @param isPentatonic
     * @returns {Array}
     */
    static generateScaleFromIndex(rootIndex, scaleIndex, isPentatonic) {
        if (typeof isPentatonic !== "boolean") {
            isPentatonic = false;
        }

        if (rootIndex < 0 || rootIndex > Notes.length - 1) {
            return [];
        } else if (scaleIndex < 0 || scaleIndex > Modes.length - 1) {
            return [];
        }

        let scaleNotes = [];
        let noteIndex = rootIndex;
        let scaleObj = Modes[scaleIndex];
        for (let i = 0, n = scaleObj.Sequence.length; i < n; i++) {
            let curNote = Notes[noteIndex % Notes.length];
            if (curNote) {
                scaleNotes.push(curNote.Name);
            }
            noteIndex += scaleObj.Sequence[i];
        }

        if (isPentatonic) {
            delete scaleNotes[1];
            delete scaleNotes[5];
        }

        return scaleNotes;
    };

    /***
     *
     * @param triad
     * @returns {boolean}
     */
    static isTriadMemberOfScale(triad, scale) {
        if (scale.indexOf(triad[0]) >= 0 &&
            scale.indexOf(triad[1]) >= 0 &&
            scale.indexOf(triad[2]) >= 0) {
            return true;
        }
    };

    /***
     *
     * @param noteIndex
     * @returns {*}
     */
    static getHarmonizedChord(noteIndex, scale) {
        // generate all the chords corresponding to this note
        // major triad
        // minor triad (transposed major)
        // aug triad   (major triad with sharpened 5th)
        // dim triad   (major triad with flattened 5th)
        // test if any of the chords are members of the master scale

        let harmonizedChord = {};


        let majorScale = NoteQuantizer.generateScaleFromIndex(noteIndex, 0);
        let minorScale = NoteQuantizer.generateScaleFromIndex(noteIndex, 5);

        let majorTriad = [
            majorScale[0],
            majorScale[2],
            majorScale[4]
        ];

        let diminishedTriad = [
            minorScale[0],
            minorScale[2],
            Notes[NoteQuantizer.getNoteIndexFromName(minorScale[4]) - 1]
        ];
        if (typeof diminishedTriad[2] === "object") {
            diminishedTriad[2] = diminishedTriad[2].Name;
        }

        let augmentedTriad = [
            majorScale[0],
            majorScale[2],
            Notes[NoteQuantizer.getNoteIndexFromName(majorScale[4]) + 1]
        ];
        if (typeof augmentedTriad[2] === "object") {
            augmentedTriad[2] = augmentedTriad[2].Name;
        }

        const minorTriad = [
            minorScale[0],
            minorScale[2],
            minorScale[4]
        ];

        if (NoteQuantizer.isTriadMemberOfScale(majorTriad, scale)) {
            harmonizedChord = {
                Type: "",
                Notes: majorTriad
            };
        } else if (NoteQuantizer.isTriadMemberOfScale(augmentedTriad, scale)) {
            harmonizedChord = {
                Type: "aug",
                Notes: augmentedTriad
            };
        } else if (NoteQuantizer.isTriadMemberOfScale(minorTriad, scale)) {
            harmonizedChord = {
                Type: "min",
                Notes: minorTriad
            };
        } else if (NoteQuantizer.isTriadMemberOfScale(diminishedTriad, scale)) {
            harmonizedChord = {
                Type: "dim",
                Notes: diminishedTriad
            };
        }

        return harmonizedChord ? harmonizedChord.Notes : {};

    };

    /***
     *
     * @param value
     * @returns {*}
     */
    static makeChord(value, scale) {
        // get the triad pattern for this note index, given the key & mode ?
        value--;
        let note = value % 12;
        let octave = Math.floor(value / 12);

        note = note % 6; // keep it on a 7 note scale

        // Use incoming note 0-11 as an index into the current master scale;
        note = NoteQuantizer.getNoteIndexFromName(scale[note]);
        let chord = NoteQuantizer.getHarmonizedChord(note, scale);

        if (chord) {
            return chord.map((noteName) => {
                let chordNoteIndex = NoteQuantizer.getNoteIndexFromName(noteName);
                let octaveOut = octave;
                if (chordNoteIndex < note) {
                    octaveOut++;
                }
                return chordNoteIndex + (octaveOut * 12);
            });
        } else {
            // Log.debug(`makeChord: no chord exists for note=${note} name=${NoteQuantizer.activeScale[note]} scale=${NoteQuantizer.activeScale}`);
            return [];
        }

    }

}
module.exports = NoteQuantizer;