
class SequenceData {

    /***
     *
     * @returns {Array}
     */
    static getRandomNote(min, max) {
        return [Math.floor(min+Math.random()*(max-min+1)), 127, 100];
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
                    //seq.push(null);
                    seq[i] = null;
                } else {
                    //seq.push(nextNote());
                    seq[i] = nextNote();
                }
            } else {
                seq.push(null);
            }
        }
        return seq;
    }

}
module.exports = SequenceData;