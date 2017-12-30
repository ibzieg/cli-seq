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
            try {
                this.initialize();
            } catch (error) {
                console.log(error);
            }
        }).catch((error) => {
            //Log.warning(`Failed to load state from '${this.filename}': ${error}. Using default state instead.`);
            //Log.warning(`Failed to load state from '${this.filename}'.`);
            try {
                this.initialize();
            } catch (error) {
                console.log(error);
            }
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
                        this.state = Object.assign(this.state, newState);
                        resolve();
                    } catch (ex) {
                        reject(ex);
                    }

                }
            })
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

    updateControllerPad(d1, d2) {
        process.send({
            type: "controller",
            status: 144,
            d1: d1,
            d2: d2
        });
    }

    updateControllerKnob(d1, d2) {
        process.send({
            type: "controller",
            status: 176,
            d1: d1,
            d2: d2
        });
    }

    updateTitle() {
        process.send({
            type: "arrangement",
            title: `{blue-fg}[${this._context.index}:{/} ${this.screenTitle}{blue-fg}]{/}`
        });
    }

    updateDeviceState() {
        process.send({
            type: "deviceState",
            deviceState: [
                { name: "1", enabled: true, selected: true },
                { name: "2", enabled: true, selected: false },
                { name: "3", enabled: true, selected: false },
                { name: "4", enabled: true, selected: false },
                { name: "5", enabled: true, selected: false },
                { name: "6", enabled: true, selected: false },
                { name: "7", enabled: true, selected: false },
                { name: "8", enabled: true, selected: false },
            ]

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