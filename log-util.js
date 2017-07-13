const colors = require("colors");

class Console {


     static error(text) {
         console.log(`${colors.red("\u2717")} ${text}`);

     }

    static warning(text) {
        console.log(`${colors.yellow("\u26A0")} ${text}`);
    }

     static info(text) {
         console.log(`${colors.gray("\u21D2")} ${text}`);
     }

    static success(text) {
        console.log(`${colors.green("\u2713")} ${text}`);
    }

    static debug(text) {
        console.log(`${colors.magenta("\u2699")} ${text}`);
     }

    static music(text) {
        console.log(`${colors.cyan("\u266A")} ${text}`);
    }
}
module.exports = Console;