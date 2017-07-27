
class SequenceData {

    /***
     *
     * @returns {number}
     */
    static getRandomNote() {
        let min = 36;
        let max = 72;
        return Math.floor(min+Math.random()*(max-min+1));
    }

    /***
     *
     * @param nextNote
     * @param min
     * @param max
     * @param density
     * @returns {Array}
     */
    static getRandomSequence(nextNote, min, max, density) {
        min = Math.floor(min/2)*2; // force even
        max = Math.floor(max/2)*2; // force even
        if (density < 0) density = 0;
        if (density > 1) density = 1;
        let length = Math.floor(min+Math.random()*(max-min+1));
        let seq = [];
        for (let i = 0; i < length; i++) {
            if (Math.random() < density) {
                if (i % 2 !== 0 && Math.random() < density) {
                    seq.push(null);
                } else {
                    seq.push([nextNote(), 127, 127]);
                }
            } else {
                seq.push(null);
            }
        }
        return seq;
    }

}
module.exports = SequenceData;