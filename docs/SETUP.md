# Install or update Luma

[Download 1.7.1](https://github.com/BravoSignal/luma/releases/tag/v1.7.1) · [Deutsch](SETUP.de.md) · [Back to Luma](../README.md)

## Install the desktop app

| Your computer | Download |
| --- | --- |
| Mac · Apple Silicon (M-series) | [Mac app](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-1.7.1-arm64-mac.zip) |
| Mac · Intel | [Mac app](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-1.7.1-mac.zip) |
| Windows · Intel / AMD | [Setup installer](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-Setup-1.7.1.exe) |

Mac: extract the ZIP, move Luma.app into Applications and open it. Find Luma in the **top menu bar**, with no Dock icon. Windows: run Setup and use the **system-tray icon**. Portable users must extract every file and keep them together. Setup is recommended for future updates. Packages are unsigned and not notarized by Apple.

## Connect YouTube Music

Install [Luma Bridge from the Chrome Web Store](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc). In the desktop app → Connection, copy the pairing code into the extension options. Connect, look for the green confirmation and reload YouTube Music. Install both the desktop app and bridge. No Google password is entered into Luma. Pair each computer separately.

## Set up your widget

- **Activation:** draw a zone, refine its handles or numbers, then choose Done. Zones and widget dimensions are independent. Delete zone affects one screen; Undo restores it. Mouse dragging can snap to the edge; numeric input stays exact.
- **Activation timing:** set the zone-entry delay, hide delay and continuous outside-zone time required after X. Holding your shortcut responds immediately.
- **Customize:** choose orientation, dimensions, accent and cover background. Expand the details for typography, optional buttons and background blur. Restore appearance defaults keeps size, positions, zones, language and playback rules.
- **Profiles:** add a running app and adjust its triggers, zones and layout. General settings are the fallback. Appearance settings and playback rules are shared across profiles.
- **Mini player:** optional native controls in the menu bar or Windows notification area. Windows may hide them in the overflow menu.
- **Controls:** click empty compact space to expand, drag to move temporarily, Pin to remember, X to dismiss. Clicking the title focuses the music tab; playlist opens the browser picker.

## Smart playback

Under Playback, prefer a source or lock one. If a locked source closes, Luma waits instead of controlling something else. Individual YouTube Music tabs require Bridge 1.5+.

Automatic pause starts **off**. Enable it, add foreground apps and optionally enable videos or other browser audio. In Bridge 1.5 options, explicitly allow each video site. No broad default site access is granted. Embedded players may need their own origin allowed. Reload the site after granting permission. Configure muted/visible-tab filters and resume delay. Manual playback, seeking or source changes take priority over automation.

On Mac, automatic pause needs YouTube Music with Bridge. Windows can target supported native music apps and optionally use OS-reported video sessions, without mute detection for those native sessions. Native browser sessions cannot be automatically paused safely. App rules are foreground rules, not active-call detection.

## Update an existing installation

From 1.6.1 onward, open Updates. Checks/downloads can run automatically; **Restart & install** applies the update. Settings and pairing remain. Older versions need one manual install. Quit the previous app before replacing it. On Windows, switch to Setup and stop launching the old portable copy.

The desktop update does not replace an already-loaded browser extension. Chrome updates the store bridge separately; reload YouTube Music afterward.

## Local bridge update

Use [Bridge 1.5.0 ZIP](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-Bridge-1.5.0.zip) if the store version is older than 1.5.0.

1. Extract the ZIP. Alternatively, use Luma → Connection → Local extension / developer setup → Prepare extension folder.
2. Open `chrome://extensions`, `edge://extensions` or `brave://extensions` and enable Developer mode.
3. For a new installation, choose Load unpacked and select the folder containing manifest.json. For an existing unpacked copy, replace files in its folder and click Reload.
4. Disable any other Luma bridge copy. Pair if needed and reload YouTube Music.
5. In extension options, allow individual video sites only if you want browser-video pause rules.

On Mac, Cmd+Shift+G in a folder picker lets you paste the folder path. To return to the store copy, disable the unpacked copy and enable the store version. The badge shows a green check/dot when connected and red X when disconnected.

## Troubleshooting

- No Dock icon: use the Mac menu bar.
- Missing bridge features: check its version, pairing and whether the music tab was reloaded.
- Automatic pause unavailable: choose a supported music source and configure the rules; on Mac use Bridge.
- Windows mini controls missing: check the notification-area overflow and taskbar icon settings.
- A reproducible error: Updates → Troubleshooting → Record for 5 minutes, reproduce, stop and export. [Windows workflow](../desktop/DEBUG-WINDOWS.md).
