# Luma 1.7.1

Your music. One moment away.

A customizable desktop music widget for macOS and Windows. YouTube Music stays in Chrome, Edge or Brave. System media integration provides basic playback; the optional browser extension adds YouTube Music controls.

**English is the default language.** Choose German in **Customize → Interface language**. The extension options have their own English/German selector.

[Deutsch](README.de.md)

## What is new

Version 1.7.1 adds smart playback and more organized customization. [Test guide](LOCAL-TESTING.md).

- Organized customization: artwork strength and blur, reduced motion, compact title size, optional rating/playlist buttons and an appearance-only reset. Advanced options stay collapsed.
- Configurable continuous zone-entry delay; hold shortcuts remain immediate.
- Smart source preference and a source lock. Bridge 1.5 supports individual YouTube Music tabs.
- Optional automatic pause for configured foreground apps and media on explicitly allowed browser sites, with confirmed pause ownership, manual override and a configurable resume delay.
- Local diagnostics recording/export for Windows and Mac support, without pairing codes, media titles, URLs or personal paths.
- Automatic desktop update checks and downloads, with an explicit restart to install. See **Updates** in settings. Update metadata is signed and packages are verified before installation.
- Delete one screen zone, Undo deletion and test its outline independently.
- Exact numeric zone positions; edge snapping only while using the pointer.
- Vertical compact and expanded widgets, with per-screen orientation and size.
- App profiles that follow the foreground app, with separate triggers, zones, pinned positions and layout. General settings remain the fallback.
- Configurable continuous outside-zone time before reopening after X dismissal.
- A larger connection confirmation and scroll-aware settings navigation.
- Native menu-bar playback controls on macOS; native playback icons in the Windows taskbar's notification area. The mini player can be disabled and the regular widget remains available.
- Preferences export/import without pairing codes. Display assignments are remapped on import; review zones on the new computer. App profiles can be reassigned when switching operating systems.
- Bridge 1.4.0 adds a connection indicator and clickable diagnosis to YouTube Music: green check, quiet green dot, or a red X when disconnected. Browser permissions are unchanged.

## Widget controls

- Enter a screen zone or hold your shortcut to show the compact widget.
- Hold the shortcut while the pointer is over the widget to expand it. Hover alone does not expand it.
- Click an empty area of the compact widget to expand it. Drag that area to move the widget temporarily. Buttons, sliders and the track title keep their own actions.
- Pin remembers the current position on that screen. Unpin returns to the zone anchor. Temporary positions reset the next time the widget appears.
- The arrow expands or collapses the widget. X hides it without stopping playback. Leave the zone and release the shortcut before triggering it again.
- Clicking the track title brings the existing YouTube Music tab to the front (extension required).
- Play/pause, previous/next, seek, shuffle, repeat, volume, like/dislike and the YouTube Music playlist dialog.

## Customize

Colors can follow the artwork or use a preset/custom accent. Set width and compact height independently of the activation zones. Choose a stacked or inline compact layout, then open **Fine-tune typography** for typeface and letter spacing. Set zone-entry, hide and reopening delays under **Activation → Activation timing**. Launch at login and interface language remain in Customize.

Each connected screen can have its own enabled activation zone. Draw a rectangle, move it, adjust the handles or numeric fields, then choose **Done**. Drag the zone to the top edge to place the widget flush with the screen edge above the menu bar. Changes are saved only when Done is pressed.

Record a single key or combination with **Change**. To use a modifier alone, press and release it. On macOS, the global hold shortcut needs Accessibility permission for Luma. Keys are observed, not suppressed; other applications can still respond to them.

## Install the desktop app

**Mac:** unzip the package matching your chip, move Luma.app to Applications and open it. Use the Luma menu-bar item to reopen settings. There is no Dock icon. The first-run tour points to the menu-bar item and can be repeated later.

**Windows:** run the Setup installer for managed updates, or extract the entire portable ZIP and launch Luma.exe. Keep all extracted files together. Use the system-tray icon to reopen settings.

This build is not signed with a developer certificate or notarized by Apple. Windows and Intel packages are built here but have not been run on those devices.

## Connect YouTube Music

[Install Luma Bridge from the Chrome Web Store](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc). The desktop app displays the widget; the browser extension connects it to YouTube Music. Both must be installed. The bridge setup page provides desktop downloads for people who discover Luma in the store first.

In **Connection**, open the store, then copy Luma's pairing code into the extension options. Look for the green confirmation and reload YouTube Music. The app stays in the macOS menu bar or Windows system tray. No extra Luma account or Google sign-in.

For preview versions newer than the store, expand **Local extension / developer setup** and prepare the extension folder. In your browser's extensions page, enable Developer mode and load that unpacked folder. For an existing local copy, prepare the folder again, reload the extension, then reload YouTube Music. Store-installed extensions use the browser's extension update mechanism.

The bridge connects only to `127.0.0.1:17384` with your local pairing code. Pair each computer separately. Like/dislike and the playlist fixes require Bridge 1.3.1 or newer; this preview bundles 1.5.0. **Add to playlist** opens the picker in your existing YouTube Music tab.

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

## Smart playback preview

Open Playback to choose a preferred source or lock to one. The lock waits if the source disappears. Stable source locks survive app restarts; machine-specific source locks are excluded from preferences export.

Automatic pause is off by default. Enable it, select foreground apps, and independently enable browser video/audio rules. Add allowed websites in Bridge 1.5 options; optional access is requested separately for each site. Muted media and hidden tabs can be ignored. YouTube Music itself is excluded. Native Windows video-session detection is an additional optional rule when the OS identifies a session as video; mute detection does not apply to those native sessions.

Luma issues explicit pause/play commands and resumes only after a confirmed pause, unchanged source/track and the chosen clear interval. Manual playback/seek/source changes cancel ownership. It does not detect native meeting/call state; foreground-app rules deliberately apply whenever the selected app is foreground. Permitted web meeting audio/video may be detected like other media.

macOS exposes one system media source at a time. To avoid resuming a different OS player after a video takes focus, this preview enables automatic pause on macOS through the targeted YouTube Music Bridge, rather than the global system source. Windows can target its reported application sessions; multiple tabs in one browser should use Bridge.

See [Windows testing and debugging](DEBUG-WINDOWS.md).

Automatic pause for browser music uses the targeted YouTube Music Bridge. Native browser sessions are excluded because a browser can redirect its system session to another tab. Other native Windows music apps can use their reported play/pause controls.
