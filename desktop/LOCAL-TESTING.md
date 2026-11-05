# Luma 1.7.1 local verification

Installed Mac build: `/Applications/Luma.app`. Bridge version: 1.5.0.

## Try the new controls

1. Activation: delete the zone on one display. Confirm the other display still works. Click Undo. Use Test zone to show its outline and widget briefly.
2. Zone editor: enter a Y position such as 3 px. It must stay 3 px after Done. Drag near an edge with the pointer to test edge snapping.
3. Customize: choose Vertical, change its width/height and expand the widget. Each display's activation row can override orientation and size.
4. Close with X. Leave the zone for less than the Reopen after closing interval and return: it stays hidden. Leave continuously for longer than that interval and return: it appears.
5. Scroll through settings: the left navigation follows the section in view. Connection has a larger confirmation panel.
6. Profiles: select a running app, add its profile, then set mouse zones and the hold shortcut independently. Choose separate zones, positions and layout. Return to General settings to edit the fallback. Activate the app to use its profile. Widget previews temporarily use the profile being edited.
7. macOS: enable Menu-bar mini player in Customize. Check the accent indicator and previous / play-pause / next. Turn it off to remove it. The regular widget stays available.
8. Export preferences and import them on another computer. Screen IDs are mapped using available labels/resolutions, with remaining screens matched in order; check zones after importing. Pairing codes are not exported. App identities differ across operating systems; reassign imported app profiles if needed.

## Bridge update for the YouTube Music badge

In the desktop app expand Connection → Local extension / developer setup, prepare the extension folder, reload the existing unpacked bridge on the browser's extensions page, and reload YouTube Music. Alternatively load the supplied Bridge 1.4.0 ZIP after extracting it. A store-installed copy remains on its store version until the update is approved.

The badge starts with a green check, then becomes a quiet green dot. If the desktop app is unavailable or pairing is missing it shows a red X. Click it for setup and reload help. No additional browser permissions were added.

## Platform limits

The macOS menu-bar player is native and persistent. Windows uses four native notification-area (system tray) icons for the indicator and playback controls. Windows may initially put these icons in its overflow menu; make them visible in taskbar settings. No floating replacement bar is used.

Future source and software releases require user testing and approval before publishing. Keep current local packages only; remove temporary unpacked build copies after installation and verification.

## Desktop updates

Open **Updates** in the left navigation. Automatic updates are enabled by default: Luma checks shortly after launch and every six hours, downloads an available compatible version and waits for **Restart & install**. Switching automatic updates off leaves **Check for updates** and manual download available. Settings and the bridge pairing code are kept. Chrome updates its store-installed extension separately.

Release 1.6.1 is the first stable release. After it is published, Check for updates on 1.6.1 should report that the app is up to date. The next upgrade becomes available when a newer stable release and its signed update manifest are published.

On Windows, use the Setup installer for a single managed installation. A portable ZIP copy launches Setup when updating; close/delete that old portable copy after installation to avoid launching it again. On Mac, keep Luma in Applications; read-only disk images and App Translocation cannot be updated in place.

## Smart playback

Use Playback to prefer YouTube Music, prefer system music, or lock a specific source. With Bridge 1.5, open two YouTube Music tabs and confirm a lock targets the chosen tab. Unrelated videos must not steal the widget. A closed locked source must show a waiting state.

Automatic pause is initially off. Enable it and add a foreground app. Enter the app: the selected supported music source pauses. Leave: it resumes after the configured delay. Test overlapping conditions, manual playback/seek/source changes, disabling resume, closing/reloading the source and failed commands.

In Bridge 1.5 options, allow a video site such as https://www.youtube.com. Enable browser video detection in Luma. Play a video: music pauses; stop it: music resumes only after every blocker has cleared. Test muted videos, visible-tab filtering and optional other audio. Permission is per site and optional. No media is recorded.

On macOS, targeted automatic pause requires the YouTube Music bridge. Windows additionally targets native app sessions and can optionally use OS-reported video sessions. Native foreground-app rules do not detect active call state.

Record a diagnostic session, reproduce an issue, stop and export. Verify the report contains no pairing code, song titles, site addresses or personal paths. See DEBUG-WINDOWS.md for the laptop workflow.

Automatic pause for browser music uses the targeted YouTube Music Bridge. Native browser sessions are excluded because a browser can redirect its system session to another tab. Other native Windows music apps can use their reported play/pause controls.

## Organized customization (1.7.1)

- Activation → Activation timing: choose a 0.5 second opening delay. A brief pass must not open the widget; a continuous hover should. Moving to another screen's zone starts a new interval. The hold shortcut still opens immediately.
- Look & Feel → Background & motion: adjust artwork strength and blur; the front cover and controls stay readable. Zero strength hides only the background image. Full motion / Reduced motion / Follow system controls transitions and the audio animation.
- Look & Feel → Layout & typography: expand Extra widget buttons to hide ratings or playlist access independently. Fine-tune typography offers three compact title sizes, including vertical layouts.
- Advanced settings start collapsed. Timing lives under Activation; media filters under Playback. Existing values are preserved.
- Restore appearance defaults resets colors, background, motion, typography, compact text arrangement and optional buttons. It keeps zones, positions, dimensions, source rules, language and pairing.
- Switch to German and back; verify labels and expanders. Close and reopen Luma to verify preferences persist.

Luma 1.7.1 was installed for local testing and approved for release.
