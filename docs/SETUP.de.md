# Luma installieren oder aktualisieren

[Version 1.5.2 herunterladen](https://github.com/BravoSignal/luma/releases/tag/v1.5.2) · [English](SETUP.md)

## Desktop-App installieren

**Mac:** Lade die ZIP für Apple Silicon (M-Chip) oder Intel herunter. Deinen Prozessor findest du unter **Apple-Menü → Über diesen Mac**. Entpacke die ZIP, verschiebe **Luma.app** nach **Programme** und öffne sie. Luma erscheint **oben in der Menüleiste**, nicht im Dock. Die Mac-Vorabversion ist noch nicht signiert oder notarisiert.

**Windows:** Lade die ZIP für Windows x64 herunter. Entpacke den gesamten Ordner an einen festen Ort und starte **Luma.exe**. Die übrigen Dateien müssen im Ordner bleiben. Die Einstellungen erreichst du über das Symbol im Infobereich.

Du brauchst nur eine Desktop-ZIP für deinen Computer. Die automatisch von GitHub angebotenen „Source code“-Archive sind keine installierbaren Apps.

## YouTube Music verbinden

Du brauchst die **Luma-Desktop-App** für das Widget und die **Browser-Erweiterung** für die Verbindung zu YouTube Music.

1. Installiere [Luma Bridge aus dem Chrome Web Store](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc).
2. Öffne in der Desktop-App **Connection → Copy pairing code**.
3. Öffne die Optionen der Erweiterung über ihr Symbol in der Browserleiste, füge den Code ein und verbinde beide.
4. Die grüne Bestätigung zeigt die Verbindung an. Lade YouTube Music neu und spiele einen Song ab.

Wenn du Luma zuerst im Web Store entdeckt hast: Lade die passende Desktop-App über die [Download-Tabelle](../README.md#choose-your-download) herunter und öffne sie. Auf dem Mac findest du Luma oben in der Menüleiste, unter Windows im Infobereich. Die Erweiterung allein zeigt noch kein Desktop-Widget an.

Für die Like- und Playlist-Reparaturen brauchst du **Bridge 1.3.1 oder neuer**. Falls der Store noch eine ältere Version anbietet, enthält das GitHub-Release 1.5.2 eine lokale Erweiterung 1.3.1. „Zur Playlist hinzufügen“ öffnet die Playlist-Auswahl im Browser.

## Bestehende Installation aktualisieren

Beende Luma, ersetze die Desktop-App durch die neue Version und öffne sie wieder. Einstellungen und Kopplung bleiben erhalten. Nach einem Store-Update lade auch YouTube Music neu.

Bei einer lokal geladenen Erweiterung: **Connection → Prepare extension folder**, dann auf der Erweiterungsseite **Neu laden ↻**, anschließend YouTube Music neu laden. Die neuere Desktop-Oberfläche ordnet die lokale Einrichtung unter „Local extension / developer setup“ ein.

Beim Wechsel von einer entpackten Kopie zur Store-Version: Deaktiviere die alte Kopie, installiere die Store-Erweiterung und gib dort den Kopplungscode ein. Verwende nur eine aktive Luma-Bridge-Kopie.

Für die lokale Installation: ZIP entpacken bzw. Erweiterungsordner aus Luma vorbereiten, unter `chrome://extensions` den Entwicklermodus einschalten und „Entpackte Erweiterung laden“ wählen. Wähle den Ordner mit manifest.json. [Ausführliche lokale Einrichtung](SETUP.md#local-extension--developer-setup)

Die Oberfläche startet auf Englisch. Unter **Customize → Interface language** kannst du Deutsch wählen. Die Erweiterung besitzt eine eigene Sprachauswahl. Weitere Hinweise zu Aktivierung, Größen und Bedienung stehen in der [englischen Anleitung](SETUP.md).
