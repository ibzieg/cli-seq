

class Arrangement {

    constructor(options) {
        this._state = {};
        this._sequencers = new Map();
        this.initialize();
    }

    initialize() {

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

}
module.exports = Arrangement;