---
name: verify
description: Build, run and drive the Party-Quiz app end-to-end (Playwright gegen den Vite-Preview-Server)
---

# Party-Quiz verifizieren

## Umgebung

Node ist nicht systemweit installiert, sondern liegt unter `~/.local/node`:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

## Bauen & Starten

```bash
npm run build
npm run preview -- --port 4173 --strictPort   # im Hintergrund laufen lassen
```

## Fahren (Playwright)

Playwright + Chromium headless-shell im Scratchpad installieren
(`npm i playwright && npx playwright install chromium --only-shell`).
Der headless-shell braucht Libs, die auf diesem WSL fehlen — ohne sudo lösbar:

```bash
mkdir -p debs libs && cd debs
apt-get download libnspr4 libnss3 libasound2t64
for f in *.deb; do dpkg-deb -x "$f" ../libs; done
export LD_LIBRARY_PATH=<scratchpad>/libs/usr/lib/x86_64-linux-gnu
```

Viewport 390×844 (Smartphone). Bewährter Ablauf:

1. Home → „✨ Beispiel-Quiz laden" → Editor öffnet, Quiz aus
   `localStorage['partyquiz.quizzes']` lesen (liefert Antworten zum Durchspielen)
2. „▶️ Spielen" → auf Text `Wie viel willst du riskieren?` warten
   (nicht auf Kategorienamen — die stehen auch im Editor!)
3. Demo-Reihenfolge: championTheme, multipleChoice, numberGuess,
   pictureGuess (Sachpreis), freeTask
4. YouTube-ready: `button:has-text("▶️ Song abspielen"):not([disabled])`
   (braucht Netz, bis ~20 s); nach Klick erscheint `⏸ Pause`
5. Endscreen-Summe gegen `quiz.tiers` nachrechnen

Gotchas:
- Bilder (pictureGuess, Wikimedia) laden asynchron — vor Canvas-Screenshots
  ~2–4 s warten, sonst sieht der Canvas leer aus, obwohl alles funktioniert
- `page.on('dialog', d => d.accept())` für confirm()-Dialoge (Löschen/Neustart)
- Emojis rendern headless als Tofu-Kästchen (keine Emoji-Font) — kein Bug
- Spielstand-Sprünge: `partyquiz.run.<quizId>` direkt in localStorage setzen
  und neu laden, statt durchzuklicken

Referenz-Skript einer vollen Fahrt: siehe Verlauf vom 2026-07-04 (drive.mjs im
damaligen Scratchpad) — deckt Joker, Reload-Resume, Share-Import im frischen
Kontext und die Fehlerpfade (`#/import?q=quatsch`, `#/play/gibtsnicht`) ab.
