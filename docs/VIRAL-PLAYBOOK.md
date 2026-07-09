# VIRAL-PLAYBOOK — CLAUDE'S GAME

Destillat aus 3 Research-Läufen (2026-07-09): Viralitäts-Anatomie, Null-Views-Problem,
Musik-Strategie. Quellen in den Reports; hier nur das Umsetzbare.

---

## 1. Launch-Protokoll gegen das Null-Views-Problem

Diagnose: Deine bisherigen 0-View-Accounts sind sehr wahrscheinlich eine Kombination aus
(a) gleiches Browser-Profil/Cookies wie frühere geflaggte Accounts, (b) gleiche Home-IP,
(c) Posten sofort nach Signup ohne Warm-up, (d) Desktop-Upload auf TikTok als einziger Weg.
TikTok prüft neue Accounts explizit auf Ban-Evasion — ein neuer Account im alten
Browser-Profil "erbt" den Verdacht.

**Setup (einmalig):**
1. **Frisches, dediziertes Browser-Profil** (oder frischer Browser) NUR für die neuen
   Accounts — keine alten Cookies, nie alte Accounts darin einloggen.
2. **Anderes Netz fürs Anlegen + erste 1–2 Wochen**: Handy-Hotspot (Mobilfunk), nicht das
   Heim-WLAN, über das die 0-View-Accounts liefen.
3. **KEIN VPN.** Datacenter-IPs sind das größte Flag-Risiko, und TikTok gewichtet Region
   niedriger als Verhalten — englischer Content erreicht US/global auch aus Österreich.
   (VPN-"Geheimtipps" kommen von VPN-Verkäufern.)
4. **Echte E-Mail + Telefonnummer verifizieren** (beide Plattformen). Wegwerf-Mails werden
   teils geblockt/beäugt.

**TikTok:**
5. **Personal-/Creator-Konto, NICHT Business!** Business-Konten verlieren die komplette
   Mainstream-Sound-Library (nur Commercial Music Library) — genau das Gegenteil von dem,
   was wir wollen. Professional-Features (Analytics) gibt's auch als Creator-Konto.
6. Profil sofort komplett: Avatar, Nischen-Bio, Link, öffentlich.
7. **3–7 Tage Warm-up vor dem ersten Post**: täglich 10–30 min in der Nische scrollen
   (AI/Gamedev/Gaming), Videos zu Ende schauen, ein paar Likes, 3–5 Creator folgen,
   vereinzelt echte Kommentare. Ziel: FYP ist ~70 % Nische.
8. **Posten übers Handy (TikTok-App)**, zumindest anfangs — nativer Upload-Pfad mit den
   reichsten Signalen. Desktop-Upload ist nicht bewiesen schädlich, aber warum Unsicherheit
   akzeptieren. 1 Post/Tag in Woche 1, kein Burst.
9. Nach ~2 Wochen konstanter 0 Views trotz Protokoll → Account auf ein ANDERES physisches
   Gerät (altes Handy) umziehen; das ist der am besten belegte Fix.

**YouTube:**
10. Kein echtes "Neuer-Kanal-Penalty" belegt — jedes Short bekommt seinen eigenen
    Test-Pool (~50–500 Viewer), Subscriber-Zahl ist fast egal. Kanal komplett einrichten
    (Banner, Avatar, Beschreibung, Telefon-Verifizierung in Studio), Desktop-Upload ist
    dort völlig okay (sogar empfohlen).
11. Erste Shorts = beste Shorts: YouTube bewertet frühe Videos, um zu entscheiden, ob es
    künftige verteilt.

---

## 2. Die Video-Formel (30 s)

**Struktur** (im Remotion-Template umgesetzt):
- 0–2 s: **Hook-Text über LAUFENDEM Gameplay** (nie Standbild/Schwarz — Algorithmus
  entscheidet nach ~1,5 s). Tag 1: „AN AI IS BUILDING THIS GAME". Ab Tag 2 Outcome-first:
  „YOU COMMENTED IT. THE AI BUILT IT."
- 2–5,5 s: Comment-Karte (kompakt!) — der Gewinner-Kommentar bzw. am Tag 1 die Anleitung.
- 5,5–27 s: Gameplay mit Kinetic Captions + **Zoom-Punch alle ~4 s** (Pattern-Interrupt;
  40–60 % bessere Retention). Nie eine visuell statische Sekunde unter dem TTS-Voice.
- 27–31 s: CTA „COMMENT YOUR DUMBEST FEATURE / top comment = tomorrow's build /
  play what chat built — link in bio" → **Loop-Reprise**: letzte Frames zeigen wieder die
  Hook-Zeile (kein Fade-to-Black — Auto-Replay-Watchthrough ist Ranking-Signal).

**Hooks zum Testen (ab Tag 2, Outcome zuerst):**
- „Comment #1 said 'add lava'. Here's what happened →"
- „You commented it. Claude built it. Zero human code."
- „I gave an AI ONE comment yesterday. This is what it built."

**Kommentar-Maximierung (unser Lebenselixier):**
- **Erste Stunde nach Post = alles.** Kommentare in Stunde 1 haben ~3× Take-off-Chance →
  in dieser Stunde aktiv die Top-5–10-Kommentare beantworten (passt eh: wir brauchen den
  Top-Comment für morgen).
- **Gepinnter Kommentar = Frage**, nicht generischer CTA: „Reply with the dumbest feature —
  I'm building whatever wins by midnight." (+~30 % Replies vs. generisch)
- Skeptiker („hat die KI das WIRKLICH gebaut?") sind Gratis-Engagement → nächste Iteration:
  1–2 s echter Code-Diff im Video („proof insert", Claude-Plays-Pokémon-Muster).
- Statt Rage-Bait: die KI trifft sichtbar eine **diskutable** Design-Entscheidung und
  captioned sie als Entscheidung („I'm doing this. Fight me in the comments.").

**AI-Voice:** TTS wird NICHT abgestraft (TikTok offiziell: Disclosure ≠ Distribution-Signal).
Abgestraft wird TTS über statischen Slideshows — haben wir nicht. Persona konsequent
durchziehen („Claude" als Charakter-Brand, wie Neuro-sama).

---

## 3. Musik-Strategie

**Goldene Regel: NIE einen echten Chart-Song in die MP4 einbrennen.**
- TikTok erkennt & **mutet** eingebrannte Mainstream-Musik (Lizenz gilt nur für den
  In-App-Sound-Picker).
- YouTube: Content-ID-Claim → beste Realität: Views ja, aber Einnahmen gehen ans Label;
  schlimmste: Block. Kein Growth-Hack.
- YouTubes Musik-Picker funktioniert NUR im nativen Shorts-Aufnahme-Flow, NICHT für
  hochgeladene Dateien — für unsere Pipeline unbrauchbar.

**Unser Setup:**
- **In die MP4 einbrennen:** cleared Track (aktuell „Voxel Revolution", Kevin MacLeod,
  CC BY 4.0 — Credit in Description!). Upgrade-Option: Epidemic Sound (~7–12 €/mo,
  TikTok-Sound-Partner + YouTube-Safelisting, 10–20 Tracks rotieren) — Philipps Entscheidung.
- **Auf TikTok zusätzlich (der „bekannte Musik"-Hebel):** beim Posten in der App einen
  echten **Trend-Sound leise drüberlegen** — mit Personal-Konto legal & safe. Das ist der
  einzige legale Weg zu Mainstream-Sound, und er kostet nichts.
- Beat-synced schneiden schließt die Performance-Lücke von Library-Musik fast komplett
  (~12 % → ~4 % View-Through-Differenz).

---

## 4. Posting-Meta

- **TikTok (Gaming-Audience):** 19–23 Uhr lokal, Sweet Spot Di–Do 20–22 Uhr.
- **YouTube Shorts:** anders! Werktags 14–16 Uhr.
- **Hashtags: 3–5 Stück** (z. B. #vibecoding #gamedev #aicoding + 1 breiter Tag).
  20+ Tags = Noise.
- Neuer Account: möglichst konstant gleiche Uhrzeit (±15 min). Später optional 2. Post/Tag
  (Teaser/BTS) im jeweils anderen Slot.
- Konsistenz schlägt perfektes Timing.

---

## 5. Status Umsetzung

- ✅ Video-Template: Hook über Gameplay-Backdrop, kompakte Szenen, Zoom-Punches,
  neuer CTA, Loop-Reprise, Musik-Bett
- ✅ Voiceover-Persona goofy + expliziter Prompt-CTA + „link in bio"
- ⏳ Nächste Iteration: 1–2 s Code-Diff-„Proof"-Insert; Caption-A/B (Highlight-Keyword)
- ⏳ Account-Setup nach Launch-Protokoll (wartet auf Philipps GO)
- ⏳ Optional: Epidemic-Sound-Abo (Philipp), Track-Rotation
