# Social Hub

Social Hub is a desktop social media browser that brings X, Instagram, TikTok, YouTube, and Twitch into one app.

## Features

- Single-pane and side-by-side split view
- Drag and drop social buttons into the left or right pane
- Persistent layout and selected service state
- Automatic video/audio pause for hidden services
- External browser fallback
- Keyboard shortcuts

## Development Setup

To run or build the app from source, install [Node.js](https://nodejs.org/) and the [Rust](https://www.rust-lang.org/tools/install) toolchain. Node.js 22 or later is recommended.

This app is built with Tauri, so Rust is required for the native desktop shell.

### Install Rust

#### macOS / Linux

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, restart your terminal or load the Rust environment variables:

```bash
source "$HOME/.cargo/env"
```

#### Windows

Download and run [rustup-init.exe](https://win.rustup.rs/), or run the following command in PowerShell.

Visual Studio C++ Build Tools are also required.

```powershell
winget install --id Rustlang.Rustup -e
```

#### Verify Installation

```bash
rustc --version
cargo --version
```

### Install Dependencies

```bash
npm install
```

## Run in Development Mode

```bash
npm run dev
```

## Build

Build the app on the same operating system as the target platform. Cross-compilation is not supported.

### macOS

Run this on macOS:

```bash
npm install
npm run build:app
```

Output:

```text
src-tauri/target/release/bundle/macos/Social Hub.app
```

### Windows

Run this on a Windows PC after installing Node.js and Rust:

```bash
npm install
npm run build:windows
```

Output:

```text
src-tauri/target/release/bundle/msi/*.msi
src-tauri/target/release/bundle/nsis/*.exe
```

> Running `npm run build:windows` on macOS or Linux will fail because Windows installers can only be produced in a Windows environment.

#### Build with GitHub Actions

If you do not have a Windows PC, use GitHub Actions.

The Windows build runs automatically when changes are pushed to the `main` branch. To run it manually, open the **Actions** tab on GitHub, select the **Build Windows** workflow, and click **Run workflow**.

After the workflow finishes, download the `.msi` or `.exe` installer from the `social-hub-windows` artifact.

## Shortcuts

- `1` - `5`: Select a service in the left pane
- `Shift + 1` - `Shift + 5`: Select a service in the right pane and switch to split view
- `S`: Toggle single-pane / split view
- `R`: Reload the active pane
- `O`: Open the active service in an external browser

## Limitations

Each service is displayed through its official web version inside a WebView. Depending on each service's restrictions, login behavior or some features may be limited.
