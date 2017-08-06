const Log = require("../display/log-util");

class Arrangement {

    get title() {
        return "<Empty>";
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
        this.initialize();
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
            title: `{blue-fg}[${this._context.index}:{/} ${this.title}{blue-fg}]{/}`
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