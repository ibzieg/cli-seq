const colors = require("colors");
const { fork } = require('child_process');

const forked = fork('cli-seq.js');

const Screen = require("./screen");

Screen.create({
    onExit: () => {
        forked.kill("SIGINT");
        return process.exit(0);
    },
    onCommandInput: (cmd) => {
        forked.send({
            type: "command",
            script: cmd
        });
    }
});

forked.on('message', (message) => {
    try {
        switch (message.type) {
            case "log":
                Screen.Instance.log(message.text);
                break;
            case "controller":
                Screen.Instance.controller(message.status, message.d1, message.d2);
                break;
            case "clock":
                Screen.Instance.updateClock(message.tickDuration);
                break;
            default:
                Screen.Instance.log(`Unknown message type: ${JSON.stringify(message)}`);
                break;
        }
    } catch (error) {
        Screen.Instance.log(`${colors.red("\u2717")} ${error}`);
    }

});
