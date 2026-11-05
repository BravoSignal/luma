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
