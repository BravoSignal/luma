<img src="desktop/app/icon.png" width="72" alt="Luma icon">

# Luma

**Your music. One moment away.**

Luma is a customizable desktop music widget for **macOS and Windows**. Move your pointer into a screen zone or hold a shortcut to bring your music controls into reach. Your music stays in YouTube Music in your existing browser.

**[Download Luma 1.5.2](https://github.com/BravoSignal/luma/releases/tag/v1.5.2)** · [Installation & updates](docs/SETUP.md) · [Deutsch](docs/SETUP.de.md)

## Choose your download

| Your computer | Download |
| --- | --- |
| Mac with an Apple M-series chip | [macOS · Apple Silicon](https://github.com/BravoSignal/luma/releases/download/v1.5.2/Luma-1.5.2-macOS-Apple-Silicon.zip) |
| Mac with an Intel processor | [macOS · Intel](https://github.com/BravoSignal/luma/releases/download/v1.5.2/Luma-1.5.2-macOS-Intel.zip) |
| Windows PC with an Intel or AMD processor | [Windows · x64](https://github.com/BravoSignal/luma/releases/download/v1.5.2/Luma-1.5.2-Windows-x64.zip) |

Download **one desktop package** for your computer. On a Mac, **Apple menu → About This Mac** shows its chip or processor. GitHub's automatically generated “Source code” downloads are for developers; they are not installable apps.

**Preview release:** the Mac app is unsigned and not notarized. Apple Silicon has been tested locally; the Intel and Windows packages have been built but not run on those devices.

## Make it yours

- A separate activation zone for each screen, including the top screen edge.
- A freely chosen key or key combination that shows the widget while held.
- Compact playback controls and an expanded view with artwork, progress and volume.
- Artwork colors or your own accent; adjustable size, layout, typeface and spacing.
- Drag a free area to move temporarily; Pin remembers the position.
- English by default, with optional German.

Basic playback can use system media controls. The optional **Luma Bridge** extension connects YouTube Music in Chrome, Edge or Brave for additional controls, track ratings, the playlist dialog and focusing the existing music tab. **Add to playlist** opens YouTube Music's selection dialog in the browser.

## Connect or update the extension

The release includes **Luma Bridge 1.3.1**. The [Chrome Web Store listing](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc) currently shows **1.3.0**. For the rating and playlist fixes in this release, use the bundled **1.3.1** extension until that version reaches the store.

**First installation:** open Luma → **Connection → Prepare extension folder**. In `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select that folder. Paste Luma's pairing code into the extension options and reload YouTube Music.

**Already installed?** Quit Luma, replace the desktop app with the new version, reopen it and choose **Connection → Prepare extension folder** again. Click **Reload ↻** on the existing Luma extension in `chrome://extensions`, then reload YouTube Music. Your settings and pairing code are kept. [Step-by-step setup](docs/SETUP.md)

## What's changed in 1.5.2

Up next has been removed. Like/dislike now use the actual YouTube Music buttons and wait for a confirmed state change. The playlist command brings the browser forward and waits for a visible playlist picker. This release also includes the English interface and reorganized customization settings added since 1.4.1. See the [release notes](https://github.com/BravoSignal/luma/releases/tag/v1.5.2) for validation and limits.

## Privacy

Luma Bridge connects only to YouTube Music and the desktop app on the same computer. No Luma account, Luma server or analytics. Pair each computer separately. [How the local connection works](desktop/README.md#connect-youtube-music)

## Development

The application source is in [`desktop/`](desktop/). Start with the [development instructions](desktop/README.md#development).

```sh
cd desktop
npm ci
```

The source includes automated checks and build instructions for the native media helpers. YouTube Music can change its page structure and require extension updates.
