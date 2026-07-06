# 💡 Future Ideas

Ziel: Multi-Geräte-Betrieb – Quizmaster steuert auf dem eigenen Handy, Spieler:innen
sehen eigene Ansichten, optional Duell-Modus mit Buzzer.

Zwei mögliche Wege dorthin, je ein Dokument mit To-do-Liste, Pro/Contra und
Architektur-Hinweisen:

- **[multiplayer-web.md](multiplayer-web.md)** – im bestehenden Svelte-Setup bleiben,
  Geräte per WebRTC (PeerJS) direkt verbinden. Kein Server, kein App-Install.
- **[multiplayer-godot.md](multiplayer-godot.md)** – Neubau des Spiel-Teils als
  Godot-App (Lernprojekt), Web-Editor bleibt für die Quiz-Erstellung.

## Gemeinsamer erster Schritt (lohnt für beide Wege)

Die Spiellogik steckt aktuell in `src/views/Play.svelte` (~300 Zeilen, UI und
Regeln vermischt). Für jede Multi-Geräte-Variante muss sie als eigenständige,
serialisierbare Zustandsmaschine existieren:

- [ ] `src/lib/game.ts` anlegen: reine Funktionen `(RunState, Action) -> RunState`
      (Actions z. B. `chooseTier`, `useJoker`, `answer`, `next`).
- [ ] `Play.svelte` auf diese Funktionen umstellen – Verhalten unverändert
      (mit `/verify` bzw. `npm run check` gegenprüfen).
- [ ] Alle Actions als JSON-serialisierbare Objekte definieren (keine Funktionen,
      keine DOM-Referenzen) – das wird später das Nachrichtenprotokoll.

Danach ist der Rest des jeweiligen Wegs deutlich kleiner.
