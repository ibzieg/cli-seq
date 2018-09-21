# Parametric Sequencer

The following JSON describes the state object for the entire application



```javascript
state schema: {
      performances: [
          // (there are 16 performances in this array)
          {
              name: "Name", // string (arrangement name)
              selectedDevice: 0, // number (0-7 device index)
              parts: [
                  //each arrangement has 8 parts, with parts[0] being the primary
                  {
                      options: {
                          root: "A", // string (root note)
                          mode: "V", // string (scale mode)
                          minNote: 0, // number (0-127 midi note)
                          maxNote: 127 //number (0-127 midi note)
                          noteSetSize: 4 // number (0-64 size of set of possible notes to be generated)
                          resentEvent: "none" //string ("none" | track# to reset on end)
                      },
                      tracks: [
						  // there are 8 tracks
                          {
                              // properties
                              name: "mono1" // string (voice name)
                              instrument: "BSPSeq1", // string (midi device name)
 
                              // settings
                              rate: 4, // number (multiplier)
                              octave: 0, // number (offset)
                              length: 16, // number (n)
                              steps: 5, // number (k) where k <= n
                              pattern: "random" // string (generation algorithm)
                              progression: "forward" string (sequence progression type)
                              arp: "up3", // string (arpeggiator pattern)
                              arpRate: 2, // number (necessary ?)
 
                              // toggles & triggers
                              enabled: true // boolean
                              arpLoop: true // boolean (loop or one-shot for repeats)
                              progression: {} // Object (trigger to randomize/generate. data to drive the progression type)
                              probability: false // boolean (if true, check prob of note event to play or ratchet, otherwise always play)
 
                              // data
                              data: [
                                  ..., (there are 8 data sequences per track)
                                  [..., {note event} ]
                              ]
                          }
                      ]
                  }
              ]
  }
```











