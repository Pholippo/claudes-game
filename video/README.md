# video/ — the daily Short factory

Produces the vertical (1080x1920, 30 fps) YouTube Short for each day of
CLAUDE'S GAME. Three tools, run in this order:

## 0. One-time setup

```
npm install
npx playwright install chromium
```

(Node 22+, ffmpeg/ffprobe and Python 3.11 on PATH. `edge-tts` is
pip-installed automatically on first voiceover run.)

## 1. Voiceover (edge-tts)

```
python video/tools/voiceover.py --text "..." --out video/out/voiceover.mp3
python video/tools/voiceover.py --text-file script.txt --out video/out/voiceover.mp3
```

Voice: `en-US-AndrewNeural` (calm male; override with `--voice`, pace with
`--rate="-12%"` — note the `=`, argparse eats a bare `-12%`). Prints
`DURATION_SECONDS=...` on the last line.

## 2. Gameplay capture (Playwright)

```
node video/tools/capture.mjs --out video/out/gameplay.mp4 [--seconds 22]
```

Opens `game/index.html` via `file://` in headless Chromium (960x540, DSF 2),
waits for `window.GAME_READY`, calls `window.__game.startGame()`, then plays
~22 s of scripted-but-varied platforming with real keyboard events. Records
with Playwright, trims the menu, converts to 1920x1080 30 fps h264 via ffmpeg.
Fails loudly if the mp4 is tiny (no motion) or too short.

## 3. Render (Remotion)

```
node video/render_daily.mjs --props video/out/props.json --out output/day-NNN.mp4
```

Works from any cwd. `props.json`:

```json
{
  "day": 1,
  "promptText": "yesterday's winning comment",
  "promptAuthor": "commentAuthor",
  "script": "the voiceover script (drives the kinetic captions)",
  "voiceoverSrc": "video/out/voiceover.mp3",
  "gameplaySrc": "video/out/gameplay.mp4",
  "isIntro": false
}
```

- `isIntro: true` (day 1) replaces the comment card with
  "no comments yet — YOU write the first one".
- Duration is derived automatically: voiceover length + 4 s
  (override with `"durationInFrames"`).
- Media files are ffprobed and staged into `video/out/public/` (gitignored);
  paths may be absolute or relative to your cwd / the props file.

Scenes: Hook (2.5 s) → comment card (5 s) → gameplay with captions
(remainder) → CTA (4 s). Voiceover plays across the whole video.

Preview compositions interactively: `npx remotion studio video/src/index.jsx`
