/******************************************************************************
 * Copyright 2017 Ian Bertram Zieg
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

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
      if (error.toString().indexOf("ERR_IPC_CHANNEL_CLOSED") < 0) {
        console.log(`${colors.green("\u2717")} ${error}`);
      }
    }
  }

  static error(text) {
    Console.log(`${colors.red("\u2717")} ${text}`);
  }

  static warning(text) {
    Console.log(`${colors.yellow("\u26A0")} ${text}`);
  }

  static info(text) {
    Console.log(Console.infoStyle(text));
  }

  static infoStyle(text) {
    return `${colors.gray("\u21D2")} ${text}`;
  }

  static success(text) {
    Console.log(Console.successStyle(text));
  }

  static successStyle(text) {
    return `${colors.green("\u2713")} ${text}`;
  }

  static debug(text) {
    Console.log(`${colors.magenta("\u2699")} ${text}`);
  }

  static music(text) {
    Console.log(`${colors.cyan("\u266A")} ${text}`);
  }
}

module.exports = Console;
