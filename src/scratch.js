const store = require("./sequencer/store");
const path = require("path");

 store.create().then(() => {

     console.log(`scene=${store.instance.performance.selectedScene} rate=${store.instance.scene.tracks[0].rate}`);
     store.instance.performance.selectedScene = 1;
     console.log(`scene=${store.instance.performance.selectedScene} rate=${store.instance.scene.tracks[0].rate}`);
     store.instance.performance.selectedScene = 2;
     console.log(`scene=${store.instance.performance.selectedScene} rate=${store.instance.scene.tracks[0].rate}`);
     store.instance.performance.selectedScene = 3;
     console.log(`scene=${store.instance.performance.selectedScene} rate=${store.instance.scene.tracks[0].rate}`);
     store.instance.performance.selectedScene = 0;
     console.log(`scene=${store.instance.performance.selectedScene} rate=${store.instance.scene.tracks[0].rate}`);
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