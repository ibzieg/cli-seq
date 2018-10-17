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
const Store = require("../store");

jest.mock("../json-file");

/******************************************************************************
 * create()
 ******************************************************************************/
describe("create", () => {
  beforeEach(() => {
    return Store.create();
  });

  afterEach(() => {
    Store.destroy();
  });

  test("state is populated", () => {
    expect(Store.instance.performance.name).toBe("Performance 1");
  });
});

/******************************************************************************
 * copySceneToPerformance(perfIndex)
 ******************************************************************************/
describe("copySceneToPerformance", () => {
  beforeEach(() => {
    return Store.create();
  });

  afterEach(() => {
    Store.destroy();
  });

  test("bounds", () => {
    try {
      Store.instance.copySceneToPerformance(-1);
    } catch (err) {
      expect(err.toString()).toBe("Error: Index out of bounds: -1");
    }

    try {
      Store.instance.copySceneToPerformance(12);
    } catch (err) {
      expect(err.toString()).toBe("Error: Index out of bounds: 12");
    }
  });

  test("data is copied", () => {
    expect(Store.instance.state.selectedPerformance).toBe(0);
    expect(Store.instance.performance.selectedScene).toBe(0);

    Store.instance.setPerformanceProperty("selectedScene", 2);
    expect(Store.instance.performance.selectedScene).toBe(2);

    Store.instance.setSceneProperty("noteSetSize", 127);

    Store.instance.copySceneToPerformance(3);
    Store.instance.setProperty("selectedPerformance", 3);
    expect(Store.instance.scene.options.noteSetSize).toBe(127);
  });
});

/******************************************************************************
 * create()
 ******************************************************************************/
describe("clear", () => {
  beforeEach(() => {
    return Store.create();
  });

  afterEach(() => {
    Store.destroy();
  });

  test("if scene index > 0, active track is cleared", () => {
    expect(Store.instance.state.selectedPerformance).toBe(0);
    expect(Store.instance.performance.selectedScene).toBe(0);

    Store.instance.setPerformanceProperty("selectedScene", 2);
    Store.instance.setPerformanceProperty("selectedTrack", 2);
    expect(Store.instance.performance.selectedScene).toBe(2);

    Store.instance.setSelectedTrackProperty("steps", 17);
    expect(Store.instance.performance.selectedTrack).toBe(2);
    Store.instance.clearActiveTrack();
    expect(
      Store.instance.scene.tracks[Store.instance.performance.selectedTrack]
        .steps
    ).toBeUndefined();
  });
});
