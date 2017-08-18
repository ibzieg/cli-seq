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
        top: 2,
        width: SCREEN_WIDTH,
        height: 13
    },
    logBox: {
        top: 13,
        left: 0,
        width: SCREEN_WIDTH,
        height: 15
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

        this._state = {
            tickDurations: [],
            commandHistory: [],
            commandHistoryIndex: 0,
            logLines: [],
            statusBar: {
                bpm: 0,
                title: "Loading..."
            }
        }

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

        this.statusBarText = blessed.text({
            parent: this.statusBar,
            tags: true
        });

        this.arrangementText = blessed.text({
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
            this.knobsDisplays.push(this.createControllerDisplay({
                label: ``,
                left: (i%8)*12,
                top: i < 8 ? 0 : 2
            }));
        }

        this.padDisplays = [];
        for (let i = 0; i < 16; i++) {
            this.padDisplays.push(this.createControllerDisplay({
                label: ``,
                left: (i%8)*12,
                top: i < 8 ? 5 : 7
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
                this._state.commandHistoryIndex = Math.max(this._state.commandHistoryIndex - 1, 0);
                let cmd = this._state.commandHistory[this._state.commandHistoryIndex];
                this.commandInput.setValue(cmd);
                this._screen.render();
            } else if (key.name === "down" || (key.ctrl && key.name === "n")) {
                this._state.commandHistoryIndex = Math.min(this._state.commandHistoryIndex + 1, this._state.commandHistory.length);
                let cmd = this._state.commandHistory[this._state.commandHistoryIndex];
                this.commandInput.setValue(cmd);
                this._screen.render();
            } else if (key.ctrl && key.name === "c") {
                this.commandInput.clearValue();
                this._screen.render();
                this._state.commandHistoryIndex = this._state.commandHistory.length;
            } else {
                this._state.commandHistoryIndex = this._state.commandHistory.length;
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

            this._state.commandHistory.push(value);
            this._state.commandHistoryIndex = this._state.commandHistory.length;
        });




        this._screen.render();
    }

    createControllerDisplay(options) {
        //return new blessed.progressbar({
        return new blessed.box({
            parent: this.controllerBox,
            height: 3,
            width: 13,
            top: options.top,
            left: options.left,
            label: options.label,
            filled: 0,
            tags: true,

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
            // this._state.logLines.push(text);
            // this.logBox.setContent(this._state.logLines.join('\n'));
        this.logBox.insertBottom(text);
            this._screen.render();
            this.logBox.setScrollPerc(100); 
    }

    updateControllerLabel(element, ctrl) {
        let label = "";
        if (ctrl && ctrl.label) {
            label = ctrl.label;
        }
        element.setLabel(`{bold}${label}{/}`);
    }

    updateControllerValue(element, value) {
        element.setContent(`{green-fg}${value}{/}`);
    }

    updateClock(duration) {
        const historyLength = 48; // TODO Move constant
        const ppq = 24; // TODO Move constant
        this._state.tickDurations.push(duration);
        this._state.tickDurations = this._state.tickDurations.splice(Math.max(0, this._state.tickDurations.length-historyLength), historyLength);
        let tickMillis = this._state.tickDurations.reduce((sum, value) => sum + value) / this._state.tickDurations.length;
        let beatMillis = tickMillis * ppq;
        const millisPerMin = 60000;
        let bpm = Math.round(millisPerMin / beatMillis);

        this._state.statusBar.bpm = bpm;
        this.renderStatusBar();
    }

    arrangement(title) {
        this._state.statusBar.title = title;
        this.renderStatusBar();
    }

    renderStatusBar() {
        let text = ` {green-fg}${this._state.statusBar.bpm}bpm{/} ${this._state.statusBar.title}`
        this.statusBarText.setContent(text);
        this._screen.render();
    }

    controller(status, d1, d2) {


        switch (status) {
            case 144: // Note on
                switch (d1) {
                    case BeatStepControllerMap.Pad1:  this.updateControllerValue(this.padDisplays[8], d2); break;
                    case BeatStepControllerMap.Pad2:  this.updateControllerValue(this.padDisplays[9], d2); break;
                    case BeatStepControllerMap.Pad3:  this.updateControllerValue(this.padDisplays[10], d2); break;
                    case BeatStepControllerMap.Pad4:  this.updateControllerValue(this.padDisplays[11], d2); break;
                    case BeatStepControllerMap.Pad5:  this.updateControllerValue(this.padDisplays[12], d2); break;
                    case BeatStepControllerMap.Pad6:  this.updateControllerValue(this.padDisplays[13], d2); break;
                    case BeatStepControllerMap.Pad7:  this.updateControllerValue(this.padDisplays[14], d2); break;
                    case BeatStepControllerMap.Pad8:  this.updateControllerValue(this.padDisplays[15], d2); break;
                    case BeatStepControllerMap.Pad9:  this.updateControllerValue(this.padDisplays[0], d2); break;
                    case BeatStepControllerMap.Pad10: this.updateControllerValue(this.padDisplays[1], d2); break;
                    case BeatStepControllerMap.Pad11: this.updateControllerValue(this.padDisplays[2], d2); break;
                    case BeatStepControllerMap.Pad12: this.updateControllerValue(this.padDisplays[3], d2); break;
                    case BeatStepControllerMap.Pad13: this.updateControllerValue(this.padDisplays[4], d2); break;
                    case BeatStepControllerMap.Pad14: this.updateControllerValue(this.padDisplays[5], d2); break;
                    case BeatStepControllerMap.Pad15: this.updateControllerValue(this.padDisplays[6], d2); break;
                    case BeatStepControllerMap.Pad16: this.updateControllerValue(this.padDisplays[7], d2); break;
                }
                break;
            case 128: // Note off
                switch (d1) {
                    case BeatStepControllerMap.Pad1:  this.updateControllerValue(this.padDisplays[8], d2); break;
                    case BeatStepControllerMap.Pad2:  this.updateControllerValue(this.padDisplays[9], d2); break;
                    case BeatStepControllerMap.Pad3:  this.updateControllerValue(this.padDisplays[10], d2); break;
                    case BeatStepControllerMap.Pad4:  this.updateControllerValue(this.padDisplays[11], d2); break;
                    case BeatStepControllerMap.Pad5:  this.updateControllerValue(this.padDisplays[12], d2); break;
                    case BeatStepControllerMap.Pad6:  this.updateControllerValue(this.padDisplays[13], d2); break;
                    case BeatStepControllerMap.Pad7:  this.updateControllerValue(this.padDisplays[14], d2); break;
                    case BeatStepControllerMap.Pad8:  this.updateControllerValue(this.padDisplays[15], d2); break;
                    case BeatStepControllerMap.Pad9:  this.updateControllerValue(this.padDisplays[0], d2); break;
                    case BeatStepControllerMap.Pad10: this.updateControllerValue(this.padDisplays[1], d2); break;
                    case BeatStepControllerMap.Pad11: this.updateControllerValue(this.padDisplays[2], d2); break;
                    case BeatStepControllerMap.Pad12: this.updateControllerValue(this.padDisplays[3], d2); break;
                    case BeatStepControllerMap.Pad13: this.updateControllerValue(this.padDisplays[4], d2); break;
                    case BeatStepControllerMap.Pad14: this.updateControllerValue(this.padDisplays[5], d2); break;
                    case BeatStepControllerMap.Pad15: this.updateControllerValue(this.padDisplays[6], d2); break;
                    case BeatStepControllerMap.Pad16: this.updateControllerValue(this.padDisplays[7], d2); break;
                }
                break;
            case 176: // Control Change
                switch (d1) {
                    case BeatStepControllerMap.Knob1: this.updateControllerValue(this.knobsDisplays[0], d2); break;
                    case BeatStepControllerMap.Knob2: this.updateControllerValue(this.knobsDisplays[1], d2); break;
                    case BeatStepControllerMap.Knob3: this.updateControllerValue(this.knobsDisplays[2], d2); break;
                    case BeatStepControllerMap.Knob4: this.updateControllerValue(this.knobsDisplays[3], d2); break;
                    case BeatStepControllerMap.Knob5: this.updateControllerValue(this.knobsDisplays[4], d2); break;
                    case BeatStepControllerMap.Knob6: this.updateControllerValue(this.knobsDisplays[5], d2); break;
                    case BeatStepControllerMap.Knob7: this.updateControllerValue(this.knobsDisplays[6], d2); break;
                    case BeatStepControllerMap.Knob8: this.updateControllerValue(this.knobsDisplays[7], d2); break;
                    case BeatStepControllerMap.Knob9: this.updateControllerValue(this.knobsDisplays[8], d2); break;
                    case BeatStepControllerMap.Knob10: this.updateControllerValue(this.knobsDisplays[9], d2); break;
                    case BeatStepControllerMap.Knob11: this.updateControllerValue(this.knobsDisplays[10], d2); break;
                    case BeatStepControllerMap.Knob12: this.updateControllerValue(this.knobsDisplays[11], d2); break;
                    case BeatStepControllerMap.Knob13: this.updateControllerValue(this.knobsDisplays[12], d2); break;
                    case BeatStepControllerMap.Knob14: this.updateControllerValue(this.knobsDisplays[13], d2); break;
                    case BeatStepControllerMap.Knob15: this.updateControllerValue(this.knobsDisplays[14], d2); break;
                    case BeatStepControllerMap.Knob16: this.updateControllerValue(this.knobsDisplays[15], d2); break;
                }
                break;
        }

        this._screen.render();

    }

    setControllerMap(ctrlMap) {
        this._controllerMap = Object.assign({},ctrlMap);

        this.updateControllerLabel(this.knobsDisplays[0]  ,this._controllerMap.controlChange.Knob1  );
        this.updateControllerLabel(this.knobsDisplays[1]  ,this._controllerMap.controlChange.Knob2  );
        this.updateControllerLabel(this.knobsDisplays[2]  ,this._controllerMap.controlChange.Knob3  );
        this.updateControllerLabel(this.knobsDisplays[3]  ,this._controllerMap.controlChange.Knob4  );
        this.updateControllerLabel(this.knobsDisplays[4]  ,this._controllerMap.controlChange.Knob5  );
        this.updateControllerLabel(this.knobsDisplays[5]  ,this._controllerMap.controlChange.Knob6  );
        this.updateControllerLabel(this.knobsDisplays[6]  ,this._controllerMap.controlChange.Knob7  );
        this.updateControllerLabel(this.knobsDisplays[7]  ,this._controllerMap.controlChange.Knob8  );
        this.updateControllerLabel(this.knobsDisplays[8]  ,this._controllerMap.controlChange.Knob9  );
        this.updateControllerLabel(this.knobsDisplays[9]  ,this._controllerMap.controlChange.Knob10 );
        this.updateControllerLabel(this.knobsDisplays[10] ,this._controllerMap.controlChange.Knob11 );
        this.updateControllerLabel(this.knobsDisplays[11] ,this._controllerMap.controlChange.Knob12 );
        this.updateControllerLabel(this.knobsDisplays[12] ,this._controllerMap.controlChange.Knob13 );
        this.updateControllerLabel(this.knobsDisplays[13] ,this._controllerMap.controlChange.Knob14 );
        this.updateControllerLabel(this.knobsDisplays[14] ,this._controllerMap.controlChange.Knob15 );
        this.updateControllerLabel(this.knobsDisplays[15] ,this._controllerMap.controlChange.Knob16 );

        this.updateControllerLabel(this.padDisplays[8] ,this._controllerMap.noteOn.Pad1  );
        this.updateControllerLabel(this.padDisplays[9] ,this._controllerMap.noteOn.Pad2  );
        this.updateControllerLabel(this.padDisplays[10],this._controllerMap.noteOn.Pad3  );
        this.updateControllerLabel(this.padDisplays[11],this._controllerMap.noteOn.Pad4  );
        this.updateControllerLabel(this.padDisplays[12],this._controllerMap.noteOn.Pad5  );
        this.updateControllerLabel(this.padDisplays[13],this._controllerMap.noteOn.Pad6  );
        this.updateControllerLabel(this.padDisplays[14],this._controllerMap.noteOn.Pad7  );
        this.updateControllerLabel(this.padDisplays[15],this._controllerMap.noteOn.Pad8  );
        this.updateControllerLabel(this.padDisplays[0] ,this._controllerMap.noteOn.Pad9  );
        this.updateControllerLabel(this.padDisplays[1] ,this._controllerMap.noteOn.Pad10 );
        this.updateControllerLabel(this.padDisplays[2] ,this._controllerMap.noteOn.Pad11 );
        this.updateControllerLabel(this.padDisplays[3] ,this._controllerMap.noteOn.Pad12 );
        this.updateControllerLabel(this.padDisplays[4] ,this._controllerMap.noteOn.Pad13 );
        this.updateControllerLabel(this.padDisplays[5] ,this._controllerMap.noteOn.Pad14 );
        this.updateControllerLabel(this.padDisplays[6] ,this._controllerMap.noteOn.Pad15 );
        this.updateControllerLabel(this.padDisplays[7] ,this._controllerMap.noteOn.Pad16 );

        this.updateControllerValue(this.padDisplays[8], "");
        this.updateControllerValue(this.padDisplays[9], "");
        this.updateControllerValue(this.padDisplays[10], "");
        this.updateControllerValue(this.padDisplays[11], "");
        this.updateControllerValue(this.padDisplays[12], "");
        this.updateControllerValue(this.padDisplays[13], "");
        this.updateControllerValue(this.padDisplays[14], "");
        this.updateControllerValue(this.padDisplays[15], "");
        this.updateControllerValue(this.padDisplays[0], "");
        this.updateControllerValue(this.padDisplays[1], "");
        this.updateControllerValue(this.padDisplays[2], "");
        this.updateControllerValue(this.padDisplays[3], "");
        this.updateControllerValue(this.padDisplays[4], "");
        this.updateControllerValue(this.padDisplays[5], "");
        this.updateControllerValue(this.padDisplays[6], "");
        this.updateControllerValue(this.padDisplays[7], "");

        this.updateControllerValue(this.knobsDisplays[0], "");
        this.updateControllerValue(this.knobsDisplays[1], "");
        this.updateControllerValue(this.knobsDisplays[2], "");
        this.updateControllerValue(this.knobsDisplays[3], "");
        this.updateControllerValue(this.knobsDisplays[4], "");
        this.updateControllerValue(this.knobsDisplays[5], "");
        this.updateControllerValue(this.knobsDisplays[6], "");
        this.updateControllerValue(this.knobsDisplays[7], "");
        this.updateControllerValue(this.knobsDisplays[8], "");
        this.updateControllerValue(this.knobsDisplays[9], "");
        this.updateControllerValue(this.knobsDisplays[10], "");
        this.updateControllerValue(this.knobsDisplays[11], "");
        this.updateControllerValue(this.knobsDisplays[12], "");
        this.updateControllerValue(this.knobsDisplays[13], "");
        this.updateControllerValue(this.knobsDisplays[14], "");
        this.updateControllerValue(this.knobsDisplays[15], "");

        this._screen.render();
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