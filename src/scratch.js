const store = require("./sequencer/store");
const path = require("path");

 store.create().then(() => {

     console.log(`part=${store.instance.performance.selectedPart} rate=${store.instance.performancePart.tracks[0].rate}`);
     store.instance.performance.selectedPart = 1;
     console.log(`part=${store.instance.performance.selectedPart} rate=${store.instance.performancePart.tracks[0].rate}`);
     store.instance.performance.selectedPart = 2;
     console.log(`part=${store.instance.performance.selectedPart} rate=${store.instance.performancePart.tracks[0].rate}`);
     store.instance.performance.selectedPart = 3;
     console.log(`part=${store.instance.performance.selectedPart} rate=${store.instance.performancePart.tracks[0].rate}`);
     store.instance.performance.selectedPart = 0;
     console.log(`part=${store.instance.performance.selectedPart} rate=${store.instance.performancePart.tracks[0].rate}`);
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