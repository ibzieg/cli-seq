


class EventRouter {

    /***
     *
     */
    constructor() {
        this.listeners = {
            seqEnd: new Map(),
        }
    }

    /***
     *
     * @param type
     * @param key
     * @param callback
     */
    addListener(type, key, callback) {
        this.listeners[type].set(key, callback);
    }

    /***
     *
     * @param type
     * @param key
     */
    removeListener(type, key) {
        this.listeners[type].delete(key);
    }

    /***
     *
     * @param type
     * @param value
     */
    handleEvent(type, value) {
        let listeners = this.listeners[type];
        for (let [key, callback] of listeners) {
            callback(value);
        }
    }

}

EventRouter.EVENT_SEQ_END = "seqEnd";


module.exports = EventRouter;