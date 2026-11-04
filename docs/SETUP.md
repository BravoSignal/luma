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

## 3. Connect YouTube Music

Music stays in your existing Chrome, Edge or Brave tab. Basic playback can work through system media controls. Install Luma Bridge for the additional YouTube Music controls. No Google password is entered into Luma.

1. In Luma, open **Connection → Prepare extension folder**. This opens the folder containing the current extension files.
2. Open `chrome://extensions` in Chrome, `edge://extensions` in Edge or `brave://extensions` in Brave.
3. Enable **Developer mode** and choose **Load unpacked**.
4. Select the folder containing **manifest.json**. Use Luma's prepared folder, or extract **Luma-Bridge-1.3.1.zip** from the release and select its extracted folder. Do not select a ZIP file.
5. If the folder is hard to find on a Mac, copy its path from Luma. In the file picker, press **Cmd+Shift+G**, paste the path and confirm.
6. Open the Luma extension options by clicking its toolbar icon. Copy the pairing code from Luma, paste it into the options and save it.
7. A **green connection confirmation** shows that the extension and desktop app are paired. Reload YouTube Music and play a track.

**Add to playlist** brings your existing YouTube Music tab forward and opens its playlist picker. Choose the playlist in that browser dialog.

The [Chrome Web Store listing](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc) currently shows version **1.3.0**. This release includes **1.3.1** with the rating and playlist fixes; use the local folder for that version. Downloading the extension ZIP alone does not install it. Each computer needs its own local pairing.

## Update an existing installation

1. Quit Luma from its menu-bar or system-tray menu.
2. Download the new desktop ZIP. On Mac, replace **Applications/Luma.app**. On Windows, replace the app folder with the newly extracted folder.
3. Open the new Luma app. Your preferences and pairing code remain in your application data; do not delete that data.
4. Choose **Connection → Prepare extension folder** again. This writes the extension bundled with the new desktop app.
5. In your browser's extensions page, click **Reload ↻** on the existing **Luma · YouTube Music Bridge** card. For this release, its version should be **1.3.1**.
6. Reload the **YouTube Music tab** too. Check for the green connected confirmation.

If you loaded the extension from a manually extracted ZIP folder instead of Luma's prepared folder, replace the files in that same folder with the new extension ZIP before pressing Reload. You do not need to remove the extension or enter the pairing code again.

## If something is missing

- **No Dock icon on Mac:** use the Luma icon in the top menu bar.
- **Extra controls request the extension:** check that Luma is running, the pairing is green and the YouTube Music tab has been reloaded.
- **Like or playlist still behaves as before:** check that both desktop **1.5.2** and extension **1.3.1** are installed. Reloading only the app does not update an already running browser content script.
- **No Up next button:** this feature has been removed in 1.5.2.

English is the default language. Choose German in **Customize → Interface language**. The extension options have a separate language selector.
