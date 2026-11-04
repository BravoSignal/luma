# Luma installieren und aktualisieren

[Version 1.6.1 herunterladen](https://github.com/BravoSignal/luma/releases/tag/v1.6.1) · [English](SETUP.md) · [Zurück zu Luma](../README.md)

## Die Desktop-App installieren

| Dein Computer | Download |
| --- | --- |
| Mac mit Apple-M-Chip | [macOS · Apple Silicon](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-1.6.1-arm64-mac.zip) |
| Mac mit Intel-Prozessor | [macOS · Intel](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-1.6.1-mac.zip) |
| Windows mit Intel- oder AMD-Prozessor | [Windows · Setup](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-Setup-1.6.1.exe) |

**Mac:** ZIP entpacken, Luma.app nach Programme verschieben und öffnen. Luma sitzt **oben in der Menüleiste**, nicht im Dock. Den Chip findest du unter Apple-Menü → Über diesen Mac.

**Windows:** Setup ausführen. Die Einstellungen öffnest du über das Symbol im Infobereich der Taskleiste. Alternativ gibt es eine portable ZIP; entpacke sie vollständig und lasse alle Dateien zusammen. Für eine verwaltete Installation mit künftigen Updates empfehlen wir Setup.

Die Pakete sind nicht mit einem Entwicklerzertifikat signiert und auf macOS nicht notarisiert. System-Sicherheitshinweise können erscheinen. Die „Source code“-Downloads von GitHub sind für Entwickler.

## YouTube Music verbinden

1. Desktop-App starten und **[Luma Bridge aus dem Chrome Web Store](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc)** in Chrome, Edge oder Brave installieren.
2. In Luma → Verbindung den Kopplungscode kopieren.
3. Optionen der Erweiterung öffnen, Code einfügen und verbinden.
4. Grüne Bestätigung abwarten, YouTube Music neu laden und Musik starten.

Die Erweiterung benötigt die laufende Desktop-App. Wenn du Luma zuerst im Web Store entdeckt hast, installiere deshalb auch die passende App aus der Tabelle. Es gibt kein zusätzliches Luma-Konto; dein Google-Passwort wird nicht in Luma eingegeben. Jeder Computer wird separat gekoppelt.

## Widget einstellen

Unter Aktivierung kannst du Zonen je Bildschirm zeichnen, anpassen, testen oder einzeln löschen. Rückgängig stellt eine gelöschte Zone wieder her. Zahlen bleiben exakt; beim Ziehen mit der Maus rastet die Zone an nahen Rändern ein. Größe und Ausrichtung des Widgets sind unabhängig von der Aktivierungszone.

Nimm eine Taste oder Kombination auf. Halten zeigt die kompakte Ansicht; Taste und Maus über dem Widget öffnen die volle Ansicht. Auf macOS ist dafür die Bedienungshilfen-Freigabe nötig.

Unter Anpassen findest du horizontale und vertikale Ansichten, Größen, Farben, Schrift und den optionalen Mini-Player. Auf Windows liegen dessen Symbole im Infobereich und eventuell zunächst im Überlaufmenü. Profile erlauben eigene Aktivierungsmethoden, Zonen, Positionen und Layouts je Programm. Allgemeine Einstellungen bleiben der Standard.

Klick auf freie Widgetfläche vergrößert es, Ziehen verschiebt es vorübergehend, Pin merkt die Position. X blendet es aus. Die Wartezeit bis zum erneuten Öffnen ist einstellbar. Export/Import überträgt Einstellungen ohne Kopplungscode; prüfe danach die Bildschirmzuordnung und weise App-Profile auf einem anderen Betriebssystem neu zu.

## Updates

**Ab 1.6.1:** In Updates sucht und lädt Luma automatisch im Hintergrund. Automatische Updates sind abschaltbar. Manuelle Suche bleibt möglich; Neu starten und installieren führt ein bereitliegendes Update aus. Nur stabile Releases werden angeboten. Einstellungen und Kopplung bleiben erhalten.

**Von 1.5.x oder älter:** Luma beenden und 1.6.1 einmal mit dem passenden Download installieren. Anwendungsdaten behalten. Auf Windows Setup verwenden und anschließend die alte portable Kopie nicht mehr starten.

Chrome aktualisiert die Store-Erweiterung separat. Danach YouTube Music neu laden. Ein Desktop-Update ersetzt keine bereits laufende Browser-Erweiterung.

## Bridge 1.4.0 lokal installieren

Der Verbindungsindikator auf YouTube Music braucht Bridge 1.4.0. Falls der Store noch älter ist, [Bridge 1.4.0 herunterladen](https://github.com/BravoSignal/luma/releases/download/v1.6.1/Luma-Bridge-1.4.0.zip) und entpacken, oder in Luma → Verbindung → Lokale Erweiterung den Erweiterungsordner vorbereiten.

`chrome://extensions` öffnen, Entwicklermodus aktivieren und den Ordner mit manifest.json über Entpackte Erweiterung laden auswählen. Bei einer bestehenden lokalen Installation die Dateien im gleichen Ordner ersetzen und Neu laden drücken. Nur eine Bridge-Kopie aktiv lassen. Bei Bedarf koppeln und YouTube Music neu laden.

Der grüne Haken wird nach kurzer Zeit zu einem grünen Punkt. Ein rotes X zeigt eine fehlende Verbindung; ein Klick öffnet Hilfe. „Zur Playlist hinzufügen“ öffnet den Playlist-Dialog im bestehenden YouTube-Music-Tab. „Als Nächstes“ wurde entfernt.
