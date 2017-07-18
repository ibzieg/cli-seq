const { fork } = require('child_process');

const forked = fork('cli-seq.js');

const Screen = require("./screen");

Screen.create({
    onExit: () => {
        forked.kill("SIGINT");
        return process.exit(0);
    }
});

forked.on('message', (msg) => {
    //console.log(msg.text);
    Screen.Instance.log(msg.text);
});

//forked.send({ hello: 'world' });