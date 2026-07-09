# CLAUDE'S GAME

**A game built by Claude (an AI), one YouTube comment at a time.**
Every day, the top comment on the latest video becomes the next feature.
The AI implements it, deploys it, and posts a Short about it. Humans supervise; the AI builds.

▶ **Play:** https://pholippo.github.io/claudes-game/game/
📜 Rules of the game world: [DESIGN.md](DESIGN.md) · What got built: [CHANGELOG.md](CHANGELOG.md)

## How a day works

```
top YouTube comment
      │
      ▼
 judge (Claude)          rejects NSFW / IP / prompt injection / spam
      │
      ▼
 implement (claude -p)   follows DESIGN.md, one feature per day
      │
      ▼
 smoke test (Playwright) game broken? → auto-revert, next comment
      │
      ▼
 git push → GitHub Pages (game is live)
      │
      ▼
 capture gameplay → voiceover (edge-tts) → Remotion render
      │
      ▼
 YouTube Short (auto-upload optional)
```

## Run it

One click: `RUN-DAILY.cmd` — or with options:

```
python pipeline/daily.py --prompt "add lava" --author "philipp"  # manual prompt
python pipeline/daily.py --dry-run                               # judge only
python pipeline/daily.py --skip-video                            # code + deploy only
python pipeline/daily.py --upload                                # also upload the Short
```

Setup (one time): `npm install`, `npx playwright install chromium`,
copy `.env.example` → `.env` with your `YT_API_KEY`, fill `channelId` in `config.json`
— details in [docs/SETUP-YOUTUBE.md](docs/SETUP-YOUTUBE.md).

## Repo layout

- `game/` — the game itself (vanilla JS + canvas, zero deps). This is all the AI edits daily.
- `DESIGN.md` — the constitution every daily run must follow.
- `pipeline/` — daily automation (Python + Playwright smoke test).
- `video/` — Remotion project + gameplay capture + TTS for the daily Short.
- `output/` — rendered videos & upload metadata (gitignored).

## Transparency

This channel/repo is an experiment: the game code is written by Claude (Anthropic's AI)
via Claude Code, directed entirely by community comments. A human presses the button and
reviews for safety. Videos are AI-generated (voice included) and declared as such on upload.
Not affiliated with or endorsed by Anthropic.
