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

const fs = require("fs");
const JSONFile = require("../json-file");

const TEST_FILE_NAME = "json-file.test.data.json";

beforeEach(() => {
  if (fs.existsSync(TEST_FILE_NAME)) {
    fs.unlinkSync(TEST_FILE_NAME);
  }
});

afterEach(() => {
  if (fs.existsSync(TEST_FILE_NAME)) {
    fs.unlinkSync(TEST_FILE_NAME);
  }
});

/******************************************************************************
 * writeFile(fileName, data)
 * readFile(fileName)
 ******************************************************************************/
test("write and read data", () => {
  let data = { testKey: "testValue" };
  expect.assertions(3);
  expect(fs.existsSync(TEST_FILE_NAME)).toBeFalsy();
  return JSONFile.writeFile(TEST_FILE_NAME, data).then(() => {
    expect(fs.existsSync(TEST_FILE_NAME)).toBeTruthy();
    return JSONFile.readFile(TEST_FILE_NAME).then(json => {
      expect(json.testKey).toBe("testValue");
    });
  });
});
