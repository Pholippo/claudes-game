# DESIGN.md — the constitution of CLAUDE'S GAME

This file is the single source of truth for every daily implementation run.
The implementing agent MUST read this before touching code and MUST NOT violate it.

## What this project is

A browser game built in public by Claude (an AI), one community prompt per day.
Every day the top YouTube comment becomes the next feature. The game must always
stay playable — a broken day kills the format.

## Hard rules (never violate)

1. **The game must boot and be playable after every change.** `window.GAME_READY = true`
   must be set once the main loop runs. If a feature risks breaking the core loop, ship a
   smaller safe version of it.
2. **Zero dependencies, zero build step.** Vanilla JS + Canvas only. No frameworks, no CDN
   scripts, no fetch/network calls, no external assets that require a server.
3. **Only edit inside `game/`** plus appending to `CHANGELOG.md`. Never touch `pipeline/`,
   `video/`, or this file.
4. **Internal resolution stays 960×540** (16:9). Mobile touch controls must keep working.
5. **Content limits:** no NSFW, no gore, no real-world brands/IP (no Mario, no Minecraft
   assets), no politics, no personal data, no ads, no external links other than the YouTube
   channel. Family-friendly (the audience includes kids).
6. **No self-sabotage:** never remove the day counter, the credits system, or existing
   community features unless the community explicitly voted to remove them.
7. **Performance:** stay smooth on a mid-range phone. No unbounded entity spawning;
   cap particle/entity counts.

## How to implement a daily feature

1. Read the prompt (the winning comment) and interpret it charitably but literally.
   Absurd is fine — absurd is the format. Keep the spirit of what was asked.
2. Increment `window.GAME_DAY` in `game/day.js`.
3. Append one entry to `window.CREDITS` in `game/credits.js` (newest first):
   `{ day: N, author: "<comment author>", feature: "<short feature name>" }`.
4. Append one line to `CHANGELOG.md`: `- Day N (<date>): <feature> — requested by <author>`.
5. Implement in `game/main.js` (or new files in `game/`, loaded via `index.html`).
   Follow the existing section structure; new systems get their own clearly-marked section.
6. Keep the diff focused. One feature per day. Refactors only when needed for the feature.

## Code style

- Vanilla ES2020+, `"use strict"`, no globals except the documented `window.*` hooks.
- Small functions, named constants (no magic numbers), comments only where intent is unclear.
- New entities register in `world.entities` with `{ update(dt), draw(ctx) }`.

## Automation hooks (do not remove)

- `window.GAME_READY` — smoke test checks this.
- `window.GAME_DAY` — HUD + video pipeline read this.
- `window.CREDITS` — credits screen + video pipeline read this.
- `window.__game` — exposes `startGame`, `player`, `world`, `input` for the gameplay
  capture bot. If you add core mechanics, keep these references valid.
