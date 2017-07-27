const colors = require("colors");
const Screen = require("./screen");

class Console {

    static log(text) {
        try {
            process.send({
                type: "log",
                text: text
            });
        } catch (error) {
            if(error.toString().indexOf("ERR_IPC_CHANNEL_CLOSED") < 0) {
                console.log(`${colors.green("\u2717")} ${error}`);
            }
        }
/*        if (Screen.Instance) {
            Screen.Instance.log(text);
        } else {
            console.log(text);
        }*/

    }

    static error(text) {
        Console.log(`${colors.red("\u2717")} ${text}`);
    }

    static warning(text) {
        Console.log(`${colors.yellow("\u26A0")} ${text}`);
    }

    static info(text) {
        Console.log(`${colors.gray("\u21D2")} ${text}`);
    }

    static success(text) {
        Console.log(`${colors.green("\u2713")} ${text}`);
    }

    static debug(text) {
        Console.log(`${colors.magenta("\u2699")} ${text}`);
    }

    static music(text) {
        Console.log(`${colors.cyan("\u266A")} ${text}`);
    }
}
module.exports = Console;