const store = require("./sequencer/store");
const path = require("path");

 store.create().then(() => {
     store.instance.saveState();
 }).catch((error) => {
     console.log(error)
});

// let src = {name: "source", patternData: [5], sequenceData: []};
// let dst = {name: "destination"};
//
//  let s = store.mergeTrackState(src, dst);
// console.log(s);
// s.patternData.push(8);
// console.log(src);

// let t = Object.assign({}, dst, null);
// console.log(t);