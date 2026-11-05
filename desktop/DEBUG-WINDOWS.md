# Test and debug Luma on Windows

The support chat can stay on your Mac. Transfer the Windows test installer to the laptop, reproduce the issue there, and bring the diagnostic report back to this chat.

## Install the matching preview

1. Quit any running Luma copy, including an older portable copy.
2. Run Luma-Setup-1.7.0.exe. Launch the installed app from Start. Keep your application data so settings and pairing remain.
3. Check the version in Luma settings. Update the local bridge to 1.5.0 for browser video detection and individual YouTube Music tabs; reload music/video tabs. Do not run store and unpacked copies simultaneously.

## Capture a reproducible problem

1. Open Luma → Updates → Troubleshooting.
2. Choose Record for 5 minutes.
3. Reproduce one issue, noting the exact sequence and expected result.
4. Stop recording, then Export diagnostic report.
5. Transfer Luma-diagnostics.json to the Mac and attach it to the support chat. Add a screenshot or short video if the issue is visual.

The report includes app/OS/architecture, monitor sizes and scaling, helper availability, anonymous source state, mini-player icon count, automatic-pause state, command acknowledgments and recent diagnostic events. It excludes pairing codes, song/artist names, website addresses, personal file paths and raw keystrokes. Source/app identifiers are replaced with local labels. Recording stops after five minutes, keeps at most 250 events, and the last recorded session can be exported after restarting. Nothing is uploaded automatically.

## Useful Windows checks

- Enable Taskbar mini controls in Customize. Inspect the notification-area overflow. Windows may hide the four new icons there; make them visible in taskbar settings. Check previous, play/pause and next without opening the settings window.
- If the report says miniPlayer is enabled and mini.icons is 4 but the icons are not visible, include a screenshot of the taskbar and overflow.
- In Playback, choose a source, start an unrelated video, and confirm controls remain on the chosen source. Close a locked source: Luma should wait, not control another player.
- Allow a video site in Bridge options. Enable Automatic pause and Pause for browser videos in Luma. Test muted/unmuted video, hidden-tab rules and resume delay.
- While music is automatically paused, manually start or seek it: Luma should relinquish automatic resume for that interruption.
- Add a foreground app to the pause list. Test entering/leaving it and overlapping video/app conditions. The source must support targeted pause/play.
- Native Windows video-session detection is optional and depends on the OS/player reporting content as video. Native session mute state is not available.

## Direct development on the laptop

A separate Codex/ChatGPT desktop session on Windows can work against the local source and run Windows-specific tests. The code version must match the installed app. Version 1.7 is local until user approval; GitHub currently contains 1.6.1, so do not assume the public source matches this preview.

If available in your account, connect devices through ChatGPT desktop Settings → Connections: enable Control this PC on Windows and add it under Control other devices on the Mac. Host access, account/workspace and permissions must be configured on the Windows computer. Direct computer use needs its desktop awake and unlocked. Official setup: https://learn.chatgpt.com/docs/remote-connections.

Do not publish fixes or releases before testing and explicit approval.

Automatic pause for browser music uses the targeted YouTube Music Bridge. Native browser sessions are excluded because a browser can redirect its system session to another tab. Other native Windows music apps can use their reported play/pause controls.
