# xterm.js Documentation

> **Source:** Context7 - `/xtermjs/xterm.js`
> **Last Updated:** 2025-10-18

## Overview

Xterm.js is a front-end component written in TypeScript that enables applications to integrate fully-featured terminals directly into the browser. It's used by popular applications like VS Code, Hyper, and Codecademy.

## Installation

```bash
npm install --save @xterm/xterm
```

## Basic Usage

### HTML Setup

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="node_modules/@xterm/xterm/css/xterm.css" />
    <script src="node_modules/@xterm/xterm/lib/xterm.js"></script>
  </head>
  <body>
    <div id="terminal"></div>
    <script>
      var term = new Terminal();
      term.open(document.getElementById('terminal'));
      term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    </script>
  </body>
</html>
```

### ES6 Module

```typescript
import { Terminal } from '@xterm/xterm';

const terminal = new Terminal();
terminal.open(document.getElementById('terminal'));
terminal.write('Hello from xterm.js $ ');
```

## Core Addons

### Fit Addon

Automatically resize terminal to fit container.

**Installation:**
```bash
npm install --save @xterm/addon-fit
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

const terminal = new Terminal();
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(containerElement);
fitAddon.fit();
```

### WebGL Addon

Hardware-accelerated rendering for better performance.

**Installation:**
```bash
npm install --save @xterm/addon-webgl
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';

const terminal = new Terminal();
terminal.open(element);
terminal.loadAddon(new WebglAddon());
```

**Handle Context Loss:**
```typescript
const addon = new WebglAddon();
addon.onContextLoss(e => {
  addon.dispose();
});
terminal.loadAddon(addon);
```

### Search Addon

Search functionality within terminal output.

**Installation:**
```bash
npm install --save @xterm/addon-search
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { SearchAddon } from '@xterm/addon-search';

const terminal = new Terminal();
const searchAddon = new SearchAddon();
terminal.loadAddon(searchAddon);

// Search for text
searchAddon.findNext('foo');
searchAddon.findPrevious('bar');
```

### Web Links Addon

Automatically detect and make URLs clickable.

**Installation:**
```bash
npm install --save @xterm/addon-web-links
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { WebLinksAddon } from '@xterm/addon-web-links';

const terminal = new Terminal();
terminal.loadAddon(new WebLinksAddon());
```

### Attach Addon

Connect terminal to a WebSocket.

**Installation:**
```bash
npm install --save @xterm/addon-attach
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { AttachAddon } from '@xterm/addon-attach';

const terminal = new Terminal();
const webSocket = new WebSocket('ws://localhost:3000');
const attachAddon = new AttachAddon(webSocket);
terminal.loadAddon(attachAddon);
```

### Serialize Addon

Serialize terminal contents to string.

**Installation:**
```bash
npm install --save @xterm/addon-serialize
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { SerializeAddon } from '@xterm/addon-serialize';

const terminal = new Terminal();
const serializeAddon = new SerializeAddon();
terminal.loadAddon(serializeAddon);

terminal.write('something...', () => {
  console.log(serializeAddon.serialize());
});
```

### Image Addon

Display inline images (SIXEL and iTerm IIP).

**Installation:**
```bash
npm install --save @xterm/addon-image
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { ImageAddon, IImageAddonOptions } from '@xterm/addon-image';

const customSettings: IImageAddonOptions = {
  enableSizeReports: true,
  pixelLimit: 16777216,
  sixelSupport: true,
  sixelScrolling: true,
  sixelPaletteLimit: 256,
  sixelSizeLimit: 25000000,
  storageLimit: 128,
  showPlaceholder: true,
  iipSupport: true,
  iipSizeLimit: 20000000
};

const terminal = new Terminal();
const imageAddon = new ImageAddon(customSettings);
terminal.loadAddon(imageAddon);
```

### Ligatures Addon

Enable font ligatures in terminal.

**Installation:**
```bash
npm install --save @xterm/addon-ligatures
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { LigaturesAddon } from '@xterm/addon-ligatures';

const terminal = new Terminal();
const ligaturesAddon = new LigaturesAddon();
terminal.open(containerElement);
terminal.loadAddon(ligaturesAddon);
```

### Unicode Graphemes Addon

Better handling of Unicode graphemes.

**Installation:**
```bash
npm install --save @xterm/addon-unicode-graphemes
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { UnicodeGraphemesAddon } from '@xterm/addon-unicode-graphemes';

const terminal = new Terminal();
const unicodeGraphemesAddon = new UnicodeGraphemesAddon();
terminal.loadAddon(unicodeGraphemesAddon);
```

### Clipboard Addon

Enhanced clipboard functionality.

**Installation:**
```bash
npm install --save @xterm/addon-clipboard
```

**Basic Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { ClipboardAddon } from '@xterm/addon-clipboard';

const terminal = new Terminal();
const clipboardAddon = new ClipboardAddon();
terminal.loadAddon(clipboardAddon);
```

**Custom Provider:**
```typescript
import { ClipboardAddon, IClipboardProvider, ClipboardSelectionType } from '@xterm/addon-clipboard';

class MyCustomClipboardProvider implements IClipboardProvider {
  private _data: string;

  public readText(selection: ClipboardSelectionType): Promise<string> {
    return Promise.resolve(this._data);
  }

  public writeText(selection: ClipboardSelectionType, data: string): Promise<void> {
    this._data = data;
    return Promise.resolve();
  }
}

const terminal = new Terminal();
const clipboardAddon = new ClipboardAddon(new MyCustomClipboardProvider());
terminal.loadAddon(clipboardAddon);
```

### Progress Addon

Display progress indicators in terminal.

**Installation:**
```bash
npm install --save @xterm/addon-progress
```

**Usage:**
```typescript
import { Terminal } from '@xterm/xterm';
import { ProgressAddon, IProgressState } from '@xterm/addon-progress';

const terminal = new Terminal();
const progressAddon = new ProgressAddon();
terminal.loadAddon(progressAddon);

progressAddon.onChange(({state, value}: IProgressState) => {
  // state: 0-4 integer
  // value: 0-100 integer (percent value)
  // Update your UI based on state/value
});
```

**ConEmu Progress Sequence:**
```
ESC ] 9 ; 4 ; <state> ; <progress value> BEL
```

## Real-World Usage Examples

### VS Code Integration

VS Code uses xterm.js to provide integrated terminal functionality directly in the editor.

### Codecademy Bash Course

Codecademy utilizes xterm.js in their Bash courses to provide an interactive command-line learning environment.

### GoTTY - Terminal Sharing

GoTTY shares your terminal session as a web application using xterm.js for the web interface.

### TermPair - Remote Terminal Control

TermPair enables viewing and controlling terminals from a web browser with end-to-end encryption.

## Development

### Build with esbuild

```bash
yarn run esbuild-watch
```

This compiles the core library, all addons, and integration tests.

### Run Unit Tests

```bash
# All tests
yarn test-unit

# Specific addon
yarn test-unit addons/addon-image/out-esbuild/*.test.js
```

### Run Integration Tests

```bash
# All integration tests
yarn test-integration

# Specific addon
yarn test-integration --suite=addon-search
```

## Terminal Configuration

### Basic Options

```typescript
const terminal = new Terminal({
  cursorStyle: 'block',
  cursorBlink: true,
  theme: {
    background: '#000',
    foreground: '#0f0'
  },
  convertEol: true,
  scrollback: 10000
});
```

## Best Practices

1. **Always dispose** - Clean up terminal instances when done
2. **Use addons wisely** - Only load addons you need
3. **Handle context loss** - Especially important for WebGL addon
4. **Fit on resize** - Use FitAddon and call fit() on window resize
5. **Optimize rendering** - Consider WebGL addon for better performance

## Resources

- Official Website: https://xtermjs.org
- GitHub: https://github.com/xtermjs/xterm.js
- API Documentation: https://xtermjs.org/docs/
