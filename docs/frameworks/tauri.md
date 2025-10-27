# Tauri Framework Documentation

> **Source:** Context7 - `/llmstxt/tauri_app_llms-full_txt`
> **Last Updated:** 2025-10-18

## Overview

Tauri is a framework for building tiny, fast cross-platform desktop and mobile applications using web frontend technologies and backend languages like Rust, Swift, and Kotlin.

## Key Features

- **Cross-Platform:** Build for desktop (Windows, macOS, Linux) and mobile (iOS, Android)
- **Web Technologies:** Use any web frontend framework (React, Vue, Svelte, etc.)
- **Rust Backend:** Powerful, secure backend with Rust
- **Small Bundle Size:** Significantly smaller than Electron
- **Native Performance:** Direct system API access

## Getting Started

### Development Server

Start the Tauri development server:

```bash
npm run tauri dev
# or
yarn tauri dev
# or
pnpm tauri dev
# or
cargo tauri dev
```

The first run may take time to download and build Rust packages. Subsequent builds are faster.

## Project Structure

### Entry Points

#### Desktop Entry Point (main.rs)
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  app_lib::run();
}
```

#### Shared Library Entry Point (lib.rs)
For mobile and desktop compatibility:

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Build Script (build.rs)
```rust
fn main() {
    tauri_build::build();
}
```

## Application Builder

### Basic Application Setup

```rust
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### With Setup Hook

```rust
use tauri::Manager;

tauri::Builder::default()
    .setup(|app| {
        let main_window = app.get_window("main").unwrap();
        main_window.set_title("Tauri!")?;
        Ok(())
    })
    .run(tauri::generate_context!());
```

### Creating Windows Programmatically

```rust
tauri::Builder::default()
    .setup(|app| {
        let webview_url = tauri::WebviewUrl::App("index.html".into());

        // First window
        tauri::WebviewWindowBuilder::new(app, "first", webview_url.clone())
            .title("First")
            .build()?;

        // Second window
        tauri::WebviewWindowBuilder::new(app, "second", webview_url)
            .title("Second")
            .build()?;

        Ok(())
    })
    .run(context)
    .expect("error while running tauri application");
```

## Plugins

### Updater Plugin

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                let response = handle.updater().check().await;
            });
            Ok(())
        })
        .run(tauri::generate_context!());
}
```

### Platform-Specific Updater Target (macOS)

```rust
fn main() {
    let mut updater = tauri_plugin_updater::Builder::new();
    #[cfg(target_os = "macos")]
    {
        updater = updater.target("darwin-universal");
    }
    tauri::Builder::default()
        .plugin(updater.build())
        .run(tauri::generate_context!());
}
```

## WebView Integration

### GTK WebView (Linux)

```rust
use tauri::ApplicationHandler;

#[derive(Default)]
struct App {
    webview_window: Option<(Window, WebView)>
}

impl ApplicationHandler for App {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        let window = event_loop.create_window(Window::default_attributes()).unwrap();
        let webview = WebViewBuilder::new()
            .with_url("https://tauri.app")
            .build(&window)
            .unwrap();

        self.webview_window = Some((window, webview));
    }

    fn window_event(&mut self, _event_loop: &ActiveEventLoop, _window_id: WindowId, event: WindowEvent) {}

    fn about_to_wait(&mut self, _event_loop: &mut ActiveEventLoop) {
        #[cfg(target_os = "linux")]
        while gtk::events_pending() {
            gtk::main_iteration_do(false);
        }
    }
}
```

## Mobile Development

### Adapting for Mobile

Rename `main.rs` to `lib.rs` and use the mobile entry point attribute:

```rust
// src-tauri/src/lib.rs
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // your code here
}
```

Desktop entry point:

```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    app_lib::run();
}
```

## Best Practices

1. **Use the setup hook** for initialization tasks
2. **Handle errors gracefully** with proper error handling
3. **Keep the Rust backend lean** - delegate heavy work to background tasks
4. **Use the event system** for communication between frontend and backend
5. **Test on all target platforms** before release

## Common Configuration

### Window Configuration

When `create` property is set to false in config, build windows programmatically:

```rust
tauri::Builder::default()
    .setup(|app| {
        tauri::WebviewWindowBuilder::from_config(
            app.handle(),
            app.config().app.windows[0]
        )?.build()?;
        Ok(())
    });
```

## Resources

- Official Documentation: https://tauri.app
- GitHub: https://github.com/tauri-apps/tauri
- Discord Community: https://discord.gg/tauri
