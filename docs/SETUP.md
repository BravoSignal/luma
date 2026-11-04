# Install or update Luma

[Download 1.6.1](https://github.com/BravoSignal/luma/releases/tag/v1.6.1) · [Deutsch](SETUP.de.md) · [Back to Luma](../README.md)

## Install the desktop app

| Your computer | Download |
| --- | --- |
| Mac with an Apple M-series chip | [macOS · Apple Silicon](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-1.6.1-arm64-mac.zip) |
| Mac with an Intel processor | [macOS · Intel](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-1.6.1-mac.zip) |
| Windows PC with an Intel or AMD processor | [Windows · Setup installer](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-Setup-1.6.1.exe) |

**Mac:** extract the ZIP, move **Luma.app** into **Applications** and open it. Luma lives in the **top menu bar**, with no Dock icon. Click that icon to open settings. Check Apple menu → About This Mac if you are unsure which download to choose.

**Windows:** run the Setup installer and launch Luma. Open settings through its system-tray icon. The optional portable ZIP must be extracted in full; keep all files together. Use Setup for a single managed installation and future updates.

The packages are not signed with a developer certificate; macOS notarization is not available. System security prompts may apply. GitHub's “Source code” archives are for developers, not installation.

## Connect YouTube Music

Luma Desktop displays the widget. **[Luma Bridge in the Chrome Web Store](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc)** connects it to your existing YouTube Music tab in Chrome, Edge or Brave. Install both parts.

1. Start the desktop app and install the browser extension.
2. In Luma → **Connection**, choose **Copy pairing code**.
3. Open the extension options, paste the code and connect.
4. Look for the green confirmation, reload YouTube Music and play a track.

No Google password is entered into Luma. Pair each computer separately. **Add to playlist** opens YouTube Music's playlist picker in the existing browser tab.

If you discovered Luma in the Web Store first, install the desktop app using the table above. The extension alone does not display a desktop widget. On Mac, look in the top menu bar; on Windows, look in the system tray.

## Set up your widget

- **Activation:** draw a zone for each screen, adjust it, then choose Done. Delete zone removes only that screen's zone; Undo restores it. Numeric fields stay exact; mouse dragging snaps near the edges. Widget size is independent of zone size.
- **Hold shortcut:** record a key or combination. Holding it shows the compact widget; holding it while the pointer is over the widget expands it. macOS requires Accessibility permission for the global shortcut.
- **Customize:** choose horizontal or vertical, size, accent and typography. Each screen can override size and orientation. Enable the mini player for native playback controls in the menu bar or Windows notification area. Windows may place these icons in its overflow menu; show them in taskbar settings.
- **Profiles:** add an app and choose its activation methods, zones, positions and layout. General settings are the fallback. Reassign imported profiles when switching operating systems.
- **Widget:** click empty space to expand, drag it to move temporarily, and Pin to save the position. X hides it without stopping playback. Set **Reopen after closing** to require a continuous interval outside the zones before it can reappear.
- **Export/import:** transfer preferences without pairing codes. Monitor assignments are remapped; review zones on the destination computer.

## Update the desktop app

**Already on 1.6.1 or newer:** open **Updates**. Luma checks shortly after launch and every six hours. Automatic checks/downloads are optional. **Check for updates** works manually; **Restart & install** installs a ready package. Settings and pairing stay in place. Only stable releases are offered.

**On 1.5.x or earlier:** quit Luma, install 1.6.1 once, and reopen it. Keep your application data. On Windows, use Setup and stop launching the old portable copy. A future update launched from a portable copy also opens Setup; remove the old extracted app after switching to the installed one.

Chrome updates the store-installed bridge separately. Reload YouTube Music after the extension updates. Updating the desktop app does not replace an extension that is already loaded in the browser.

## Local bridge update

Use this for Bridge 1.4.0 if the store still offers an older version, or for development. The new YouTube Music status indicator requires **Bridge 1.4.0**. Ratings and playlist fixes require 1.3.1 or newer.

1. In Luma → Connection → Local extension / developer setup, choose **Prepare extension folder**. Alternatively extract [Luma-Bridge-1.4.0.zip](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-Bridge-1.4.0.zip).
2. Open `chrome://extensions` (Edge: `edge://extensions`; Brave: `brave://extensions`) and enable **Developer mode**.
3. For an existing unpacked bridge, replace the files in its existing folder and click **Reload**. For a new installation, choose **Load unpacked** and select the folder containing **manifest.json**. Select the extracted folder, not the ZIP.
4. If you switch from the store copy, disable it so only one bridge is active. Pair the new copy if needed.
5. Reload YouTube Music. The status badge shows a green check, then a quiet green dot. A red X means the desktop connection is missing; click it for help.

On Mac, Cmd+Shift+G in the folder picker lets you paste a copied folder path. To return to the store copy later, disable the unpacked copy and enable/install the store extension.

## Troubleshooting

- **No Dock icon on Mac:** use Luma in the top menu bar.
- **Extra controls require the extension:** check pairing and reload YouTube Music. Keep one active bridge copy.
- **No update shown:** the installed version may already be current, or only preview releases exist. Check your network and try again later.
- **Windows mini controls hidden:** open the system-tray overflow and adjust taskbar icon visibility.
- **No Up next button:** that feature has been removed.
