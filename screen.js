const blessed = require('blessed');
//const MidiController = require("./midi-controller");

const SCREEN_HEIGHT = 30;
const SCREEN_WIDTH = 100;

const layout = {
    statusBar: {
        left: 0,
        top: 0,
        width: SCREEN_WIDTH,
        height: 10
    },
    controller: {
        left: 0,
        top: 3,
        width: SCREEN_WIDTH,
        height: 8
    },
    logBox: {
        top: 10,
        left: 0,
        width: SCREEN_WIDTH,
        height: 18
    },
    inputBox: {
        top: 27,
        left: 0,
        width: SCREEN_WIDTH,
        height: 3,
    }
};

class Screen {

    static create(options) {
        Screen.Instance = new Screen(options);
    }

    constructor(options) {
        this.options = options;
        if (Screen.Instance instanceof Screen) {
            throw new Error("Singleton instance of Screen already exists");
        }

        this.initialize();

        this._tickDurations = [];
        this._commandHistory = [];
        this._commandHistoryIndex = 0;
        this._logLines = [];

    }

    exit() {
        if (this.options.onExit) {
            return this.options.onExit();
        } else {
            return process.exit(0);
        }
    }

    initialize() {
        // Create a screen object.
        this._screen = blessed.screen({
            smartCSR: true,
            dockBorders: true,
        });

        this._screen.title = 'Parallelepiped';

        // Quit on Escape, q, or Control-C.
        this._screen.key([/*'escape', 'q', */'C-c'],  (ch, key) => {
            this.exit();
        });

        this.statusBar = blessed.box(Object.assign({
            scrollable: true,
            tags: true,
            // label: "Controller",
            border: {
                type: 'bg',
                fg: '#ff0000',
                bg: '#00ff00'

            },
            style: {
                fg: 'white',
                border: {
                    fg: '#f0f0f0'
                }
            }
        }, layout.statusBar));
        this._screen.append(this.statusBar);

        this.bpmText = blessed.text({
            parent: this.statusBar
        });

        this.controllerBox = blessed.box(Object.assign({
            scrollable: true,
            tags: true,
            // label: "Controller",
            border: {
                type: 'bg',
                fg: '#ff0000',
                bg: '#00ff00'

            },
            style: {
                fg: 'white',
                border: {
                    fg: '#f0f0f0'
                }
            }
        }, layout.controller));
        this._screen.append(this.controllerBox);

        this.knobsDisplays = [];
        for (let i = 0; i < 16; i++) {
            this.knobsDisplays.push(this.createKnobDisplay({
                label: `Knob${i+1}`,
                left: (i%8)*12,
                top: i < 8 ? 0 : 2
            }));
        }



        // Create a box perfectly centered horizontally and vertically.
        this.logBox = blessed.box(Object.assign({
            // label: "Log",
            scrollable: true,
            tags: true,
            keys: true,
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                border: {
                    fg: '#f0f0f0'
                }
            }
        }, layout.logBox));

        // Append our box to the screen.
        this._screen.append(this.logBox);

        // If our box is clicked, change the content.
        this.logBox.on('click',  (data) => {
            //this.log("click: "+data);
            //this.logBox.focus();
        });

        // Create a box perfectly centered horizontally and vertically.
        this.inputBox = blessed.box(Object.assign({
            // label: "Input",
            scrollable: true,
            tags: true,
            keys: true,
            border: {
                type: 'line',
                fg: '#ff0000',
                bg: '#00ff00'

            },
            style: {
                fg: 'white',
                border: {
                    fg: '#f0f0f0'
                }
            }
        }, layout.inputBox));
        this._screen.append(this.inputBox);

        this.commandInput = blessed.textbox({
            parent: this.inputBox,
            width: SCREEN_WIDTH,
            content: "test",
            inputOnFocus: true,
            keys: true,
            mouse: true
        });
        this.commandInput.focus();
        this.commandInput.on('keypress', (ch, key) => {
            //this.log(`keypress ${ch} ${JSON.stringify(key)}`);
            if (key.name === "up" || (key.ctrl && key.name === "p")) {
                this._commandHistoryIndex = Math.max(this._commandHistoryIndex - 1, 0);
                let cmd = this._commandHistory[this._commandHistoryIndex];
                this.commandInput.setValue(cmd);
                this._screen.render();
            } else if (key.name === "down" || (key.ctrl && key.name === "n")) {
                this._commandHistoryIndex = Math.min(this._commandHistoryIndex + 1, this._commandHistory.length);
                let cmd = this._commandHistory[this._commandHistoryIndex];
                this.commandInput.setValue(cmd);
                this._screen.render();
            } else if (key.ctrl && key.name === "c") {
                this.commandInput.clearValue();
                this._screen.render();
                this._commandHistoryIndex = this._commandHistory.length;
            } else {
                this._commandHistoryIndex = this._commandHistory.length;
            }
        });
        this.commandInput.on('submit',(value) => {
            this.commandInput.clearValue();
            this.commandInput.focus();

            if (value === "exit") {
                this.exit();
            } else {
                if (this.options.onCommandInput) {
                    this.options.onCommandInput(value);
                }
            }

            this._commandHistory.push(value);
            this._commandHistoryIndex = this._commandHistory.length;
        });




        this._screen.render();
    }

    createKnobDisplay(options) {
        return new blessed.progressbar({
            parent: this.controllerBox,
            height: 3,
            width: 13,
            top: options.top,
            left: options.left,
            label: options.label,
            filled: 0,

            fg: '#ff0000',
            bg: '#00ff00',
            border: {
                type: 'line',
                fg: 'white',
            },
            style: {
                bar: {
                    fg: '#ffa501',
                    bg: '#ff170a'
                }
            }

        });
    }

    log(text) {
            // this._logLines.push(text);
            // this.logBox.setContent(this._logLines.join('\n'));
        this.logBox.insertBottom(text);
            this._screen.render();
            this.logBox.setScrollPerc(100);
    }

    updateKnob(index, d2) {
        let pct = Math.round((d2 / 127.0) * 100);
        let pctStr = `${pct}%`;
        let width = 12-3;
        let label = `Knob`;
        label = label.substr(0, width - pctStr.length);
        let pad = Array(width - label.length - pctStr.length).join(" ");

        let knobDisplay = this.knobsDisplays[index];

        knobDisplay.setLabel( label + pad + pctStr);
        knobDisplay.setProgress(pct);
        this._screen.render();
    }

    updateClock(duration) {
        const historyLength = 48; // TODO Move constant
        const ppq = 24; // TODO Move constant
        this._tickDurations.push(duration);
        this._tickDurations = this._tickDurations.splice(Math.max(0, this._tickDurations.length-historyLength), historyLength);
        let tickMillis = this._tickDurations.reduce((sum, value) => sum + value) / this._tickDurations.length;
        let beatMillis = tickMillis * ppq;
        const millisPerMin = 60000;
        let bpm = Math.round(millisPerMin / beatMillis);
        // this.inputBox.setLabel(`${bpm}bpm`);
        this.bpmText.setContent(`${bpm}bpm`);
        this._screen.render();
    }

    controller(status, d1, d2) {


        switch (status) {
            /*            case 144: // Note on
             switch (d1) {
             case MidiController.BeatStepMap.Pad9:  minion.GateOutput(0, 1); break;
             case MidiController.BeatStepMap.Pad10: minion.GateOutput(1, 1); break;
             case MidiController.BeatStepMap.Pad11: minion.GateOutput(2, 1); break;
             case MidiController.BeatStepMap.Pad12: minion.GateOutput(3, 1); break;

             case MidiController.BeatStepMap.Pad1:
             randomKickSequence();
             randomSnareSequence();
             randomizeSeq1();
             break;
             }
             break;
             case 128: // Note off
             switch (d1) {
             case MidiController.BeatStepMap.Pad9:  minion.GateOutput(0, 0); break;
             case MidiController.BeatStepMap.Pad10: minion.GateOutput(1, 0); break;
             case MidiController.BeatStepMap.Pad11: minion.GateOutput(2, 0); break;
             case MidiController.BeatStepMap.Pad12: minion.GateOutput(3, 0); break;
             }
             break;*/
            case 176: // Control Change
                switch (d1) {
                    case BeatStepControllerMap.Knob1: this.updateKnob(0, d2); break;
                    case BeatStepControllerMap.Knob2: this.updateKnob(1, d2); break;
                    case BeatStepControllerMap.Knob3: this.updateKnob(2, d2); break;
                    case BeatStepControllerMap.Knob4: this.updateKnob(3, d2); break;

                    /*                    case MidiController.BeatStepMap.Knob2: minion.CVOutput(1, d2/127.0); break;
                     case MidiController.BeatStepMap.Knob3: minion.CVOutput(2, d2/127.0); break;
                     case MidiController.BeatStepMap.Knob4: minion.CVOutput(3, d2/127.0); break;*/
                }
                break;
        }
    }

}
module.exports = Screen;




const BeatStepControllerMap = {
    Knob1: 10,
    Knob2: 74,
    Knob3: 71,
    Knob4: 76,
    Knob5: 77,
    Knob6: 93,
    Knob7: 73,
    Knob8: 75,
    Knob9: 114,
    Knob10: 18,
    Knob11: 19,
    Knob12: 16,
    Knob13: 17,
    Knob14: 91,
    Knob15: 79,
    Knob16: 72,

    Pad1: 36,
    Pad2: 37,
    Pad3: 38,
    Pad4: 39,
    Pad5: 40,
    Pad6: 41,
    Pad7: 42,
    Pad8: 43,
    Pad9: 44,
    Pad10: 45,
    Pad11: 46,
    Pad12: 47,
    Pad13: 48,
    Pad14: 49,
    Pad15: 50,
    Pad16: 51,

    Stage1: 20,
    Stage2: 21,
    Stage3: 22,
    Stage4: 23,
    Stage5: 24,
    Stage6: 25,
    Stage7: 26,
    Stage8: 27,
    Stage9: 28,
    Stage10: 29,
    Stage11: 30,
    Stage12: 31,
    Stage13: 52,
    Stage14: 53,
    Stage15: 54,
    Stage16: 55,
};