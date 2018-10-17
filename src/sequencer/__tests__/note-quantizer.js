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

const NoteQuantizer = require("../note-quantizer");

/******************************************************************************
 * getNoteIndexFromName(noteName)
 ******************************************************************************/
test("getNoteIndexFromName bounds", () => {
  expect(NoteQuantizer.getNoteIndexFromName("C")).toBe(0);
  expect(NoteQuantizer.getNoteIndexFromName("B")).toBe(11);
});

/******************************************************************************
 * getModeIndexFromName(modeName)
 ******************************************************************************/
test("getModeIndexFromName bounds", () => {
  expect(NoteQuantizer.getModeIndexFromName("I Ionian (Major)")).toBe(0);
  expect(NoteQuantizer.getModeIndexFromName("VII Locrian")).toBe(6);
});

/******************************************************************************
 * generateScaleFromIndex(rootIndex, scaleIndex, isPentatonic)
 ******************************************************************************/
test("generateScaleFromIndex test G minor", () => {
  const expectedNotes = ["G", "A", "A#", "C", "D", "D#", "F"];
  expect(
    NoteQuantizer.generateScaleFromIndex(
      NoteQuantizer.getNoteIndexFromName("G"),
      NoteQuantizer.getModeIndexFromName("VI Aeolian (Nat. Minor)"),
      false
    )
  ).toEqual(expect.arrayContaining(expectedNotes));
});

test("generateScaleFromIndex test F major", () => {
  const expectedNotes = ["F", "G", "A", "A#", "C", "D", "E"];
  expect(
    NoteQuantizer.generateScaleFromIndex(
      NoteQuantizer.getNoteIndexFromName("F"),
      NoteQuantizer.getModeIndexFromName("I Ionian (Major)"),
      false
    )
  ).toEqual(expect.arrayContaining(expectedNotes));
});

// TODO test triad chords
