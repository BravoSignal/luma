# Luma 1.5.2

Your music. One moment away.

A customizable desktop music widget for macOS and Windows. YouTube Music stays in Chrome, Edge or Brave. System media integration provides basic playback; the optional browser extension adds YouTube Music controls.

**English is the default language.** Choose German in **Customize → Interface language**. The extension options have their own English/German selector.

[Deutsch](README.de.md)

## What is new

Version 1.5.2 removes Up next and fixes rating buttons and the playlist dialog. Ratings use the actual YouTube Music buttons and wait for confirmation. Playlist actions focus the browser and wait for a visible playlist picker.


- A dedicated Customize section with cards for colors, size and position, layout and typography, and playback behavior.
- English menus, tooltips, notifications, onboarding, activation-zone editor, extension options and documentation. German remains optional.

## Widget controls

- Enter a screen zone or hold your shortcut to show the compact widget.
- Hold the shortcut while the pointer is over the widget to expand it. Hover alone does not expand it.
- Click an empty area of the compact widget to expand it. Drag that area to move the widget temporarily. Buttons, sliders and the track title keep their own actions.
- Pin remembers the current position on that screen. Unpin returns to the zone anchor. Temporary positions reset the next time the widget appears.
- The arrow expands or collapses the widget. X hides it without stopping playback. Leave the zone and release the shortcut before triggering it again.
- Clicking the track title brings the existing YouTube Music tab to the front (extension required).
- Play/pause, previous/next, seek, shuffle, repeat, volume, like/dislike and the YouTube Music playlist dialog.

## Customize

Colors can follow the artwork or use a preset/custom accent. Set width and compact height independently of the activation zones. Choose a stacked or inline compact layout, then open **Fine-tune typography** for typeface and letter spacing. Change hide delay, launch at login and interface language in the same section.

Each connected screen can have its own enabled activation zone. Draw a rectangle, move it, adjust the handles or numeric fields, then choose **Done**. Drag the zone to the top edge to place the widget flush with the screen edge above the menu bar. Changes are saved only when Done is pressed.

Record a single key or combination with **Change**. To use a modifier alone, press and release it. On macOS, the global hold shortcut needs Accessibility permission for Luma. Keys are observed, not suppressed; other applications can still respond to them.

## Install the desktop app

**Mac:** unzip the package matching your chip, move Luma.app to Applications and open it. Use the Luma menu-bar item to reopen settings. There is no Dock icon. The first-run tour points to the menu-bar item and can be repeated later.

**Windows:** extract the entire ZIP and launch Luma.exe. Keep all extracted files together. Use the system-tray icon to reopen settings.

This preview is not signed with a developer certificate or notarized by Apple. Windows and Intel packages are built here but have not been run on those devices.

## Connect YouTube Music

The [Chrome Web Store listing](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc) currently shows version 1.3.0. This release bundles 1.3.1 with the rating and playlist fixes; use the local setup below for that version.

1. Open **Connection** in Luma and choose **Prepare extension folder**.
2. Open `chrome://extensions` in Chrome (`edge://extensions` or `brave://extensions` in the other browsers).
3. Enable **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`. Extract ZIP downloads first.
4. On a Mac, if the folder is hard to find, copy its path from Luma, press Cmd+Shift+G in the file picker, paste the path and confirm.
5. Copy the pairing code from Luma and save it in the extension options. Click the extension toolbar icon to open those options.
6. A green confirmation indicates a successful local connection. Reload YouTube Music and start a track.

To update a locally loaded extension, prepare the folder again from the latest desktop app, reload the extension on the browser’s extensions page, then reload YouTube Music.

Unavailable extension features remain clickable and explain that pairing is required. **Add to playlist** opens the dialog in the YouTube Music tab; you choose the playlist there. Luma does not create playlists itself.

The bridge listens only on `127.0.0.1:17384` and authenticates with a local pairing code. Pair each computer separately. No Luma account, Luma server, advertising or analytics. The extension only accesses YouTube Music and the local bridge. Song titles, artist names and your content are not translated.

## Development

Requires Node.js 22+, Apple Command Line Tools on macOS, and .NET SDK 8 for the Windows helper.

```sh
npm ci
# macOS
npm run native:mac
# Windows helper
dotnet publish native/windows/Luma.Media.csproj -c Release -r win-x64 -o native/windows/bin
npm start
```

Checks:

```sh
npm test
npm run test:ui
npm start -- --smoke
```

Build packages:

```sh
npm run dist:mac
npm run dist:win
```

In the GitHub repository, the application lives under `desktop/`; run these commands from that directory. The root workflow builds platform packages. Keep generated build folders, local settings, pairing codes, dependencies and signing credentials out of source control. Keep only current build outputs locally to avoid accumulating old Electron runtimes.

## Validation and limits

Tests cover local authentication, per-screen zones, pinned positions, routing, controls against a simulated YouTube Music player, language preferences, removed queue controls and the settings UI. The Mac app check starts native media integration, moves the real widget using mouse events, clicks Pin, checks saved positions and verifies that settings remain hidden during interaction.

YouTube Music may change its page structure and require extension updates. The native macOS integration uses a private MediaRemote adapter and can be affected by macOS updates. The extension works independently of that adapter. Live behavior with an authenticated YouTube Music session and global shortcuts still needs user testing. Background video remains deferred.

## Credits

The macOS helper uses MediaRemote Adapter by Jonas van den Berg and contributors under BSD-3-Clause: https://github.com/ungive/mediaremote-adapter. The pinned upstream revision is in `native/mac/UPSTREAM_COMMIT`; license and copyright notices are included. Electron, ws and uiohook-napi are installed through npm and distributed with their license notices.
