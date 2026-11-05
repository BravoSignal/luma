# Luma installieren oder aktualisieren

[Download 1.7.1](https://github.com/BravoSignal/luma/releases/tag/v1.7.1) · [English](SETUP.md)

## Installation

Wähle auf der Release-Seite genau ein Desktop-Paket: Mac mit M-Chip → Apple Silicon, Mac mit Intel → Intel, Windows → Setup. Auf dem Mac ZIP entpacken, Luma.app nach Programme bewegen und öffnen. Luma sitzt **oben in der Menüleiste**, ohne Dock-Symbol. Unter Windows Setup ausführen und das Symbol im Infobereich verwenden.

Installiere zusätzlich [Luma Bridge aus dem Chrome Web Store](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc). Unter Luma → Verbindung den Kopplungscode kopieren und in den Erweiterungsoptionen einfügen. Auf die grüne Bestätigung achten und YouTube Music neu laden. Beide Teile sind nötig. Kein zusätzliches Google-Login; jeder Computer hat seinen eigenen Code.

## Neue Einstellungen

Unter Aktivierung → Aktivierungszeiten stehen Eintritts-, Ausblend- und Wiederöffnungsverzögerung. Unter Anpassen findest du Cover-Stärke, Unschärfe und Animationen. Titelgröße und Zusatzbuttons sind aufklappbar. Nur die Maße der gewählten Ausrichtung werden angezeigt. Darstellung zurücksetzen erhält Zonen, Positionen, Größe, Sprache und Wiedergaberegeln.

Unter Wiedergabe lässt sich eine Quelle bevorzugen oder festhalten. Automatisches Pausieren ist zunächst aus. Programme, Browser-Videos und Browser-Audio haben eigene Regeln. Websites müssen einzeln in Bridge 1.5 freigegeben werden. Stumme Medien, Tab-Sichtbarkeit, automatisches Fortsetzen und Verzögerung sind einstellbar. Luma setzt nur selbst und bestätigt pausierte Musik fort; manuelle Eingriffe haben Vorrang.

Auf macOS benötigt automatisches Pausieren YouTube Music mit Bridge. Windows unterstützt zusätzlich geeignete native Musik-Apps. Native Browser-Sitzungen werden ausgenommen, weil die Systemsteuerung zwischen Tabs wechseln kann. Programmregeln erkennen die Vordergrund-App, keine aktiven Anrufe.

## Bridge 1.5 lokal installieren

Wenn der Store noch eine ältere Version anbietet, [Bridge 1.5.0 ZIP herunterladen](https://github.com/BravoSignal/luma/releases/download/v1.7.1/Luma-Bridge-1.5.0.zip) und entpacken. `chrome://extensions` öffnen, Entwicklermodus einschalten und Entpackte Erweiterung laden wählen. Den Ordner mit manifest.json auswählen, nicht die ZIP-Datei. Bei einer bestehenden lokalen Kopie Dateien ersetzen und Neu laden drücken. Andere Luma-Kopien deaktivieren, bei Bedarf koppeln und YouTube Music neu laden.

Alternativ bereitet Luma → Verbindung → Lokale Erweiterung den Ordner vor. Auf dem Mac lässt sich der Pfad mit Cmd+Shift+G im Auswahldialog eingeben. Video-Websites nur bei Bedarf einzeln in den Erweiterungsoptionen erlauben.

## Updates und Fehlersuche

Ab 1.6.1 unter Updates prüfen und bei Bedarf Neu starten und installieren wählen. Einstellungen und Kopplung bleiben erhalten. Ältere Versionen einmal manuell ersetzen; Windows-Nutzer sollten Setup nutzen und die alte portable Kopie nicht weiter starten. Chrome aktualisiert die Store-Erweiterung getrennt.

Unter Updates → Fehlersuche lokal aufzeichnen, den Fehler nachstellen, stoppen und den Diagnosebericht exportieren. Der Bericht enthält keine Kopplungscodes, Songtitel, URLs oder persönlichen Pfade. [Windows-Anleitung (Englisch)](../desktop/DEBUG-WINDOWS.md).

Windows kann Mini-Steuersymbole im Überlaufbereich verstecken. Die Pakete sind nicht mit einem Entwicklerzertifikat signiert oder von Apple notarisiert. Intel- und Windows-Pakete sind gebaut und geprüft; echte Gerätetests bleiben erforderlich.
