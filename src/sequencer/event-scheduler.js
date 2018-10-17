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

class EventScheduler {
  /***
   *
   */
  constructor() {
    this.counter = 0;
    this.eventsMap = new Map();
  }

  /***
   *
   */
  clock() {
    this.counter++;
    this.executeEvents(this.counter);
  }

  /***
   *
   * @param time
   */
  executeEvents(time) {
    let events = this.eventsMap.get(time);
    if (events) {
      for (let i = 0; i < events.length; i++) {
        // execute each callback
        events[i]();
        events[i] = null;
      }
      this.eventsMap.delete(time);
    }
  }

  /***
   *
   */
  flushAllEvents() {
    let keyList = [];
    for (let key of this.eventsMap.keys()) {
      keyList.push(key);
    }
    for (let i = 0; i < keyList.length; i++) {
      this.executeEvents(keyList[i]);
    }
  }

  /***
   *
   * @param ticks
   * @param callback
   * @returns {*}
   */
  schedule(ticks, callback) {
    let time = this.counter + ticks;
    let events = this.eventsMap.get(time);
    if (!events) {
      events = [];
    }
    events.push(callback);
    this.eventsMap.set(time, events);
    return time;
  }
}

module.exports = EventScheduler;