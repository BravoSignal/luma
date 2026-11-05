# Luma einrichten

[Download 1.7.6](https://github.com/BravoSignal/luma/releases/tag/v1.7.6) · [English](SETUP.md)

Mac: passende ZIP für Apple Silicon oder Intel entpacken, Luma.app nach Programme verschieben und öffnen. Luma erscheint oben in der Menüleiste, ohne Dock-Symbol. Für globale Tastenkürzel bei Bedarf Eingabeüberwachung unter Datenschutz & Sicherheit erlauben und Luma neu starten. Windows: Setup ausführen und Luma im Infobereich öffnen.

## YouTube Music verbinden

[Bridge aus dem Chrome Web Store installieren](https://chromewebstore.google.com/detail/ahjjpjjmiaokgbmoojngfnbpmicidlcc). In Luma → Verbindung den Kopplungscode kopieren, in den Bridge-Optionen einfügen und verbinden. **Den geöffneten YouTube-Music-Tab neu laden.** Die Kopplung allein aktiviert die neue Musiksteuerung noch nicht. Bridge bietet dafür einen großen Button und aktualisiert Musik-Tabs nach Installation/Update automatisch.

## Musik bei Videos pausieren

In Luma → Wiedergabe automatisches Pausieren und Browser-Videos aktivieren. In Bridge einmal „Erkennung auf allen Websites erlauben“ anklicken und den Chrome-Dialog bestätigen. Bei bereits erlaubtem Zugriff erscheint kein Dialog. Ausgeschlossene Domains, ihre Subdomains und eingebettete Player werden ignoriert. YouTube Music ist immer ausgenommen. Fade, stumme Medien, Tab-Sichtbarkeit, Fortsetzen und Verzögerung sind einstellbar. Programmregeln reagieren derzeit auf das aktive Vordergrundprogramm, nicht auf seine tatsächliche Audioausgabe.

## Anzeige

Unter Aussehen → Alltagsnutzung lassen sich neue Songs kurz einblenden und die Dauer wählen (standardmäßig 2 Sekunden). Leere Widget-Flächen ziehen, Pin zum Speichern drücken oder zum Erweitern klicken. Beim Ziehen eines Sliders bleibt das große Widget sichtbar.

## Updates

Desktop: Updates → Neustarten & installieren. Einstellungen und Kopplung bleiben erhalten. Die Store-Erweiterung aktualisiert Chrome nach Freigabe und Veröffentlichung. Eine entpackte Kopie wird manuell aktualisiert.

[Bridge 1.6.3 ZIP herunterladen](https://github.com/BravoSignal/luma/releases/download/v1.7.6/Luma-Bridge-1.6.3.zip), entpacken und bei einer bestehenden lokalen Kopie die Dateien im gleichen Ordner ersetzen. Unter chrome://extensions „Neu laden“ drücken. Bei Erstinstallation Entwicklermodus aktivieren, „Entpackte Erweiterung laden“ wählen und den Ordner mit manifest.json auswählen. Nur eine Bridge-Kopie aktiv lassen. Musik-Tabs werden automatisch aktualisiert; bei Bedarf den großen Neuladen-Button verwenden.

Die App ist nicht von Apple notarisiert. Windows/Intel benötigen weiterhin Tests auf echter Hardware. Weitere Details und Fehlerbehebung stehen in der [englischen Anleitung](SETUP.md).
