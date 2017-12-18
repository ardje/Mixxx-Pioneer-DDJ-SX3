# Pioneer DDJ-SX2 MIDI Mapping for Mixxx

## Description 

based on hrudham's DDJ-SR mapping, with lots of modifications to make it work on the SX2.

use Mixxx v2.0 for this mapping.

## How do I use it?

If you just want to get your controller working with Mixxx without bothering about the details much, then do the following:

1. clone this repository, or download it as a zip.
2. copy `bin/PIONEER_DDJ-SX2.midi.xml` and `bin/PIONEER_DDJ-SX2-scripts.js` to the `[Mixxx Directory]/controllers` folder. This will probably be one of the following locations:
    - Windows: `C:\Program Files\Mixxx\controllers`
    - Linux: `/usr/share/mixxx/controllers or /usr/local/share/mixxx/controllers`
    - OS X: `/Applications/Mixxx.app/Contents/Resources/controllers/`
3. Make sure your Pioneer DDJ-SX2 is plugged in, turned on, and set up to use DJ software other than Sera- don't worry, you don't have to set it up.
4. Open (or restart) Mixxx, and enjoy using your (almost-fully-functional) controller

### Controller Setup

the DDJ-SX2 uses a sysex to go into serato mode, so we trick the controller into "this is Serato". no extra setup is involved. 

## What's implemented?

- crossfader
- deck
    - play/pause
    - volume
    - trim
    - equalizer
    - filter
    - cue
    - sync (needs a few fixes though)
    - needle search
    - headphone cue
    - grid adjust/slide/set
    - quantize
    - keylock
    - slip mode
    - tempo slider
    - loop functions (except slot select)
    - crossfader assign buttons
    - censor/reverse
    - pads:
        - hot cue
        - roll
        - slicer!
        - sampler (LEDs included)
        - cue loop (needs to be fixed though)
        - saved loop (uses hotcues as workaround)
        - slicer loop (maybe buggy)
        - velocity sampler
- jog wheels
    - scratching
    - pitch bend
    - skipping
- browser (except back button)
- load buttons
- panel select
- effects
    - since Mixxx uses a different effect framework, the effect panel wouldn't have worked properly, but i did it anyways
    - check out EFFECTS.md for instructions.
- crossfader curve (maybe buggy)
- sampler volume

## What's missing?

- parameter 1 and 2
- grid clear
- proper cue loop
- browser back button
- track number, song and artist buttons
- ch fader start
- tempo range
- flip (doesn't exist in Mixxx, so it will be replaced with something else, until it gets implemented)

## I want to help. How do I build this?

got rid of the build system, because it was easier for me to directly develop from Mixxx and Kate.

however, you can clone this repository, install this mapping, and modify it using Mixxx and your favorite text editor (don't use Notepad though, it does not recognize LF line endings). then copy the changes back to cloned repo, and commit.
