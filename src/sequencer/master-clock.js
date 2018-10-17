/******************************************************************************
 * Copyright 2018 Ian Bertram Zieg
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

const NanoTimer = require("nanotimer");

const TEMPO = 120;

class MasterClock {
  get tempoInterval() {
    return 60000.0 / (TEMPO * 24.0);
  }

  constructor(options) {
    this._options = options;
    this._isPlaying = false;
    this._masterClock = new NanoTimer();
  }

  clock() {
    if (this._options.clock) {
      this._options.clock();
    }
  }

  start() {
    this._isPlaying = true;

    this._masterClock.setInterval(
      () => {
        if (this._isPlaying) {
          this.clock();
        }
      },
      "",
      `${this.tempoInterval}m`
    );
  }

  stop() {
    this._masterClock.clearInterval();
  }
}

module.exports = MasterClock;
