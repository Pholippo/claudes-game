/**
 * capture.mjs — record ~22s of gameplay from game/index.html with Playwright,
 * then convert the webm to a 1920x1080 30fps h264 mp4 via ffmpeg.
 *
 * Usage:  node video/tools/capture.mjs --out <mp4 path> [--seconds 22]
 * Works from any cwd (paths are resolved relative to this file / absolute).
 */

import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GAME_HTML = resolve(__dirname, "..", "..", "game", "index.html");

const VIEWPORT = { width: 960, height: 540 };
const OUT_SIZE = { width: 1920, height: 1080 };

function parseArgs(argv) {
  const args = { seconds: 22 };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--seconds") args.seconds = Number(argv[++i]);
  }
  if (!args.out) {
    console.error("Usage: node video/tools/capture.mjs --out <mp4 path> [--seconds 22]");
    process.exit(1);
  }
  args.out = resolve(process.cwd(), args.out);
  return args;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Hold a key for `ms`, optionally tapping Space at offsets (ms) while held. */
async function hold(page, key, ms, jumpsAt = []) {
  await page.keyboard.down(key);
  let elapsed = 0;
  for (const at of jumpsAt) {
    const wait = Math.max(0, at - elapsed);
    await sleep(wait);
    elapsed += wait;
    await page.keyboard.press("Space");
  }
  await sleep(Math.max(0, ms - elapsed));
  await page.keyboard.up(key);
}

async function jump(page, settleMs = 550) {
  await page.keyboard.press("Space");
  await sleep(settleMs);
}

/**
 * ~22s of varied platformer play. The three platforms live at:
 *   home  x 320..640 (y 340), left x 100..190 (y 260), right x 770..860 (y 260).
 * Player moves 300 px/s, jump reaches ~104 px, so side platforms need a
 * running jump from the home platform's edge. Occasional falls respawn the
 * cube — that reads as "alive", not broken.
 */
async function choreography(page, seconds) {
  const script = [
    // warm-up hops on the home platform
    () => hold(page, "ArrowRight", 450),
    () => jump(page, 620),
    () => hold(page, "ArrowLeft", 650),
    () => jump(page, 620),
    // running leap to the RIGHT platform, hop, drop back home
    () => hold(page, "ArrowRight", 1250, [520]),
    () => jump(page, 620),
    () => hold(page, "ArrowLeft", 900, [150]),
    // dash LEFT across home, leap to the LEFT platform
    () => hold(page, "ArrowLeft", 1500, [1050]),
    () => jump(page, 620),
    // deliberately dive off the left edge -> respawn (looks alive)
    () => hold(page, "ArrowLeft", 900),
    () => sleep(1100),
    // back in the middle: bounce around
    () => jump(page, 500),
    () => hold(page, "ArrowRight", 700, [300]),
    () => hold(page, "ArrowLeft", 500),
    () => jump(page, 620),
    // second trip to the RIGHT platform and a jump off the top
    () => hold(page, "ArrowRight", 1300, [560]),
    () => jump(page, 620),
    () => hold(page, "ArrowLeft", 1200, [200]),
    // left platform attempt again
    () => hold(page, "ArrowLeft", 1400, [980]),
    () => jump(page, 620),
    () => hold(page, "ArrowRight", 1100, [180]),
    // finale: happy hops in the middle
    () => jump(page, 520),
    () => hold(page, "ArrowRight", 400),
    () => jump(page, 520),
    () => hold(page, "ArrowLeft", 400),
    () => jump(page, 620),
  ];

  const deadline = Date.now() + seconds * 1000;
  let i = 0;
  while (Date.now() < deadline) {
    await script[i % script.length]();
    i++;
  }
}

function ffprobeDuration(file) {
  const res = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file],
    { encoding: "utf8" }
  );
  return res.status === 0 ? parseFloat(res.stdout.trim()) : NaN;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!existsSync(GAME_HTML)) throw new Error(`Game not found: ${GAME_HTML}`);
  mkdirSync(dirname(args.out), { recursive: true });

  const videoDir = mkdtempSync(join(tmpdir(), "claudes-game-capture-"));
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    recordVideo: { dir: videoDir, size: VIEWPORT },
  });
  const page = await context.newPage();

  const tStart = Date.now();
  await page.goto(pathToFileURL(GAME_HTML).href);
  await page.waitForFunction(() => window.GAME_READY === true, null, { timeout: 15000 });
  await sleep(400); // let the menu render a beat
  await page.evaluate(() => window.__game.startGame());
  await sleep(250);
  const playOffsetSec = (Date.now() - tStart) / 1000;

  console.error(`[capture] playing for ~${args.seconds}s ...`);
  await choreography(page, args.seconds);
  await sleep(300);

  const video = page.video();
  await context.close(); // flushes the recording
  await browser.close();
  const webmPath = await video.path();

  console.error(`[capture] converting ${webmPath} -> ${args.out}`);
  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-ss", playOffsetSec.toFixed(2), // trim page-load + menu
      "-i", webmPath,
      "-vf", `scale=${OUT_SIZE.width}:${OUT_SIZE.height}:flags=lanczos,fps=30`,
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "18",
      "-pix_fmt", "yuv420p",
      "-an",
      args.out,
    ],
    { stdio: ["ignore", "inherit", "pipe"], encoding: "utf8" }
  );
  if (ff.status !== 0) {
    console.error(ff.stderr);
    throw new Error("ffmpeg conversion failed");
  }
  rmSync(videoDir, { recursive: true, force: true });

  const size = statSync(args.out).size;
  const duration = ffprobeDuration(args.out);
  if (!(size > 200_000)) throw new Error(`mp4 suspiciously small (${size} bytes) — likely no motion`);
  if (!(duration > args.seconds * 0.7)) throw new Error(`mp4 too short (${duration}s)`);

  console.log(`out=${args.out}`);
  console.log(`DURATION_SECONDS=${duration.toFixed(2)}`);
  console.log(`SIZE_BYTES=${size}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
