# Weg A: Multi-Geräte im bestehenden Web-Setup (WebRTC / PeerJS)

**Kurzfassung:** Ja, das geht im bestehenden Setup – und zwar ohne die
„kein Server"-Philosophie aufzugeben. WebRTC-Datachannels verbinden die Handys
direkt (Peer-to-Peer); nur zum *Finden* der Geräte braucht es einen
Signaling-Dienst, und dafür betreibt PeerJS einen kostenlosen öffentlichen
Broker. Die App bleibt statisch auf GitHub Pages.

## Zielbild

- **Quizmaster-Gerät** = Host. Hält den kompletten Spielzustand (autoritativ),
  zeigt eine Steuer-Ansicht: nächste Aufgabe, Antwort werten, Betrag überschreiben,
  Auflösung anzeigen, Buzzer freigeben/sperren.
- **Spieler-Geräte** = Clients. Treten per Raum-Code oder QR-Code bei, sehen nur
  das, was der Host ihnen schickt (Frage, Antwortmöglichkeiten, Buzzer-Button,
  eigener Punktestand).
- **Duell-Modus:** 2 Spieler, Frage erscheint bei beiden, Buzzer-Button; wer zuerst
  drückt, darf antworten. Der Host entscheidet über die Reihenfolge (siehe unten).

## Architektur

```
Quizmaster-Handy (Host)                Spieler-Handy 1..n (Client)
┌─────────────────────────┐            ┌──────────────────────┐
│ RunState (autoritativ)  │  WebRTC    │ empfängt ViewState   │
│ game.ts Zustandsmaschine│◄──────────►│ sendet Actions       │
│ Host-UI (Steuerung)     │  PeerJS    │ Player-UI            │
└─────────────────────────┘            └──────────────────────┘
            ▲
            │ nur Signaling (Verbindungsaufbau)
     PeerJS-Broker (öffentlich, kostenlos)
```

- Der Host ist die einzige Wahrheitsquelle. Clients senden nur *Wünsche*
  (`{type:"buzz"}`, `{type:"answer", value:...}`), der Host wendet sie über die
  Zustandsmaschine an und broadcastet danach den neuen Ansichts-Zustand.
- **Buzzer-Fairness:** Der Host nimmt Buzz-Nachrichten in Empfangsreihenfolge an –
  im selben WLAN liegt die Latenz bei ~10–50 ms, für eine Party völlig okay.
  Wichtig: Host sendet vorher ein `buzzerArmed`-Signal, Clients zeigen den Button
  erst dann (sonst gewinnt, wer blind vorklickt). Optional: Clients schicken
  `performance.now()`-Offset mit, aber das ist Übergenauigkeit für den Zweck.

## To-do-Liste

Vorbedingung: gemeinsamer erster Schritt aus [README.md](README.md)
(Spiellogik als `src/lib/game.ts` extrahieren).

1. **PeerJS einbauen**
   - [ ] `npm install peerjs`
   - [ ] `src/lib/net.ts`: dünner Wrapper um PeerJS – `hostRoom()` erzeugt eine
         Peer-ID aus einem kurzen Raum-Code (z. B. `partyquiz-XK4F`),
         `joinRoom(code)` verbindet sich dorthin. Events: `onJoin`, `onMessage`,
         `onLeave`, `send`, `broadcast`.
   - [ ] Nachrichtentypen als TypeScript-Union in `src/lib/protocol.ts`
         definieren (Client→Host: `join`, `buzz`, `answer`, `useJoker`;
         Host→Client: `state` (kompletter ViewState), `buzzerArmed`, `kicked`).
         Immer den *ganzen* ViewState schicken statt Deltas – die Daten sind
         winzig und Reconnect wird trivial.

2. **Routen & Lobby**
   - [ ] `src/lib/router.ts` erweitern: `#/host/<quizId>` und `#/join/<code>`
         (bestehende Routen unangetastet lassen – Einzelspieler-Modus bleibt!).
   - [ ] `src/views/HostLobby.svelte`: zeigt Raum-Code groß + als QR-Code
         (QR selbst rendern, z. B. mit `qrcode`-npm-Paket, kein externer Dienst –
         die App soll offline im WLAN funktionieren). Liste der beigetretenen
         Spieler mit Namen, Button „Los geht's".
   - [ ] `src/views/Join.svelte`: Name eingeben, Code eingeben (oder aus URL),
         warten auf Start.

3. **Host-Ansicht (Quizmaster)**
   - [ ] `src/views/Host.svelte`: nutzt dieselbe `game.ts`-Maschine wie
         `Play.svelte`, zeigt aber zusätzlich: aktuelle Aufgabe *mit* Lösung,
         Buttons „richtig/falsch werten", „Betrag überschreiben" (gibt es schon
         als Konzept, siehe Quizmaster-Override in `Play.svelte`), „nächste
         Aufgabe", „Buzzer scharf schalten".
   - [ ] Nach jeder Zustandsänderung: ViewState pro Spieler ableiten
         (Lösung rausfiltern!) und broadcasten.

4. **Spieler-Ansicht**
   - [ ] `src/views/Player.svelte`: rendert den empfangenen ViewState.
         Wiederverwenden, was geht – die Kategorie-Komponenten unter
         `src/lib/categories/` brauchen evtl. einen „nur anzeigen, Antwort an
         Callback"-Modus statt direktem RunState-Zugriff.
   - [ ] Buzzer-Button: riesig, ganze Bildschirmhälfte, mit Vibration
         (`navigator.vibrate`) und Sound bei Zuschlag/Abpfiff.

5. **Duell-Modus (neue Spielart)**
   - [ ] `RunState` um Spielerliste + Punktestände erweitern (oder eigenes
         `DuelState` – sauberer, da der lineare Einzelspieler-Modus andere Regeln
         hat: Stufen/Joker/Sachpreise ergeben im Duell wenig Sinn).
   - [ ] Ablauf: Host zeigt Frage → `buzzerArmed` → erster `buzz` gewinnt
         Antwortrecht, andere Buzzer sperren → Host wertet → Punkte → nächste Frage.
   - [ ] Falsch beantwortet: Buzzer für den anderen Spieler wieder freigeben.

6. **Robustheit (Party-Realität)**
   - [ ] Screen-Lock tötet die Verbindung: Wake Lock API
         (`navigator.wakeLock.request('screen')`) auf allen Geräten anfordern.
   - [ ] Reconnect: Client merkt sich Raum-Code + Namen in `sessionStorage`,
         verbindet nach Verbindungsabriss automatisch neu; Host erkennt den Namen
         wieder und schickt den aktuellen ViewState (deshalb: ganzer State statt
         Deltas).
   - [ ] Host-Reload überlebt über das bestehende `saveRun`/`loadRun`-Muster
         in `src/lib/storage.ts` – Raum neu aufmachen, Spieler treten neu bei.

7. **Verifizieren**
   - [ ] `/verify` bzw. Playwright: zwei Browser-Kontexte (Host + Player) im
         selben Test, Buzz-Reihenfolge prüfen. PeerJS funktioniert auch
         localhost↔localhost.

## Pro

- **Kein App-Install:** Spieler öffnen nur einen Link/QR-Code – perfekt für Partys.
- **Fast alles wird wiederverwendet:** Editor, Kategorien-Plugin-System,
  YouTube-Embed für Champion-Songs, lz-string-Quiz-Links, Storage.
- **Bleibt kostenlos & statisch:** GitHub Pages reicht weiterhin, kein eigener
  Server zu betreiben.
- **Schnelle Iteration:** Vite-Hot-Reload, zwei Browserfenster nebeneinander = Test.
- Einzelspieler-Modus bleibt unberührt bestehen.

## Contra

- **PeerJS-Broker ist eine externe Abhängigkeit:** kostenlos, aber ohne SLA –
  wenn er down ist, klappt der Verbindungsaufbau nicht. (Ausweg: eigener
  `peerjs-server` ist eine ~5-Zeilen-Node-App auf einem Free-Tier-Host; oder
  Signaling manuell per Copy-Paste-Code – hässlich, aber serverlos.)
- **WLAN-Fallstricke:** Gäste-WLANs mit „Client Isolation" (Hotel, manche
  Fritzbox-Gastnetze) blockieren P2P zwischen Geräten. Im normalen Heim-WLAN
  kein Problem; Fallback wäre mobiles Netz (dann läuft es über TURN, das der
  freie PeerJS-Broker nur begrenzt bietet).
- **Buzzer-Latenz ist „gut genug", nicht perfekt:** ~10–50 ms Unterschied möglich.
  Für Party okay, für E-Sport nicht.
- Kein Godot-Lerneffekt.

## Alternativen zum Vergleich (bewusst nicht gewählt)

- **Eigener WebSocket-Server:** einfachstes Mental-Modell, aber die App wäre
  nicht mehr rein statisch – Hosting, Betrieb, Kosten.
- **Firebase/Supabase Realtime:** sehr einfach, aber Vendor-Account, API-Keys im
  Client, Internetpflicht (P2P im WLAN funktioniert notfalls sogar offline,
  wenn der Broker einmal vermittelt hat).

## Aufwandsschätzung

Zustandsmaschine extrahieren ~½ Tag, Netz-Layer + Lobby ~1 Tag, Host/Player-Views
~1–2 Tage, Duell-Modus ~1 Tag, Robustheit ~1 Tag. **Grob eine Woche Feierabende.**
