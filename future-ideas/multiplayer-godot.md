# Weg B: Spiel-Client als Godot-App (Lernprojekt)

**Kurzfassung:** Machbar und ein gutes Godot-Lernprojekt – Godot 4 bringt eine
High-Level-Multiplayer-API mit, die genau das Host/Client-Modell abbildet, das
wir brauchen. Aber: Es ist ein Neubau des kompletten Spiel-Teils, und zwei
Punkte tun weh: die **Champion-Song-Kategorie** (YouTube-Embed gibt es in Godot
nicht) und die **Verteilung** (Spieler müssen eine APK installieren oder einen
hakeligen Web-Export nutzen). Empfehlung: nur den *Spiel-Client* in Godot bauen,
der Web-Editor bleibt – beide sprechen dasselbe Quiz-JSON.

## Zielbild

- **Quiz erstellen:** weiterhin in der bestehenden Web-App (`Editor.svelte`) –
  UI-lastige Formulararbeit ist in Godot mühsam und wäre doppelt gepflegt.
- **Quiz spielen:** Godot-App. Quizmaster-Gerät hostet, Spieler-Geräte verbinden
  sich im selben WLAN. Das Quiz kommt als JSON in die App (QR-Code scannen oder
  den bestehenden lz-string-Link einfügen).
- Duell-Modus mit Buzzer, Quizmaster-Steuerung, Punktestände – wie in Weg A,
  nur nativ.

## Architektur

```
Web-App (bleibt)                     Godot-App (neu)
┌──────────────────┐   Quiz-JSON     ┌─────────────────────────────┐
│ Editor.svelte    │ ──(QR/Link)──►  │ Quizmaster-Gerät = Server   │
│ share.ts         │                 │  (ENetMultiplayerPeer)      │
└──────────────────┘                 │        ▲ LAN                │
                                     │ Spieler-Geräte = Clients    │
                                     └─────────────────────────────┘
```

- **Godot 4.x .NET-Edition, C#.** (Bewusste Entscheidung: C# ist der wertvollere
  Lerninhalt. Achtung: es gibt zwei Godot-Downloads – die „.NET"-Variante nehmen,
  dazu .NET SDK 8+ installieren.) High-Level-Multiplayer: das Quizmaster-Gerät ruft
  `multiplayer.multiplayer_peer = ENetMultiplayerPeer` als Server auf, Spieler
  verbinden sich per IP (Anzeige als QR-Code) im selben WLAN. Zustandsänderungen
  laufen über `@rpc`-Funktionen; der Server ist autoritativ.
- ENet (UDP) im LAN = Buzzer-Latenz im einstelligen Millisekundenbereich –
  besser als jede Web-Lösung.
- Kein Internet nötig – reines LAN-Spiel.

## To-do-Liste

Vorbedingung: gemeinsamer erster Schritt aus [README.md](README.md) hilft auch
hier – wer die Spiellogik einmal als reine Zustandsmaschine formuliert hat,
portiert sie fast mechanisch nach C#.

1. **Godot lernen (gezielt, nicht alles)**
   - [ ] Offizielles „Your first 2D game"-Tutorial durcharbeiten (Scenes, Nodes,
         Signals) – die Doku hat bei jedem Code-Beispiel einen C#-Tab, den nutzen.
         Ergänzend „C# basics" in der Godot-Doku (Namenskonventionen, `[Export]`,
         Signals als C#-Events).
   - [ ] Doku „High-level multiplayer" lesen (docs.godotengine.org →
         Networking). Kernkonzepte: `MultiplayerAPI`, `@rpc`,
         `multiplayer.get_unique_id()`, Autoritäts-Modell.
   - [ ] Mini-Prototyp *vor* dem Quiz: zwei Geräte, ein Button, wer zuerst drückt,
         sieht „gewonnen". Das ist der komplette Buzzer-Kern in ~50 Zeilen und
         validiert LAN-Verbindung + APK-Build früh.

2. **Datenaustausch mit der Web-App festzurren**
   - [ ] Quiz-Schema dokumentieren: `Quiz`/`Task` aus `src/lib/model.ts` ist
         bereits reines JSON – als `future-ideas/quiz-schema.json` (JSON Schema)
         festhalten, damit beide Seiten dagegen validieren können.
   - [ ] Import in Godot: Variante 1 (einfach): Web-App bekommt einen Button
         „Quiz-JSON kopieren", in Godot einfügen. Variante 2 (schick): QR-Code
         mit dem bestehenden lz-string-Link scannen → dafür muss Godot
         lz-string dekomprimieren. Mit C# ein Pluspunkt: es gibt fertige
         .NET-Ports als NuGet-Paket (nach „lz-string csharp" suchen), einfach
         ins Godot-Projekt referenzieren.

3. **Godot-Projektgerüst**
   - [ ] Neues Repo oder Unterordner `godot/` (eigenes Repo empfohlen –
         andere Toolchain, andere Artefakte).
   - [ ] Szenenstruktur: `Main` (Rollenwahl Host/Beitreten) → `Lobby` →
         `GameHost` (Quizmaster-UI) / `GamePlayer` (Spieler-UI) → `Results`.
   - [ ] `GameState.cs`: die Zustandsmaschine (Port von `game.ts`) als reine
         C#-Klasse ohne Godot-Abhängigkeiten (dann per normalem xUnit/NUnit
         testbar!), läuft nur auf dem Server; Clients bekommen per RPC einen
         gefilterten ViewState (ohne Lösungen!). JSON via `System.Text.Json`.

4. **Kategorien portieren (der eigentliche Fleiß-Teil)**
   - [ ] Multiple Choice, Schätzfrage, Freie Aufgabe: reine UI, schnell gemacht.
   - [ ] Bilderraten: Bilder sind URLs → `HTTPRequest`-Node lädt sie;
         Verpixeln/Zoomen über Shader oder `TextureRect`-Tricks (guter
         Godot-Lernstoff!).
   - [ ] **Champion-Song: Problemfall.** Kein YouTube-Embed in Godot, kein
         eingebautes WebView. Optionen:
         - a) Kategorie im Godot-Modus weglassen (Quizmaster überspringt sie
           oder spielt den Song von seinem Handy-Browser ab). ← pragmatisch
         - b) Hybrid: Quizmaster-Gerät öffnet parallel den Browser für die
           Musik; Godot steuert nur das Raten. Funktioniert, ist aber fummelig.
         - c) Audio-Dateien vorab beschaffen und in die App packen –
           urheberrechtlich heikel, nicht empfohlen.

5. **Multiplayer-Spielfluss**
   - [ ] Host startet Server, zeigt IP+Port als QR; Clients scannen/tippen ein.
   - [ ] Lobby: Namen registrieren (RPC an Server), Liste synchronisieren.
   - [ ] Duell-Ablauf: Server sendet Frage → `arm_buzzer()`-RPC → Clients senden
         `buzz()` → Server nimmt den ersten (ankunftsbasiert, im LAN fair),
         sperrt die anderen → Quizmaster wertet → Punkte-Update an alle.
   - [ ] Quizmaster-Steuerung: werten, überspringen, Betrag anpassen, auflösen.

6. **Build & Verteilung**
   - [ ] Android-Export einrichten (Export-Templates, selbstsigniertes Keystore).
         Spieler installieren die APK per Sideload – einmalig „unbekannte
         Quellen" erlauben.
   - [ ] iOS realistisch abhaken: ohne bezahltes Apple-Dev-Konto keine sinnvolle
         Verteilung. **C#-Fallstrick:** der Godot-**Web-Export** (der naheliegende
         iOS-Fallback) unterstützt C#/.NET in Godot 4 bisher nicht – nur
         GDScript-Projekte lassen sich als HTML5 exportieren. Vor Projektstart
         den aktuellen Stand prüfen (Godot-Doku „Exporting for the Web",
         Abschnitt .NET); wenn weiterhin nicht unterstützt, heißt C# faktisch:
         iPhone-Gäste können nicht mitspielen (oder man reicht ihnen ein
         Android-/Host-Gerät).
   - [ ] Desktop-Export (Linux/Windows) für den Quizmaster-Laptop ist gratis
         dabei und gut zum Entwickeln.

## Pro

- **Godot-Lernziel wird erreicht** – und das Projekt ist dafür ideal
  dimensioniert: UI, Netzwerk, Audio, Shader, Export – alles einmal angefasst.
- **Beste Buzzer-Qualität:** ENet im LAN, Latenz <10 ms, dazu native Haptik,
  Sounds, Animationen – fühlt sich nach „echtem Spielgerät" an.
- **Kein Browser-Ärger:** kein Screen-Lock-Verbindungsabriss (Godot kann den
  Bildschirm wachhalten), kein WLAN-Client-Isolation-Signaling-Problem
  (direkte LAN-Verbindung), komplett offline-fähig.
- Web-Editor bleibt unangetastet und wird weiterverwendet.

## Contra

- **Kompletter Neubau des Spiel-Teils** (~alle 300 Zeilen `Play.svelte` +
  Kategorien-UIs), nichts vom Svelte-Rendering ist wiederverwendbar.
- **Installationshürde:** APK-Sideload schreckt Party-Gäste ab; iOS praktisch
  außen vor (oder Web-Export mit Zusatzaufwand und schlechterer Latenz –
  womit der Hauptvorteil gegenüber Weg A schrumpft).
- **Champion-Song-Kategorie verliert ihre elegante YouTube-Lösung** (s. o.).
- **Doppelte Pflege:** jede neue Kategorie muss künftig zweimal gebaut werden
  (Web-Editor-Formular + Godot-Spiel-UI).
- Langsamere Iteration als Web (Export-Zyklen, Gerätetests), Lernkurve kostet
  anfangs deutlich Zeit.

## Aufwandsschätzung

Godot-Grundlagen + Buzzer-Prototyp ~1 Woche, Projektgerüst + Multiplayer-Fluss
~1 Woche, Kategorien portieren ~1 Woche, Export/Verteilung/Feinschliff ~½ Woche.
**Grob 3–4 Wochen Feierabende** – der Lernanteil ist dabei Feature, nicht Bug.

## Empfehlung zur Reihenfolge

Wer beides will: erst **Weg A** bauen (eine Woche, sofort auf jeder Party
nutzbar), dabei fällt die extrahierte Zustandsmaschine ab – und die macht den
Godot-Port später zur reinen Übersetzungsarbeit. Godot dann als entspanntes
Lernprojekt ohne Termindruck.
