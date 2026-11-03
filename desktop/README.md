# Luma 1.3

Ein anpassbares Musik-Widget für macOS und Windows. YouTube Music läuft weiter in Chrome, Edge oder Brave. Die System-Medienanbindung liefert verfügbare Titeldaten; die Browser-Erweiterung ergänzt die YouTube-Music-Steuerung.

## Funktionen

- Eigene Aktivierungszone für jeden angeschlossenen Bildschirm, einzeln ein- und ausschaltbar.
- Zonen vor dem Speichern verschieben und anpassen; erst „Fertig“ übernimmt die Auswahl.
- An den oberen Bildschirmrand ziehen: Die Zone rastet ein und das Widget erscheint randbündig über der Menüleiste.
- Widget-Breite und -Höhe unabhängig von den Aktivierungszonen.
- Kleine Ansicht wahlweise mit Titel oben und Buttons darunter oder Titel links und Buttons rechts; Schriftbild und Buchstabenabstand einstellbar.
- Frei aufnehmbare Halte-Taste oder Tastenkombination.
- Maus oder gehaltene Taste zeigen die kleine Ansicht. Taste plus Maus erweitert. Der Pfeilbutton kann unabhängig davon auf- und zuklappen.
- Temporäres Verschieben am Ziehgriff; der Pin speichert die Position für den jeweiligen Bildschirm.
- X blendet das Widget aus und lässt die Musik weiterlaufen.
- Play/Pause, vorheriger/nächster Titel, Zeitleiste, Shuffle, Wiederholung, Lautstärke, Daumen hoch/runter und Playlist-Dialog.
- Die Daumen erscheinen im kleinen Widget, wenn ausreichend Platz vorhanden ist. In der großen Ansicht sind sie immer sichtbar.
- Cover-Farben automatisch oder manuell. Großes Cover im Vordergrund der vollen Ansicht.
- macOS: nur in der Menüleiste, mit sichtbarem „Luma“-Text und kurzer Einführung beim ersten Start.
- Erweiterungslogo und Bestätigung nach erfolgreicher Kopplung auf beiden Seiten.

## Starten

Mac: Passendes ZIP entpacken und Luma.app in „Programme“ verschieben. Apple Silicon ist für Macs mit Apple-Chip, Intel für ältere Intel-Macs. Oben in der Menüleiste steht „≋ Luma“. Darüber lassen sich die Einstellungen auch nach dem Schließen des Fensters wieder öffnen. Die Kurzanleitung kann jederzeit erneut aufgerufen werden.

Windows: Das Windows-ZIP vollständig entpacken und Luma.exe starten. Alle Dateien müssen zusammenbleiben. Das Symbol im Infobereich öffnet die Einstellungen.

Diese Vorabversion ist nicht mit einem Entwicklerzertifikat signiert oder bei Apple notarisiert. Beim ersten Start können entsprechende Systemabfragen erscheinen.

## YouTube Music verbinden

1. In Luma links „Verbindung“ öffnen und den Erweiterungsordner vorbereiten.
2. In Chrome die Adresse `chrome://extensions` öffnen. Für Edge und Brave entsprechend `edge://extensions` beziehungsweise `brave://extensions` verwenden.
3. Entwicklermodus einschalten und „Entpackte Erweiterung laden“ wählen. Den Ordner auswählen, in dem `manifest.json` direkt liegt. Das ZIP vorher entpacken.
4. Falls der Ordner auf dem Mac nicht auffindbar ist: In Luma den Ordnerpfad kopieren; im Dateiauswahlfenster Cmd+Shift+G drücken, den Pfad einfügen und bestätigen.
5. Den Kopplungscode aus Luma in den Optionen der Erweiterung einfügen und speichern. Ein Klick auf das Luma-Erweiterungssymbol öffnet diese Optionen.
6. Die grüne Bestätigung zeigt die erfolgreiche lokale Verbindung. YouTube Music einmal neu laden und einen Titel abspielen.

Bei einem Erweiterungsupdate den Ordner aus Luma erneut vorbereiten und auf der Erweiterungsseite „Neu laden“ anklicken. Anschließend auch YouTube Music neu laden.

Funktionen, die ohne Erweiterung nicht verfügbar sind, bleiben anklickbar und erklären die notwendige Verbindung. „Zur Playlist“ öffnet die Auswahl in deinem YouTube-Music-Tab; die gewünschte Playlist wählst du dort selbst aus. Luma legt keine Playlist selbst an.

Die Verbindung ist ausschließlich an `127.0.0.1:17384` gebunden und mit einem lokalen Code gekoppelt. Pro Computer erfolgt die Kopplung separat. Kein Luma-Konto, kein Cloud-Dienst. Die Erweiterung greift nur auf `music.youtube.com` und diese lokale Verbindung zu.

## Bereich, Taste und Pin

Unter „Aktivierung“ hat jeder verbundene Monitor einen eigenen Bereich. Einen Bereich aufziehen oder bearbeiten, am oberen Rand bei Bedarf einrasten lassen, anschließend „Fertig“ wählen. Ein zweiter Bereich ersetzt den ersten nicht.

Neben der Tastenbelegung auf „Ändern“ klicken und die gewünschte Taste oder Kombination aufnehmen. Einzelne Zusatztasten beim Aufnehmen drücken und loslassen. Unter macOS benötigt die globale Halte-Taste die Freigabe von Luma in „Datenschutz & Sicherheit → Bedienungshilfen“. Die Mauszone benötigt diese Freigabe nicht. Tasten werden beobachtet, nicht unterdrückt; sie können in anderen Apps weiterhin ihre normale Funktion auslösen. Fn selbst ist keine eigenständige Belegung.

Am kleinen Ziehgriff im Widget lässt es sich vorübergehend verschieben. Beim nächsten Einblenden kehrt es zur Zone beziehungsweise zur gespeicherten Position zurück. Ein Klick auf den Pin merkt sich den neuen Ort. Ein erneuter Klick löst die feste Position wieder. Positionen werden pro Bildschirm gespeichert.

## Aus dem Quellcode starten

Voraussetzungen: Node.js 22 oder neuer; auf dem Mac zusätzlich Apples Command Line Tools, auf Windows .NET SDK 8.

```sh
npm ci
```

Mac-Medienhelfer bauen:

```sh
npm run native:mac
```

Windows-Medienhelfer bauen:

```sh
dotnet publish native/windows/Luma.Media.csproj -c Release -r win-x64 -o native/windows/bin
```

App starten und prüfen:

```sh
npm start
npm test
npm run test:ui
npm start -- --smoke
```

Pakete erstellen:

```sh
npm run dist:mac
npm run dist:win
```

Der Workflow unter `.github/workflows/build.yml` baut auf Mac- und Windows-Runners. Er startet manuell oder über einen Versionstag.

## Prüfstand und Grenzen

Automatisierte Tests prüfen Medienkopplung, Zugriffsschutz, Zonen pro Bildschirm, Randpositionen, gespeicherte Positionen, Textlayouts und die Steuerung gegen eine nachgebildete YouTube-Oberfläche. Ein gemeinsamer Test startet die echte Mac-Anbindung und das Overlay mit einer lokalen Testwiedergabe. Die Windows-Anbindung ist übersetzt.

Die tatsächliche globale Tastenbedienung, die Laufzeit unter Windows/Intel-Mac und sämtliche Erweiterungsaktionen mit dem angemeldeten YouTube-Music-Tab müssen im Alltag geprüft werden. YouTube-Änderungen können Anpassungen an der Erweiterung erfordern. Die macOS-Systemanbindung nutzt einen privaten MediaRemote-Adapter; macOS-Updates können diesen Weg verändern. Die Erweiterung arbeitet unabhängig davon.

## Herkunft

Die macOS-Anbindung verwendet MediaRemote Adapter von Jonas van den Berg und Mitwirkenden unter BSD-3-Clause: https://github.com/ungive/mediaremote-adapter. Der verwendete Stand steht in `native/mac/UPSTREAM_COMMIT`; Lizenz und Copyright-Hinweise liegen bei. Electron, ws und uiohook-napi werden über npm eingebunden und mit ihren Lizenzhinweisen verteilt.
