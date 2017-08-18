const Log = require("../display/log-util");


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
    { Name: "I Ionian (Major)",       Sequence: [2, 2, 1, 2, 2, 2, 1] },
    { Name: "II Dorian",               Sequence: [2, 1, 2, 2, 2, 1, 2] },
    { Name: "III Phrygian",             Sequence: [1, 2, 2, 2, 1, 2, 2] },
    { Name: "IV Lydian",               Sequence: [2, 2, 2, 1, 2, 2, 1] },
    { Name: "V Mixolydian",           Sequence: [2, 2, 1, 2, 2, 1, 2] },
    { Name: "VI Aeolian (Nat. Minor)", Sequence: [2, 1, 2, 2, 1, 2, 2] },
    { Name: "VII Locrian",             Sequence: [1, 2, 2, 1, 2, 2, 2] }
];



class ChordHarmonizer {

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

    set mode(value) {
        this._modeIndex = this.getModeIndexFromName(value) % 6;
        this._masterScale = this.generateScaleFromIndex(this._rootNoteIndex, this._modeIndex);
    }

    set root(value) {
        this._rootNoteIndex = this.getNoteIndexFromName(value) % 11;
        this._masterScale = this.generateScaleFromIndex(this._rootNoteIndex, this._modeIndex);
    }

    constructor(options) {
        this._options = options;
        this._modeIndex = this.getModeIndexFromName(options.mode) % 6;
        this._rootNoteIndex = this.getNoteIndexFromName(options.root) % 11;
        this._masterScale = this.generateScaleFromIndex(this._rootNoteIndex, this._modeIndex);
    }

    getNoteIndexFromName(noteName) {
        let i, n;
        for (i = 0, n = Notes.length; i < n; i++) {
            if (noteName == Notes[i].Name) {
                return i;
            }
        }
    };


    getModeIndexFromName(modeName) {
        let i, n;
        for (i = 0, n = Modes.length; i < n; i++) {
            if (modeName == Modes[i].Name) {
                return i;
            }
        }
    };

    generateScaleFromIndex(rootIndex, scaleIndex, isPentatonic) {

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
            scaleNotes.push(curNote.Name);
            noteIndex += scaleObj.Sequence[i];
        }

        if (isPentatonic) {
            delete scaleNotes[1];
            delete scaleNotes[5];
        }

        return scaleNotes;
    };

    isTriadMemberOfScale(triad) {
        if (this._masterScale.indexOf(triad[0]) >= 0 &&
            this._masterScale.indexOf(triad[1]) >= 0 &&
            this._masterScale.indexOf(triad[2]) >= 0) {
            return true;
        }
    };

    getHarmonizedChord(noteIndex) {
        // generate all the chords corresponding to this note
        // major triad
        // minor triad (transposed major)
        // aug triad   (major triad with sharpened 5th)
        // dim triad   (major triad with flattened 5th)
        // test if any of the chords are members of the master scale

        let harmonizedChord = {};


        let majorScale = this.generateScaleFromIndex(noteIndex, 0);
        let minorScale = this.generateScaleFromIndex(noteIndex, 5);

        let majorTriad = [
            majorScale[0],
            majorScale[2],
            majorScale[4]
        ];

        let diminishedTriad = [
            minorScale[0],
            minorScale[2],
            Notes[this.getNoteIndexFromName(minorScale[4]) - 1]
        ];
        if (typeof diminishedTriad[2] === "object") {
            diminishedTriad[2] = diminishedTriad[2].Name;
        }

        let augmentedTriad = [
            majorScale[0],
            majorScale[2],
            Notes[this.getNoteIndexFromName(majorScale[4]) + 1]
        ];
        if (typeof augmentedTriad[2] === "object") {
            augmentedTriad[2] = augmentedTriad[2].Name;
        }

        const minorTriad = [
            minorScale[0],
            minorScale[2],
            minorScale[4]
        ];



        if (this.isTriadMemberOfScale(majorTriad)) {
            harmonizedChord = {
                //Type:  Scales[0].Name,
                Type: "",
                Notes: majorTriad
            };
        } else if (this.isTriadMemberOfScale(augmentedTriad)) {
            harmonizedChord = {
                //Type:  "Augmented " + Scales[0].Name,
                Type: "aug",
                Notes: augmentedTriad
            };
        } else if (this.isTriadMemberOfScale(minorTriad)) {
            harmonizedChord = {
                //Type:  Scales[5].Name,
                Type: "min",
                Notes: minorTriad
            };
        } else if (this.isTriadMemberOfScale(diminishedTriad)) {
            harmonizedChord = {
                //Type:  "Diminished " + Scales[0].Name,
                Type: "dim",
                Notes: diminishedTriad
            };
        }

        return harmonizedChord ? harmonizedChord.Notes : {};

    };


    makeChord(value) {
        // get the triad pattern for this note index, given the key & mode ?
        value--;
        let note = value % 12;
        let octave = Math.floor(value / 12);

        note = note % 6; // keep it on a 7 note scale

        // Use incoming note 0-11 as an index into the current master scale;
        note = this.getNoteIndexFromName(this._masterScale[note]);
        let chord = this.getHarmonizedChord(note, this._masterScale);

        if (chord) {
            return chord.map((noteName) => {
                let chordNoteIndex = this.getNoteIndexFromName(noteName);
                let octaveOut = octave;
                if (chordNoteIndex < note) {
                    octaveOut++;
                }
                return chordNoteIndex + (octaveOut * 12);
            });
        } else {
            Log.debug(`makeChord: no chord exists for note=${note} name=${this._masterScale[note]} scale=${this._masterScale}`);
            return [];
        }

    }

}
module.exports = ChordHarmonizer;