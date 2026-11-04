<img src="desktop/app/icon.png" width="72" alt="Luma icon">

# Luma

**Your music. One moment away.**

A customizable music widget for **macOS and Windows**. Move your pointer into a screen zone or hold a shortcut to reveal your music controls. YouTube Music stays in your existing browser.

**[Download Luma 1.6.1](https://github.com/BravoSignal/luma/releases/tag/v1.6.1)** · [Setup & updates](docs/SETUP.md) · [Deutsch](docs/SETUP.de.md)

## Get started

Download **one desktop package** for your computer:

| Your computer | Download |
| --- | --- |
| Mac with an Apple M-series chip | [macOS · Apple Silicon](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-1.6.1-arm64-mac.zip) |
| Mac with an Intel processor | [macOS · Intel](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-1.6.1-mac.zip) |
| Windows PC with an Intel or AMD processor | [Windows · Setup installer](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-Setup-1.6.1.exe) |

On a Mac, **Apple menu → About This Mac** shows your chip or processor. A [portable Windows ZIP](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-1.6.1-win.zip) is also available. GitHub's “Source code” archives are for development, not installation.

1. **Install Luma.** Mac: extract the ZIP and move Luma.app to Applications. Windows: run Setup. Open settings through the **top menu-bar icon on Mac** or **system-tray icon on Windows**.
2. **[Add Luma Bridge from the Chrome Web Store](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc)** for YouTube Music in Chrome, Edge or Brave. The extension connects your browser to the desktop widget; both parts must be installed.
3. **Pair them.** In Luma → Connection, copy the pairing code into the extension options. Look for the green confirmation and reload YouTube Music.

No Luma account or extra Google sign-in. Each computer has its own pairing code. **English is the default; German is optional.**

## Make it yours

- Independent activation zones for each screen, including the top edge. Delete, test or restore a zone without changing the others.
- Your own hold key or key combination; separate activation rules, positions and layouts for individual apps.
- Horizontal or vertical widgets with a compact view and an expanded artwork view. Set size and orientation separately for each screen.
- Artwork colors or your own accent, adjustable typography and spacing.
- Drag empty widget space to move temporarily; Pin saves the position. X hides the widget, with an adjustable delay before it can reopen.
- Optional native mini playback controls in the macOS menu bar or the Windows taskbar's notification area.
- Preferences and app profiles export/import, without sharing pairing codes.

Basic playback can use system media controls. Luma Bridge adds browser-specific controls, ratings, the YouTube Music playlist picker and focusing the existing music tab. **Add to playlist opens the picker in your browser.** The Up next feature has been removed.

## What changed in 1.6.1

This release brings automatic desktop update checks and downloads, app profiles, vertical layouts, independent zone deletion with Undo, exact numeric positioning, a larger connection status and navigation that follows scrolling. It also adds native mini controls and settings export/import.

The optional [Bridge 1.4.0 ZIP](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-Bridge-1.4.0.zip) adds a connection indicator on YouTube Music: green check, quiet green dot, or red X with setup help. If the store still has an older version, use the local extension instructions in the [setup guide](docs/SETUP.md#local-bridge-update). Use one active bridge copy at a time.

## Updating

From **1.6.1 onward**, use **Updates** in Luma. Automatic checks and downloads are enabled by default; choose **Restart & install** when an update is ready. You can turn automatic updates off and check manually. Only stable releases are offered. Preferences and pairing are kept.

Coming from 1.5.x or earlier? Install 1.6.1 once using the downloads above. Quit the old app before replacing it. On Windows, use Setup and stop launching the old portable copy. Chrome manages updates for the store-installed extension separately.

## Validation and platform notes

44 automated checks, interface tests and a native Mac integration check passed. The installed Apple Silicon app and live public update feed were checked. Windows and Intel packages are built and verified, but need on-device testing. The app is not signed with a developer certificate or notarized by Apple; system security prompts may apply. Update metadata has its own digital signature, and downloaded packages are checked before installation.

## Privacy

The bridge connects YouTube Music to Luma on the same computer. No Luma account, analytics or music relay server. The desktop updater contacts GitHub to check and download releases; it does not send pairing codes or music metadata. App profiles use local foreground-app identification. [Connection details](desktop/README.md#connect-youtube-music)

## Development

Source and development instructions are in [desktop/](desktop/README.md#development). [Update publishing guide](desktop/UPDATE-RELEASING.md).

```sh
cd desktop
npm ci
npm run native:mac  # macOS native integration
npm start
```

The Windows native helper requires .NET SDK 8. Dependencies, build outputs, local settings and private signing keys are excluded from source control.
