# Luma 1.7.3 local verification

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

## Mac shortcut and browser-video repair (1.7.2 local)

Activation now shows shortcut scope, listener status and a 15-second test using the edited profile without saving a temporary profile switch. Record a key to enable hold activation. Use Recheck keyboard access after allowing Luma in macOS Accessibility; restarting the whole app is no longer required. Function keys may require Fn. No raw keystrokes are stored. Modifier flags recover combos when modifiers were already held during recording or a profile switch.

Playback begins with a readiness check. Legacy bridges lacking explicit pause/play are identified rather than silently waiting. Use video-only rules to remove foreground-app/audio rules and enable browser videos. This preserves the resume setting. Bridge 1.5+ must be loaded, the video website must be explicitly allowed in its options, and both music/video tabs reloaded. Test pause sends a real explicit pause; press Play to continue. Live media reception is shown separately from music connectivity.

Test on Mac before publication. Windows has not been tested on a physical device.

### Confirmed Mac prerequisite

The installed native helper reported macOS Input Monitoring as not granted. Allow Luma in System Settings → Privacy & Security → Input Monitoring, then restart when macOS requests it. Accessibility alone did not establish a working shortcut on this machine. The current Mac implementation polls only the configured physical key and required modifiers through Core Graphics and reports its permission state. Windows keeps the existing hook and remains untested on hardware.

Live browser music control is supported by the active bridge. An older prepared extension folder is not evidence of the active extension's version. For video rules, allow the video's website in the active bridge and reload that tab. Remove the Chrome foreground-app rule if only videos should trigger pause.

## Modifier follow-up

The user confirmed normal letters (for example A) work after the input-monitoring entry was refreshed for the corrected signed app. Right Shift did not respond to ordinary key-state polling. The native helper now uses the macOS device-specific modifier flags for left/right Shift, Ctrl, Alt and Cmd. A native regression test covers both sides, simultaneous presses and release. The user confirmed Right Shift and Right Alt both work on the physical keyboard.

Resolve's clip-edge trim issue was tested with Luma fully closed; the user subsequently resolved it independently and confirmed it was unrelated to Luma. No Resolve or system mouse settings were changed.

The macOS build now signs the packaged resources with the correct local.luma.music identity rather than the original Electron identity. This is ad-hoc signing, not Developer ID/notarization. The old Accessibility guard was removed from the read-only Mac keyboard path. OS Input Monitoring is checked in the native helper, and no key-state queries run without that access.

## Fade and menu-bar player (1.7.3 local)

- Bridge 1.5.1 is required for fade-out. Replace files in the existing unpacked extension folder, reload that extension and reload YouTube Music. Older bridges keep instant automatic pause and show a compatibility hint.
- Playback → Fade before automatic pause: Off / 0.3 / 0.6 / 1 / 1.5 seconds. Play music, start an allowed-site video and listen for a smooth fade before pause. Confirm the original music volume returns while paused. Stop the video; if automatic resume is enabled, music resumes at its normal volume.
- Change volume or manually control playback during the fade: the fade must cancel. Disable automatic pause during the fade: it must cancel. Do not overwrite a user's volume adjustment. Manual widget pause remains immediate.
- macOS mini player: previous, play/pause and next are white rasterized SF Symbols, independent of widget accent. The main tray has no Luma text. Bars change smoothly with irregular targets, stop while paused and respect reduced-motion settings. This is decorative playback animation, not audio capture or a measured level.
- Video sites remain explicitly allowed. Entering youtube.com now requests www.youtube.com to match YouTube's actual video origin. No additional required or optional permissions were introduced.

This update is local for testing. GitHub and the Chrome Web Store have not been updated automatically.

## All-site detection and volume-aware indicator (1.7.3 / Bridge 1.6.0 local)

This supersedes the per-site whitelist instructions above. Bridge asks for broad HTTP/HTTPS access only when the user clicks Enable detection on all websites in its options. A domain blacklist replaces repeated individual grants. Existing allowed sites continue to work before that optional grant. Excluded pages are checked before querying media elements, including embedded players. Only anonymous activity flags reach the local desktop app.

The menu-bar indicator opens the runtime widget without opening settings. Its animation scales mildly with music volume and, on Mac, the current system output volume/mute. At zero or mute it becomes completely static; quiet playback remains visible. No audio recording is used. Windows behavior has automated coverage but remains untested on physical hardware.

Checks: 78 unit/integration tests; desktop UI, Smart Playback UI, bridge blacklist UI and native desktop smoke checks. Manual follow-up: music/system volume low and zero, indicator click, broad permission approval and blacklist behavior with real browser videos.

## Setup clarification (1.7.4 / Bridge 1.6.1 local)

User confirmed Auto Pause and zero-volume indicator both work after reloading YouTube Music. Instagram metadata came from the system fallback while the music tab still ran the old content script. No source-routing or volume changes were needed for this follow-up.

- Remove the 15-second shortcut test, its IPC actions and temporary profile override; retain binding recording and permission readiness.
- Explain Bridge website permission in Connection and Playback, including the no-prompt case when Chrome already granted access.
- Keep the permission button visible with a confirmed enabled label; retry remains available after denial or failure.
- Distinguish paired browser from a music tab actually reporting; prompt to reload the latter.
- Bridge refreshes existing YouTube Music tabs on install/update only. This can briefly interrupt playback. No refresh on ordinary worker wake or Chrome update.
- 78 regression tests pass, including automatic refresh. Desktop, Smart Playback and Bridge options UI checks pass. Local preview only, no publication.

## Widget interactions and song previews (1.7.5 / Bridge 1.6.2 local)

- The current-song title focuses the existing browser tab and asks its visible player-page toggle to open /watch. It never toggles an already open player closed. Current media ID comes from the active player, including while browsing the home page. Stale requests for a different song fail rather than opening another song.
- Playlist opening reuses an existing popup, waits for menu/dialog transitions, guards duplicate script initialization, and hides the desktop overlay while Chrome handles the dialog. Real YouTube Music follow-up is still needed.
- Range sliders capture the pointer and hold both expanded layout and native visibility during a drag. Global pointer/mouse release and blur clear the hold. Polling does not overwrite a slider being dragged. Native smoke verifies a drag past the preview timeout and subsequent release. Run native smoke separately from other UI tests to avoid focus changes.
- Customize → Everyday use → Show new songs / Song preview duration. Default enabled, 2 seconds (1–5 selectable); initial connections, resumes and source switches do not announce. X dismissal takes priority.
- 82 automated regressions and desktop UI/native smoke checks passed. User test: drag each slider outside the window and release; change song and toggle preview; new Bridge playlist/title behavior. Mac installed before testing; Windows physical hardware untested.
- Web Store installations update through Chrome after approval/publication; unpacked installations need manual replacement/reload. No GitHub or Store publication during this local preview.

## Repeated song previews and Bridge contrast (1.7.6 / 1.6.3 local)

The song ID could update before the title, consuming a transition too early. Announcement identity now follows the displayed title/artist and ignores late ID-only updates. Short gaps in extension media reports preserve its baseline; an unrelated system fallback cannot replace it while YouTube Music is preferred. Explicit system preference/pinning still works. Identical title+artist tracks do not generate a distinct preview.

83 unit/integration tests pass, including both metadata orders, repeated transitions and paused-to-playing changes. Native smoke verifies two consecutive compact preview openings and the disabled setting, plus existing slider capture and playback checks. Desktop and Bridge UI checks pass.

Bridge Disable all-site access had accent-colored text on an accent-colored background; an outlined contrasting style fixes it. Reload instructions are now a prominent callout with an explicit reload button restricted to the extension options page. Desktop reload instructions are larger and highlighted.

User test after install: multiple skips and a natural track ending without refreshing YTM; check both Bridge access buttons and the large reload callout. No publication until approval.

## Foreground application audio and live music-video background (1.8.0 / Bridge 1.7.0 local)

Application rules now have foreground / audio modes. Old rules migrate to foreground to retain behavior. Newly added rules default to audio, but Detect sound from selected apps is off by default. Enable Automatic pause, add Resolve, select Only while it plays audio, then enable detection. macOS 14.2+ uses a private nonmuting Core Audio process tap for the selected foreground app only, computing a peak and immediately discarding samples. System audio permission is required; user must approve the OS prompt. Windows reads WASAPI per-session peaks with NAudio.Wasapi 2.2.1 and checks the foreground PID. Sensitivity and existing fade/resume preferences apply. Background apps do not trigger this rule.

Video is opt-in in Customize. Bridge 1.7 sends downsampled JPEG frames (320 px, up to 5 fps) from the HTML music video only while a widget/settings preview is visible. No tab, screen or audio capture and no new extension permissions. Only the explicitly requested music source can send frames. Stale song/source frames are dropped; no-video/protected sources use artwork. Blur is 8–40 px. Original front cover remains. Paused playback can retain its final frame.

Validation: 90 automated regressions, existing desktop/Bridge UI checks, Smart Playback UI, new compact/expanded video UI checks, native Mac startup/shortcut/slider/playback smoke checks, universal Mac helper compilation and Windows cross-build. Physical Windows not tested. Real Resolve playback, macOS audio permission and actual YouTube Music video access require user testing after installation/reloading Bridge. No publication without approval.

## Smooth background video and persistent pin dragging (1.8.1 / Bridge 1.7.1 local)

The old snapshot timer was removed. Music-video capture now uses HTMLMediaElement.captureStream with video tracks only, a bounded in-memory MediaRecorder WebM encoder, authenticated loopback chunk relay, and a MediaSource player. Audio tracks are immediately stopped and never encoded/forwarded. Source-origin restrictions are respected. No video file is written by the feature. Live buffers/transport queues are bounded; streams stop when no widget/preview is visible. Opening another viewer restarts with a fresh WebM header.

Actual hidden-source → real widget-renderer test delivered 99 decoded frames in five seconds (~20 fps) and played successfully. This generated local test clip does not prove actual YouTube Music behavior; repeat with a background YTM tab. Bridge 1.7.1 is required; older video bridges show the update hint/artwork.

Dragging an already pinned widget keeps its pin active and saves the clamped new position on release, including reopening. A cancelled pinned drag returns to its saved location. Unpinned dragging remains temporary. Optional Activation → Pinned widget: shortcut only is off by default. It suppresses the pinned display’s mouse zone, automatic song previews and indicator opening; hold shortcuts remain. Settings previews are available for configuration. Unpinning or switching off restores normal activation.

Validation: 91 automated regressions; widget/Bridge and Smart Playback UI checks; actual streaming codec/player check; native pinned-drag/reopen, shortcut-only indicator, slider and playback integration smoke checks. Actual YTM/background-tab validation still needs the user. No publication yet.

## 1.8.2 local correction
Pinning alone preserves all normal activation. With the optional shortcut-only setting enabled, closing a pinned widget with X suppresses zone, indicator and new-song opening until its hold shortcut reopens it. Unpinning or disabling the option clears this session-only dismissal. Displays and app profiles remain independent. Explicit settings previews remain available.

Validated: 95 automated tests passed; native widget smoke passed including pin-alone opening and Pin + X suppression. Installed 1.8.2 bundle matches the build; keyboard access reports ready. No publication.

## 1.8.3 keyboard access status
The installed 1.8.2 native listener reported Input Monitoring denied despite a connected listener. 1.8.3 corrects the settings status: connected but denied no longer displays ready. UI regression passed; installed bundle hash verified. Existing macOS permission renewal pending user authentication.

## 1.8.4 shortcut-opened compact view
A widget opened by the hold shortcut stays compact during hover, including after releasing/re-holding the key. The surface and arrow still expand on click. Opening origin resets for the next independent opening; zone-first hold expansion remains available. English/German activation help updated. Renderer integration and native overlay smoke passed (shortcut-origin propagation, hover compactness, click expansion, later preview reset). Installed bundle hash verified. macOS Input Monitoring renewal awaits user authentication. No Bridge update or publication.
