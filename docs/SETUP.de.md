# Luma installieren oder aktualisieren

[Version 1.5.2 herunterladen](https://github.com/BravoSignal/luma/releases/tag/v1.5.2) · [English](SETUP.md)

## Desktop-App installieren

**Mac:** Lade die ZIP für Apple Silicon (M-Chip) oder Intel herunter. Deinen Prozessor findest du unter **Apple-Menü → Über diesen Mac**. Entpacke die ZIP, verschiebe **Luma.app** nach **Programme** und öffne sie. Luma erscheint **oben in der Menüleiste**, nicht im Dock. Die Mac-Vorabversion ist noch nicht signiert oder notarisiert.

**Windows:** Lade die ZIP für Windows x64 herunter. Entpacke den gesamten Ordner an einen festen Ort und starte **Luma.exe**. Die übrigen Dateien müssen im Ordner bleiben. Die Einstellungen erreichst du über das Symbol im Infobereich.

Du brauchst nur eine Desktop-ZIP für deinen Computer. Die automatisch von GitHub angebotenen „Source code“-Archive sind keine installierbaren Apps.

## YouTube Music verbinden

1. Öffne in Luma **Connection → Prepare extension folder**.
2. Öffne im Browser `chrome://extensions`, `edge://extensions` oder `brave://extensions`.
3. Aktiviere den **Entwicklermodus**, klicke **Entpackte Erweiterung laden** und wähle den vorbereiteten Ordner mit **manifest.json**. Eine ZIP musst du vorher entpacken.
4. Kopiere den Kopplungscode aus Luma in die Optionen der Erweiterung und speichere ihn.
5. Eine **grüne Bestätigung** zeigt die Verbindung an. Lade YouTube Music neu und starte einen Song.

Der [Chrome-Web-Store-Eintrag](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc) zeigt derzeit Version **1.3.0**. Für die Reparaturen dieser Version verwende die hier enthaltene Erweiterung **1.3.1** als lokale Erweiterung. Die Musik bleibt im bisherigen Browser. „Zur Playlist hinzufügen“ öffnet dort die Playlist-Auswahl.

## Bestehende Installation aktualisieren

1. Beende Luma über das Menüleisten- oder Infobereich-Symbol.
2. Ersetze die Desktop-App durch die neue Version und öffne sie. Deine Einstellungen und dein Kopplungscode bleiben erhalten.
3. Wähle erneut **Connection → Prepare extension folder**.
4. Klicke auf der Erweiterungsseite beim bestehenden Eintrag **Luma · YouTube Music Bridge** auf **Neu laden ↻**. Die Erweiterung muss für diese Version **1.3.1** anzeigen.
5. Lade auch den **YouTube-Music-Tab neu**.

Falls du die Erweiterung aus einem selbst entpackten ZIP-Ordner geladen hast, ersetze die Dateien in diesem Ordner durch die neue Erweiterungs-ZIP und klicke dann auf Neu laden. Lösche die Erweiterung und ihre Einstellungen dafür nicht.

**Desktop-Version: 1.5.2. Erweiterungs-Version: 1.3.1.** „Up next“ wurde entfernt. Like/Dislike und das Öffnen der Playlist-Auswahl wurden überarbeitet.

Die Oberfläche startet auf Englisch. Unter **Customize → Interface language** kannst du Deutsch wählen. Die Erweiterung besitzt eine eigene Sprachauswahl. Weitere Hinweise zu Aktivierung, Größen und Bedienung stehen in der [englischen Anleitung](SETUP.md).
