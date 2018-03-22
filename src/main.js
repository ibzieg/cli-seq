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
const { fork } = require('child_process');

const Screen = require("./display/screen");

Screen.create({
    onExit: () => {
        arrangmentThread.kill("SIGINT");
        return process.exit(0);
    },
    onCommandInput: (cmd) => {
        arrangmentThread.send({
            type: "command",
            script: cmd
        });
    }
});

const arrangmentThread = fork('./src/sequencer/arrangement-thread.js');


arrangmentThread.on('message', (message) => {
    try {
        switch (message.type) {
            case "log":
                Screen.Instance.log(message ? message.text : "");
                break;
            case "controller":
                Screen.Instance.controller(message.status, message.d1, message.d2);
                break;
            case "controllerMap":
                Screen.Instance.setControllerMap(message.map);
                break;
            case "deviceState":
                Screen.Instance.updateDeviceState(message.deviceState);
                break;
            case "arrangement":
                Screen.Instance.arrangement(message.title);
                break;
            case "clock":
                Screen.Instance.updateClock(message.tickDuration);
                break;
            default:
                Screen.Instance.log(`Unknown message type: ${JSON.stringify(message)}`);
                break;
        }
    } catch (error) {
        Screen.Instance.log(`${colors.red("\u2717")} [main] ${error} ${error.stack}`);
    }

});
