# Luma 1.6 implementation plan

- [x] Delete one display zone; preserve all other zones; Undo deletion.
- [x] Test a selected display zone with a temporary outline and widget preview.
- [x] Larger Connected / Not connected panel and actionable connection help.
- [x] Scroll-aware left navigation.
- [x] Horizontal / vertical compact and expanded widget, per-display overrides.
- [x] Exact numeric zone editing; edge snapping only during pointer gestures.
- [x] Configurable outside-zone time before rearming after X dismissal.
- [x] YouTube Music connection badge: initial green check, then green dot; persistent red X when disconnected; click for diagnosis.
- [x] Native macOS menu-bar mini player: accent audio indicator, previous, play/pause, next; optional.
- [x] Windows taskbar integration: native notification-area playback icons; no floating replacement bar.
- [x] Export/import preferences without pairing credentials; validate before applying.
- [x] Foreground-application profiles: activation methods, zones, independent pinned positions, orientation and size; default fallback.

English is the default; German is optional. Install the latest local Mac test build and remove replaced application copies while preserving settings and pairing. Ask for user testing before publishing new software releases or source. Prepare the latest extension ZIP for the store; the browser-managed store upload remains a manual step if automation is blocked. Keep only current temporary build folders.

## Desktop auto updates — 1.6.1 local preview

- [x] Automatic stable-release checks on startup and every six hours; optional background downloads.
- [x] Manual check/download and an explicit Restart & install action.
- [x] Signed update metadata and package checksum verification; no downgrade.
- [x] Staged Mac replacement with restoration on failure; Windows Setup installer.
- [x] English default, optional German; desktop updates and browser updates explained separately.
- [x] Release preparation script and publishing guide; no automatic GitHub publication.

## 1.7 — smart playback (in progress; do not publish before user testing)

- [x] Stable media selection, prefer YouTube Music, manual source lock and targeted controls.
- [x] Optional auto pause for selected foreground apps and videos on explicitly allowed browser sites.
- [x] Explicit pause/play commands, confirmed pause ownership, manual override and configurable resume delay.
- [x] Privacy-preserving diagnostics export and Windows test instructions.

## Ideas saved for later

- Guided automatic pairing, connection repair and actionable setup diagnosis.
- Hold-and-gesture controls for volume and track changes.
- Automatic layouts for different monitor/docking configurations.
- Cross-device preferences sync with per-device screen layouts and conflict handling; never sync pairing secrets.

Native meeting/call detection beyond configured apps and permitted browser media is a separate future integration. Do not infer that a running meeting app always means an active call.

## 1.7.1 local preview — organized preferences

- [x] Continuous zone-entry delay, with independent timing per app profile and immediate hold shortcut.
- [x] Adjustable background artwork strength and blur, preserving front-cover readability.
- [x] Follow system / full / reduced motion.
- [x] Compact title size, optional ratings and playlist buttons.
- [x] Collapsible advanced settings grouped by task; English and optional German.
- [x] Restore appearance independently of activation, pairing and playback rules.
- [x] User approved version 1.7.1 for publication.

## 1.7.2 local Mac repair

- Shortcut listener cleanup/retry and native modifier flags after recording/profile switches.
- Fifteen-second shortcut test uses the edited profile, shows actual detection and does not persist a temporary profile switch.
- Permission and function-key guidance; recording a shortcut enables its hold trigger.
- Explicit auto-pause readiness checks, legacy-bridge warning, video-only preset, pause command test and live browser activity status.
- Bridge 1.5+ and per-site video permission remain necessary. Existing local bridge folder was still version 1.3.1.
- Mac test required before publication; Windows remains untested on device.

Mac follow-up: replaced the failing macOS event-hook path with configured-key state polling in the native desktop helper. Added Input Monitoring preflight status; this machine reports that permission missing. User confirmation and real-key retest are pending. Do not claim the shortcut fixed until that test succeeds.

Confirmed by the user: ordinary A, Right Shift and Right Alt work on the physical Mac keyboard after refreshing Input Monitoring for the correctly signed app. Resolve's separate trim-tool issue was resolved by the user and was unrelated.

## 1.7.3 local — fade and mini-player polish

- Configurable 0–1.5 s automatic pause fade, default 0.6 s; requires Bridge 1.5.1 capability.
- Fade runs in the target music tab, restores its original volume while paused, and cancels on manual playback/volume changes or a changed song. Desktop disabling/source changes cancel a pending fade.
- Fixed white native menu-bar controls and no Luma tray text.
- Irregular smoothed mini-player bars, paused/reduced-motion states; decorative, no audio recording.
- No new bridge permissions; bare youtube.com resolves to www.youtube.com when requesting optional site access.
- 75 automated tests plus interface and native smoke checks passed. User hardware test/release approval pending.

## Next proposals — awaiting implementation approval

- Pause music only while a selected desktop application (for example a video editor) actually outputs audio, with configurable application rules.
- Optional blurred music-video background in the widget, with an artwork fallback.

These are proposals, not features in release 1.7.6. Implementation has not started.
