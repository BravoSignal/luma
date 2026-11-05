# Set up Luma

[Download Luma 1.7.6](https://github.com/BravoSignal/luma/releases/tag/v1.7.6) · [Deutsch](SETUP.de.md) · [Back to Luma](../README.md)

## Install the desktop app

| Computer | Download |
| --- | --- |
| Mac · Apple Silicon (M-series) | [Mac app](https://github.com/BravoSignal/luma/releases/download/v1.7.6/Luma-1.7.6-arm64-mac.zip) |
| Mac · Intel | [Mac app](https://github.com/BravoSignal/luma/releases/download/v1.7.6/Luma-1.7.6-mac.zip) |
| Windows · Intel / AMD | [Setup installer](https://github.com/BravoSignal/luma/releases/download/v1.7.6/Luma-Setup-1.7.6.exe) |

Mac: extract the ZIP, move Luma.app to Applications and open it. Luma lives in the top menu bar, without a Dock icon. Allow Input Monitoring under macOS Privacy & Security when using a global hold shortcut, then restart Luma if macOS asks. This preview uses ad-hoc signing and is not notarized.

Windows: run Setup and open Luma from the system tray. The optional portable ZIP must be fully extracted; keep its files together. Windows may hide the mini-control icons in its notification-area overflow.

## Connect YouTube Music

1. [Install Luma Bridge](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc) in the same browser profile as YouTube Music.
2. In Luma → Connection, copy the pairing code. Paste it into Bridge options and connect.
3. **Refresh the already open YouTube Music tab.** Pairing alone does not activate a tab’s new content script. Bridge has a prominent refresh button and automatically refreshes music tabs when it is installed/updated. Playback may briefly be interrupted.
4. Start music and check that the widget says YouTube Music. A paired browser with no reporting music tab shows a refresh hint. No extra Google login or Luma account is required.

## Configure the widget

Activation controls independent per-screen zones, free hold shortcuts and timing. Empty widget space can be dragged; a click expands it. Pin saves the position. Customize includes horizontal/vertical layouts, colors, typography, optional ratings/playlist buttons, the mini player, and **Show new songs / Song preview duration** (default 2 seconds). Sliders retain the expanded view while dragged outside. App profiles can override activation and layout.

## Pause music for videos

Automatic pause starts off. In Playback, enable Automatic pause and Pause for browser videos. In Bridge options, click **Enable detection on all websites** and accept Chrome’s prompt. If access was already allowed, no prompt appears; the button confirms the enabled state. Add domains to Excluded websites to keep music playing there; subdomains and embedded players on excluded pages are ignored. Reload already open video tabs after an extension update. YouTube Music is always excluded.

Choose fade duration, muted/visible-tab filters, automatic resume and delay in Luma. Music resumes only after a pause Luma issued and confirmed. Manual playback and seeking take priority. Foreground-app rules pause whenever that application is in front; app-specific audio-output detection is not included.

## Updates

Desktop: Updates → Restart & install. Settings and pairing are preserved. Chrome updates a store-installed Bridge after its approved release is published. Uploading a draft package alone is not enough. Unpacked extensions do not auto-update.

## Local bridge update

[Download Bridge 1.6.3 ZIP](https://github.com/BravoSignal/luma/releases/download/v1.7.6/Luma-Bridge-1.6.3.zip) if the store version is older. Extract it first. Open chrome://extensions (or the Edge/Brave equivalent), enable Developer mode and use Load unpacked for a first install. Select the folder containing manifest.json, not the ZIP. For an existing unpacked copy, replace files **inside the same folder** and click Reload to preserve pairing. Keep one Bridge copy active. YouTube Music tabs refresh automatically; use the refresh button or browser reload if needed. Website access remains optional and can be disabled in Bridge options.

## Troubleshooting

- No Dock icon: use the Mac menu bar.
- Browser paired but controls unavailable: refresh YouTube Music and check Bridge version.
- Shortcut unavailable: check macOS Input Monitoring and restart when requested.
- Automatic pause unavailable: select YouTube Music with Bridge, enable website detection and check exclusions.
- Record a reproducible issue using Updates → Troubleshooting and export the local diagnostic report. [Windows guide](../desktop/DEBUG-WINDOWS.md).
