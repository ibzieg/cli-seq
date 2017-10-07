const fs = require("fs");
const Log = require("../display/log-util");

class Arrangement {

    get title() {
        return "Empty";
    }

    get screenTitle() {
        return this.title;
    }

    get defaultState() {
        return {

        };
    }

    get controllerMap() {
        return this._controllerMap;
    }

    get minion() {
        return this._context.minion;
    }

    constructor(context) {
        this._context = context;
        this._sequencers = new Map();
        this._controllerMap = this.createControllerMap();

        this.state = this.defaultState;
        this.loadState().then(() => {
            Log.success(`Loaded state from '${this.filename}'.`);
            this.initialize();
        }).catch((error) => {
            //Log.warning(`Failed to load state from '${this.filename}': ${error}. Using default state instead.`);
            Log.warning(`Failed to load state from '${this.filename}'.`);
            this.initialize();
        });
    }

    get filename() {
        return (`./data/${this.title}.json`);
    }

    saveState() {
       return new Promise((resolve, reject) => {
            let json = JSON.stringify(this.state, null, ' ');
            fs.writeFile(this.filename, json, (error) => {
                if (error) {
                    Log.error(`Failed to write state to '${this.filename}': ${error}`);
                    reject(error);
                } else {
                    Log.success(`Wrote state to '${this.filename}'.`);
                    resolve();
                }
            });
        });
    }

    loadState() {
       return new Promise((resolve, reject) => {
            fs.readFile(this.filename, {encoding: 'utf-8'}, (error, text) => {
                if (error) {
                    reject(error);
                } else {
                    try {
                        let newState = JSON.parse(text);
                        this.state = Object.assign({}, this.state, newState);
                        resolve();
                    } catch (ex) {
                        reject(ex);
                    }

                }
            });
        });
    }


    initialize() {

    }

    createControllerMap() {
        return {
            noteOn: {},
            noteOff: {},
            controlChange: {},
        }
    }

    updateTitle() {
        process.send({
            type: "arrangement",
            title: `{blue-fg}[${this._context.index}:{/} ${this.screenTitle}{blue-fg}]{/}`
        });
    }

    registerController(controller) {
        this._sequencers.forEach((v, k, m) => controller.register(k));
    }

    unregisterController(controller) {
        this._sequencers.forEach((v, k, m) => controller.unregister(k));
    }

    addSequencer(sequencer) {
        this._sequencers.set(sequencer, null);
    }

    start() {

    }

    stop() {

    }

    postClock() {

    }

/*    onLiveScriptInput(script) {
        try {
            let result = eval(script);
            Log.success(script);
            if (result) {
                Log.info(result);
            }
        } catch(error) {
            Log.error(error);
        }
    }*/
}
module.exports = Arrangement;