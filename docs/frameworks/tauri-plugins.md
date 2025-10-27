# Tauri Plugins Documentation

> **Source:** Context7 - `/tauri-apps/plugins-workspace`
> **Last Updated:** 2025-10-18

## Overview

This document covers essential Tauri plugins for desktop application development, including notifications, shell operations, and other common functionalities.

---

## Notification Plugin

### Installation

**JavaScript:**
```bash
npm add @tauri-apps/plugin-notification
# or
pnpm add @tauri-apps/plugin-notification
# or
yarn add @tauri-apps/plugin-notification
```

**Rust (Cargo.toml):**
```toml
[dependencies]
tauri-plugin-notification = "2.0.0"
# or from Git:
tauri-plugin-notification = { git = "https://github.com/tauri-apps/plugins-workspace", branch = "v2" }
```

### Setup

**Register Plugin (Rust):**
```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Permissions (capabilities/main.json):**
```json
{
  "permissions": [
    "notification:default"
  ]
}
```

### Usage

#### Basic Notifications

```typescript
import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from '@tauri-apps/plugin-notification';

// Check and request permission
let permissionGranted = await isPermissionGranted();
if (!permissionGranted) {
  const permission = await requestPermission();
  permissionGranted = permission === 'granted';
}

if (permissionGranted) {
  // Simple notification
  sendNotification({
    title: 'New Message',
    body: 'You have received a new message from Alice'
  });

  // Notification with ID
  sendNotification({
    id: 42,
    title: 'Download Complete',
    body: 'Your file has been downloaded successfully',
    icon: 'download_icon'
  });
}
```

#### Notifications with Sound

```typescript
import { sendNotification } from '@tauri-apps/plugin-notification';
import { platform } from '@tauri-apps/api/os';

// Basic notification with sound
sendNotification({
  title: 'New Message',
  body: 'You have a new message',
  sound: 'notification.wav'
});

// Platform-specific sounds
async function sendPlatformSpecificNotification() {
  const platformName = platform();

  let soundPath;
  if (platformName === 'darwin') {
    soundPath = 'Ping'; // macOS system sound
  } else if (platformName === 'linux') {
    soundPath = 'message-new-instant'; // XDG theme sound
  } else {
    soundPath = 'notification.wav'; // Windows file path
  }

  sendNotification({
    title: 'Platform-specific Notification',
    body: 'This notification uses platform-specific sound',
    sound: soundPath
  });
}
```

#### Scheduled Notifications

```typescript
import { sendNotification, Schedule } from '@tauri-apps/plugin-notification';

// Schedule for specific time
const futureDate = new Date();
futureDate.setHours(futureDate.getHours() + 2);

sendNotification({
  title: 'Reminder',
  body: 'Meeting in 2 hours',
  schedule: Schedule.at(futureDate)
});

// Repeating notification (daily at 9 AM)
sendNotification({
  title: 'Daily Reminder',
  body: 'Time to take your medicine',
  schedule: Schedule.at(new Date(2025, 0, 1, 9, 0), true)
});

// Interval-based notification
sendNotification({
  title: 'Hourly Update',
  body: 'System status check',
  schedule: Schedule.every('hour', 1)
});
```

### API Reference

#### `isPermissionGranted()`
Checks if notification permission is granted.

**Returns:** `Promise<boolean>`

#### `requestPermission()`
Requests notification permission from the user.

**Returns:** `Promise<'granted' | 'denied'>`

#### `sendNotification(options)`
Sends a notification.

**Parameters:**
- `title` (string, required) - Notification title
- `body` (string, required) - Notification content
- `id` (number, optional) - Unique identifier
- `icon` (string, optional) - Icon path or name
- `sound` (string, optional) - Sound file path or system sound name
- `schedule` (Schedule, optional) - Scheduling options

---

## Shell Plugin

### Installation

**JavaScript:**
```bash
npm add @tauri-apps/plugin-shell
# or
pnpm add @tauri-apps/plugin-shell
# or
yarn add @tauri-apps/plugin-shell
```

**Rust (Cargo.toml):**
```toml
[dependencies]
tauri-plugin-shell = "2.0.0"
# or from Git:
tauri-plugin-shell = { git = "https://github.com/tauri-apps/plugins-workspace", branch = "v2" }
```

### Setup

**Register Plugin (Rust):**
```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Usage

#### Execute Commands

```typescript
import { Command } from '@tauri-apps/plugin-shell';

// Basic command with arguments
const output = await Command.create('ls', ['-la', '/tmp']).execute();
console.log('Exit code:', output.code);
console.log('stdout:', output.stdout);
console.log('stderr:', output.stderr);

// With environment variables
const envOutput = await Command.create('printenv')
  .env({ CUSTOM_VAR: 'value123' })
  .execute();
console.log('Environment:', envOutput.stdout);

// Change working directory
const cwdOutput = await Command.create('pwd')
  .cwd('/home/user/projects')
  .execute();
console.log('Working directory:', cwdOutput.stdout);
```

#### Stream Command Output

```typescript
import { Command } from '@tauri-apps/plugin-shell';

const command = Command.create('npm', ['install']);

// Listen to events
command.on('close', (data) => {
  console.log(`Process exited with code ${data.code}`);
});

command.on('error', (error) => {
  console.error('Command error:', error);
});

command.stdout.on('data', (line) => {
  console.log('stdout:', line);
});

command.stderr.on('data', (line) => {
  console.error('stderr:', line);
});

// Spawn without waiting
const child = await command.spawn();
console.log('Process PID:', child.pid);
```

#### Open Files and URLs

```typescript
import { open } from '@tauri-apps/plugin-shell';

// Open URL in default browser
await open('https://tauri.app');

// Open file with default application
await open('/path/to/document.pdf');

// Open with specific program
await open('/path/to/image.png', 'gimp');
```

### Permissions

The shell plugin has granular permissions:

| Permission | Description |
|------------|-------------|
| `shell:allow-execute` | Allow command execution |
| `shell:deny-execute` | Deny command execution |
| `shell:allow-kill` | Allow killing processes |
| `shell:deny-kill` | Deny killing processes |
| `shell:allow-open` | Allow opening files/URLs |
| `shell:deny-open` | Deny opening files/URLs |
| `shell:allow-spawn` | Allow spawning processes |
| `shell:deny-spawn` | Deny spawning processes |
| `shell:allow-stdin-write` | Allow writing to stdin |
| `shell:deny-stdin-write` | Deny writing to stdin |

**Default Configuration:**
```toml
[allow-open]
open = ["*.http", "*.https", "*.mailto", "*.tel"]
```

---

## Additional Plugins

### Dialog Plugin

**Installation:**
```bash
npm add @tauri-apps/plugin-dialog
```

**Usage:**
```typescript
import { message, ask, confirm } from '@tauri-apps/plugin-dialog';

// Simple message
await message('Operation completed successfully!', {
  title: 'Success',
  kind: 'info'
});

// Warning message
await message('Your changes have not been saved', {
  title: 'Warning',
  kind: 'warning',
  buttons: { ok: 'I Understand' }
});

// Yes/No confirmation
const shouldDelete = await confirm('Delete all user data?', {
  title: 'Confirm Delete',
  kind: 'warning',
  buttons: 'YesNo'
});

if (shouldDelete) {
  console.log('User confirmed deletion');
}

// Yes/No/Cancel
const choice = await ask('Save changes before closing?', {
  title: 'Unsaved Changes',
  buttons: {
    yes: 'Save & Close',
    no: 'Discard Changes',
    cancel: 'Cancel'
  }
});
console.log('User choice:', choice); // true, false, or null
```

### Filesystem Plugin

**Watch Files:**
```typescript
import { watch, watchImmediate, BaseDirectory } from '@tauri-apps/plugin-fs';

// Watch with debouncing (2 second delay)
const unwatch = await watch(
  'config',
  (event) => {
    console.log(`Event type:`, event.type);
    console.log(`Paths changed:`, event.paths);
    if (typeof event.type === 'object' && 'modify' in event.type) {
      console.log('File was modified');
    }
  },
  {
    baseDir: BaseDirectory.AppConfig,
    recursive: true,
    delayMs: 2000
  }
);

// Watch immediately without debouncing
const unwatchImmediate = await watchImmediate(
  ['file1.txt', 'file2.txt'],
  (event) => {
    if (typeof event.type === 'object' && 'create' in event.type) {
      console.log('File created:', event.paths);
    }
  },
  { baseDir: BaseDirectory.AppData }
);

// Stop watching
unwatch();
unwatchImmediate();
```

### Haptics Plugin

**Installation:**
```bash
npm add @tauri-apps/plugin-haptics
```

**Usage:**
```typescript
import { haptic } from '@tauri-apps/plugin-haptics';

// Simple vibration
await haptic({ duration: 200 });

// Pattern vibration
await haptic({
  duration: [100, 50, 100, 50, 200],
  pattern: true
});

// Predefined haptic types (iOS)
await haptic({ type: 'impact', style: 'medium' });
await haptic({ type: 'notification', style: 'success' });
```

## Best Practices

1. **Always check permissions** - Use permission checks before accessing plugin features
2. **Handle errors gracefully** - Wrap plugin calls in try-catch blocks
3. **Use appropriate permissions** - Only request the permissions you need
4. **Clean up resources** - Unsubscribe from watchers and close streams
5. **Test on all platforms** - Plugin behavior may vary across operating systems
6. **Consider security** - Be cautious with shell commands and file access

## Resources

- Official Plugins Repository: https://github.com/tauri-apps/plugins-workspace
- Tauri Plugins Documentation: https://tauri.app/v2/reference/javascript/
- Plugin Development Guide: https://tauri.app/v2/develop/plugins/
