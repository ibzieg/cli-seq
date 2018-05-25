const store = require("./sequencer/store");
const path = require("path");

console.log(process.versions);
 store.create().then(() => {
     store.instance.setPerformanceProperty("selectedScene", 0);
     console.log(`scene=${store.instance.performance.selectedScene} rate=${store.instance.scene.options.noteSet} graphData=${store.instance.scene.tracks[0].graphData}`);
     store.instance.setPerformanceProperty("selectedScene", 1);
     console.log(`scene=${store.instance.performance.selectedScene} rate=${store.instance.scene.options.noteSet} graphData=${store.instance.scene.tracks[0].graphData}`);
     store.instance.setPerformanceProperty("selectedScene", 2);
     console.log(`scene=${store.instance.performance.selectedScene} rate=${store.instance.scene.options.noteSet} graphData=${store.instance.scene.tracks[0].graphData}`);
     store.instance.setPerformanceProperty("selectedScene", 3);
     console.log(`scene=${store.instance.performance.selectedScene} rate=${store.instance.scene.options.noteSet} graphData=${store.instance.scene.tracks[0].graphData}`);
 }).catch((error) => {
     console.log(error)
});
