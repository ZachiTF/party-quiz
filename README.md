# 🎉 Party-Quiz

**➡️ Spielen: <https://zachitf.github.io/party-quiz/>**

Eine kleine statische Quiz-App für Partys: Quiz am PC zusammenklicken, als Link aufs
Handy schicken, Handy an Freunde reichen und linear durchspielen. Pro Aufgabe wählt
die Spielerin eine Einsatz-Stufe (klein/mittel/groß) und gewinnt Geld oder Sachpreise;
Joker („Freund fragen", „Zwei Versuche") sind begrenzt pro Durchlauf.

## Kategorien

- 🎵 **Champion-Song** – ein League-of-Legends-Champion-Theme spielt (unsichtbares
  YouTube-Embed), geraten wird per durchsuchbarer Champion-Liste (live von Data Dragon)
- ❓ **Multiple Choice** – klassische Wissensfrage
- 🔢 **Schätzfrage** – Zahl schätzen mit Toleranz
- 🖼️ **Bilderraten** – Bild normal, verpixelt oder gezoomt
- 🎭 **Freie Aufgabe** – Party-Aufgabe, der Quizmaster wertet

Neue Kategorien: Ordner unter `src/lib/categories/` anlegen (Interface in
`categories/types.ts`) und in `categories/index.ts` registrieren.

## Bedienung

1. **Neues Quiz** (oder **Beispiel-Quiz laden**) auf der Startseite
2. Im Editor: Stufen aus Min/Max berechnen, Joker-Anzahl setzen, Aufgaben hinzufügen.
   🎲 würfelt Aufgaben aus eingebauten Pools (deterministisch über den Seed –
   Standard ist das heutige Datum), alles ist danach von Hand anpassbar.
   👁️ zeigt eine spielbare Vorschau der Aufgabe.
3. **🔗 Quiz-Link kopieren** und aufs Handy schicken – das komplette Quiz steckt
   komprimiert im Link, es braucht keinen Server.
4. Auf dem Handy öffnen und **Spielen**. Der Spielstand übersteht Reload und
   Bildschirmsperre.

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server mit Hot-Reload (http://localhost:5173)
npm run check    # Typprüfung (svelte-check)
npm run build    # Produktions-Build nach dist/
npm run preview  # gebauten Stand lokal testen (http://localhost:4173)
```

Quizze liegen im `localStorage` des jeweiligen Geräts; geteilt wird ausschließlich
über den URL-kodierten Link.