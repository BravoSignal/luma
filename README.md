<img src="desktop/app/icon.png" width="72" alt="Luma icon">

# Luma

**Your music. One moment away.**

A customizable desktop music widget for **macOS and Windows**. Enter a screen zone or hold a shortcut to reveal your controls. YouTube Music stays in your existing browser.

**[Download Luma 1.7.1](https://github.com/BravoSignal/luma/releases/tag/v1.7.1)** · [Setup & updates](docs/SETUP.md) · [Deutsch](docs/SETUP.de.md)

## Get started

Choose **one desktop package**:

| Your computer | Download |
| --- | --- |
| Mac · Apple Silicon (M-series) | [Mac app](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-1.7.1-arm64-mac.zip) |
| Mac · Intel | [Mac app](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-1.7.1-mac.zip) |
| Windows · Intel / AMD | [Setup installer](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-Setup-1.7.1.exe) |

Not sure which Mac? Open Apple menu → About This Mac. A [portable Windows ZIP](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-1.7.1-win.zip) is optional; Setup is recommended for managed updates. GitHub's “Source code” downloads are for development.

1. **Install Luma.** Mac: extract, move Luma.app to Applications and open it. Windows: run Setup. Open settings through the **top menu-bar icon on Mac** or **system tray on Windows**.
2. **[Install Luma Bridge from the Chrome Web Store](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc)** for your YouTube Music tab in Chrome, Edge or Brave. The desktop app and bridge are separate parts; install both.
3. **Pair them.** In Luma → Connection, copy the pairing code into the extension options. Look for the green confirmation and reload YouTube Music.

No Luma account or extra Google sign-in. Pair each computer separately. English is the default; German is optional.

## What changed in 1.7.1

- **Smart music selection:** prefer YouTube Music or system music, or lock a specific source. Bridge 1.5 supports individual music tabs.
- **Optional automatic pause:** choose foreground apps, browser videos or other browser audio. Allow browser sites individually in Bridge. Manual playback takes priority; Luma resumes only a pause it issued and confirmed, after your chosen delay.
- **More organized settings:** adjust cover strength and blur, motion, compact title size and optional buttons. Advanced options stay collapsed. Only dimensions matching your orientation are shown.
- **Zone-entry delay:** prevent accidental openings without delaying the hold shortcut. All timing options are grouped under Activation.
- **Local diagnostics:** record and export a support report without pairing codes, media titles, URLs or personal paths.

**Bridge 1.5 or newer is required for per-tab source selection and browser-video rules.** Chrome manages the store extension separately. If the store has an older version, use the optional [Bridge 1.5.0 ZIP](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-Bridge-1.5.0.zip) and [local installation steps](docs/SETUP.md#local-bridge-update). Keep one bridge copy active.

## Make it yours

- Independent zones on each screen, top-edge placement, exact numeric positioning, delete/Undo and zone testing.
- Any supported hold key or combination. App profiles can have separate triggers, zones, pinned positions, size and orientation.
- Horizontal or vertical layouts, artwork accents and a compact view that expands when needed.
- Drag empty space temporarily; Pin remembers the position. X hides without stopping music, with an adjustable reopening delay.
- Optional native mini controls in the macOS menu bar or Windows notification area. Windows may hide them in its overflow menu.
- Export/import preferences without pairing codes.

Basic playback can use system media controls. Bridge adds browser controls, ratings and the YouTube Music playlist picker. **Add to playlist opens the picker in your browser.** Up next has been removed.

## Updates

From 1.6.1 onward, open **Updates** in Luma. Checks and downloads can run automatically; choose **Restart & install** when ready. Settings and pairing are preserved. Coming from 1.5.x or earlier? Install the current desktop package once. Chrome updates the store bridge independently.

## Validation and platform limits

62 automated tests and UI checks passed. The Apple Silicon build is installed and checked on Mac. Intel and Windows packages are built and verified; on-device testing remains necessary. The app is unsigned and not notarized by Apple. Update metadata is digitally signed and downloaded packages are checked before installation.

On macOS, targeted automatic pause requires YouTube Music with Bridge. Windows can also target supported native app sessions. Native browser sessions are excluded from automatic pause because system controls may switch tabs. Foreground-app rules do not detect active calls. Browser media detection is optional, permission-based and limited to sites you allow.

## Privacy and support

The bridge connects locally; there is no Luma account, analytics or music relay server. The updater contacts GitHub. Optional video rules send anonymous media activity flags from allowed sites to the local app, without recording media or sending page titles/addresses. Diagnostics stay local until you choose to share an exported report. [Windows debugging guide](desktop/DEBUG-WINDOWS.md).

## Development

[Desktop source and development instructions](desktop/README.md#development) · [Release guide](desktop/UPDATE-RELEASING.md)

```sh
cd desktop
npm ci
npm run native:mac  # macOS integration
npm start
```

Windows native integration requires .NET SDK 8. Dependencies, build outputs, local settings and private signing keys are excluded.
