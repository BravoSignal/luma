# Install or update Luma

[Download version 1.5.2](https://github.com/BravoSignal/luma/releases/tag/v1.5.2) · [Deutsch](SETUP.de.md) · [Back to Luma](../README.md)

## 1. Install the desktop app

**Mac:** choose the Apple Silicon ZIP for an M-series chip, or Intel for an Intel processor. Check **Apple menu → About This Mac** if unsure. Extract the ZIP, move **Luma.app** into **Applications**, then open it. Luma lives in the **top menu bar**, with no Dock icon. Click its menu-bar icon to open settings. The Mac preview is unsigned and not notarized; follow macOS security guidance if it blocks opening.

**Windows:** choose the Windows x64 ZIP. Extract the **entire folder** to a permanent location and run **Luma.exe**. Keep its other files together. Open settings through the system-tray icon.

Download one desktop ZIP for your computer. The “Source code” archives on GitHub are for development, not installation.

## 2. Choose how to show the widget

In **Activation**, choose a zone for each screen. Draw a rectangle, adjust it, then press **Done**. A zone can touch the top screen edge. Widget size is configured separately in **Customize**.

You can also record a single key or combination with **Change**. Hold it to show the compact widget; hold it while your pointer is over the widget for the expanded view. On macOS, the global hold shortcut requires Accessibility permission.

Click free compact space or the arrow to expand. Drag free space to move temporarily; **Pin** saves the position. **X** hides the widget without stopping playback. Leave the zone and release the shortcut before triggering it again.

## 3. Install Luma Bridge from the store

Luma Desktop displays your widget. Luma Bridge connects it to YouTube Music in your existing browser. Both must be installed, and the desktop app must be running.

1. Open the [Luma Bridge Chrome Web Store listing](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc) and choose **Add to Chrome**. Edge and Brave can also use Chrome Web Store extensions.
2. Open the extension options through its toolbar icon.
3. In **Luma Desktop → Connection**, choose **Copy pairing code**. Paste it into the extension options and connect.
4. A **green confirmation** shows that they are paired. Reload your existing YouTube Music tab and play a track.

No Google password is entered into Luma. Each computer needs its own pairing. **Add to playlist** brings the existing music tab forward and opens YouTube Music's playlist picker.

For the rating and playlist fixes in desktop 1.5.2, use **Bridge 1.3.1 or newer**. If the store version is older, use the local bridge from that GitHub release until the store version catches up.

## If you found Luma in the Web Store first

Install the desktop app using [the download table](../README.md#choose-your-download), then open it and follow the pairing steps above. On macOS, look in the **top menu bar**, not the Dock. On Windows, use the **system tray**. Downloading the browser extension alone does not install the desktop widget.

## Update an existing installation

1. Quit Luma from its menu-bar or system-tray menu.
2. Replace the desktop app with the new extracted version and reopen it. Keep your application data so preferences and the pairing code remain.
3. For a store-installed bridge, check its version in the browser's extensions page and reload YouTube Music after the extension updates.
4. For a locally loaded bridge, choose **Connection → Prepare extension folder**, click **Reload ↻** on the existing extension in `chrome://extensions`, then reload YouTube Music.

Switching from an unpacked copy to the store? Disable the old unpacked copy, install the store extension, and paste your pairing code into the new copy's options. Use one active Luma Bridge copy at a time.

## Local extension / developer setup

Use this option for a newer preview than the store currently offers, or for development.

1. In Luma, open **Connection → Local extension / developer setup → Prepare extension folder**. In desktop 1.5.2 the folder button is directly in Connection.
2. Open `chrome://extensions` (Edge: `edge://extensions`; Brave: `brave://extensions`), enable **Developer mode**, then choose **Load unpacked**.
3. Select the folder containing **manifest.json**. If using a bridge ZIP from a GitHub release, extract it first. Do not select the ZIP itself.
4. If the folder is hard to find on a Mac, copy its path from Luma, press **Cmd+Shift+G** in the file picker and paste it.
5. Enter Luma's pairing code in the extension options, connect and reload YouTube Music.

If updating a ZIP-based installation, replace the files in the same extracted folder before clicking Reload. Keep its settings so you do not need to pair again.

## If something is missing

- **No Dock icon on Mac:** use the Luma icon in the top menu bar.
- **Extra controls request the extension:** check that Luma is running, the pairing is green and the YouTube Music tab has been reloaded.
- **Like or playlist still behaves as before:** check that both desktop **1.5.2** and extension **1.3.1** are installed. Reloading only the app does not update an already running browser content script.
- **No Up next button:** this feature has been removed in 1.5.2.

English is the default language. Choose German in **Customize → Interface language**. The extension options have a separate language selector.
