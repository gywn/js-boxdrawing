# Menlo Box Drawing

A simple tool for drawing Unicode box/arrow on Mac OS X

## Usage

### Keyboard Commands

|Keys | Actions |
|---|---|
|Arrow Keys | Move around |
|Tab | Toggle erase/draw mode |
|⌥ | Toggle arrow/line mode |
|⌘ + Z | Undo |
|⌘ + ⇧ + Z | Redo |
|⇧ + Arrow Keys | Draw/Erase (_when 1×1 selection is made_) |
|⌘ + ⇧ | Highlight isolated part (_when cursor is on its edges_) |
|⌘ + ⇧ + Arrow Keys | Move isolated part (_when cursor is on its edges_) |
|⌘ + ⇧ + ⌫ | Delete isolated part (_when cursor is on its edges_) |

### Button Commands

|Buttons | Meaning |
|---|---|
|Nothing | Act like normal text zone|
|Regular/Bold/Double| Draw line with [characters](https://en.wikipedia.org/wiki/Box-drawing_character) like ─(U+2500),━(U+2501) or ═(U+2550)|
|Erase | Draw blank character (U+0020)|
|Plain/Round/Dashed| Draw line with [characters](https://en.wikipedia.org/wiki/Box-drawing_character) like ┐(U+2510),╮(U+256E) or ┄(U+2550)|
|Arrow/No Arrow| Draw one arrow character (_after drawn, the mode is automatically toggled back to No Arrow mode_) |

## Why Menlo

Compared to [Menlo](https://en.wikipedia.org/wiki/Menlo_%28typeface%29) shipped by Apple since Mac OS X 10.6, other fix-width fonts (Consolas, Monaco, Courrier...) don't really provide fix-width glyphs on all box-drawing/arrow characters.

### Use other fonts

in `src/main.scss`

```CSS
#thearea, #shadow {
	...
    font-family: "Menlo",monospace;   /* change here */
    ...
}
```

### Limit to Regular/Plain drawing

in `src/box_data.rb`

```RUBY
FONT = 'Menlo'   # change to 'Courrier' 
```

## Demo

http://hijack111.github.io/js-boxdrawing/

## Compile from source

Beside YUI compressor (which is already included in `tools/`), you should have Ruby and SASS installed on your machine.