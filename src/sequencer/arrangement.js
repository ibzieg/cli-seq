

class arrangement {

    constructor(options) {
        this._state = {};
        this._sequencers = new Map();
        this.initialize();
    }

    initialize() {

    }

    register(controller) {
        this._sequencers.forEach((v, k, m) => controller.register(v));
    }

    unregister(controller) {
        this._sequencers.forEach((v, k, m) => controller.unregister(v));
    }

    start() {

    }

    stop() {

    }

    postClock() {

    }

}
module.exports = arrangement;