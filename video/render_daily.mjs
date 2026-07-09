/**
 * render_daily.mjs — one-command renderer for the daily Short.
 *
 * Usage:  node video/render_daily.mjs --props <props.json> --out <mp4>
 *
 * props.json (paths may be absolute, or relative to your cwd / the props file):
 * {
 *   "day": 1,
 *   "promptText": "...",            // yesterday's winning comment
 *   "promptAuthor": "...",
 *   "script": "...",                // voiceover script (drives captions)
 *   "voiceoverSrc": "path/to.mp3",
 *   "gameplaySrc": "path/to.mp4",
 *   "isIntro": false,
 *   "durationInFrames": 1234        // optional; derived from the mp3 if omitted
 * }
 *
 * The script probes both media files with ffprobe, stages them into the
 * Remotion public dir (video/out/public — gitignored) and invokes
 * `remotion render` for composition "Daily". Works from any cwd.
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const ENTRY = join(__dirname, "src", "index.jsx");
const STAGE_DIR = join(__dirname, "out", "public");
const FPS = 30;
const TAIL_SEC = 4;

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--props") args.props = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
  }
  if (!args.props || !args.out) {
    console.error("Usage: node video/render_daily.mjs --props <props.json> --out <mp4>");
    process.exit(1);
  }
  args.props = resolve(process.cwd(), args.props);
  args.out = resolve(process.cwd(), args.out);
  return args;
}

/** Resolve a media path: absolute as-is, else relative to cwd, else to the props file. */
function resolveMedia(src, propsDir) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  if (isAbsolute(src)) return src;
  const fromCwd = resolve(process.cwd(), src);
  if (existsSync(fromCwd)) return fromCwd;
  return resolve(propsDir, src);
}

function ffprobeDuration(file) {
  const res = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file],
    { encoding: "utf8" }
  );
  const dur = res.status === 0 ? parseFloat(res.stdout.trim()) : NaN;
  if (!Number.isFinite(dur)) throw new Error(`ffprobe could not read duration of ${file}`);
  return dur;
}

function remotionCliPath() {
  const require = createRequire(import.meta.url);
  const pkgPath = require.resolve("@remotion/cli/package.json", { paths: [REPO_ROOT] });
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const bin = typeof pkg.bin === "string" ? pkg.bin : pkg.bin.remotion;
  return join(dirname(pkgPath), bin);
}

function main() {
  const args = parseArgs(process.argv);
  const props = JSON.parse(readFileSync(args.props, "utf8"));
  const propsDir = dirname(args.props);

  const voicePath = resolveMedia(props.voiceoverSrc, propsDir);
  const gameplayPath = resolveMedia(props.gameplaySrc, propsDir);
  if (!voicePath || !existsSync(voicePath)) throw new Error(`voiceoverSrc not found: ${voicePath}`);
  if (!gameplayPath || !existsSync(gameplayPath)) throw new Error(`gameplaySrc not found: ${gameplayPath}`);

  const audioDurationSec = ffprobeDuration(voicePath);
  const gameplayDurationSec = ffprobeDuration(gameplayPath);
  const durationInFrames =
    Number(props.durationInFrames) > 0
      ? Math.round(Number(props.durationInFrames))
      : Math.round((audioDurationSec + TAIL_SEC) * FPS);

  // Stage media into the Remotion public dir (browser can only load served files).
  mkdirSync(join(STAGE_DIR, "assets"), { recursive: true });
  copyFileSync(voicePath, join(STAGE_DIR, "assets", "voiceover.mp3"));
  copyFileSync(gameplayPath, join(STAGE_DIR, "assets", "gameplay.mp4"));

  // Music bed: explicit musicSrc prop, else the repo's default track, else none.
  const musicPath = props.musicSrc
    ? resolveMedia(props.musicSrc, propsDir)
    : join(__dirname, "assets", "music.mp3");
  let stagedMusic = null;
  if (musicPath && existsSync(musicPath)) {
    copyFileSync(musicPath, join(STAGE_DIR, "assets", "music.mp3"));
    stagedMusic = "assets/music.mp3";
  }

  const finalProps = {
    ...props,
    voiceoverSrc: "assets/voiceover.mp3",
    gameplaySrc: "assets/gameplay.mp4",
    musicSrc: stagedMusic,
    audioDurationSec,
    gameplayDurationSec,
    durationInFrames,
  };
  const stagedPropsPath = join(__dirname, "out", `props-render-${Date.now()}.json`);
  writeFileSync(stagedPropsPath, JSON.stringify(finalProps, null, 2));

  mkdirSync(dirname(args.out), { recursive: true });

  console.error(
    `[render] day=${finalProps.day} audio=${audioDurationSec.toFixed(2)}s ` +
      `gameplay=${gameplayDurationSec.toFixed(2)}s frames=${durationInFrames}`
  );

  const res = spawnSync(
    process.execPath,
    [
      remotionCliPath(),
      "render",
      ENTRY,
      "Daily",
      `--props=${stagedPropsPath}`,
      `--output=${args.out}`,
      "--codec=h264",
      `--public-dir=${STAGE_DIR}`,
    ],
    { stdio: "inherit", cwd: REPO_ROOT }
  );
  if (res.status !== 0) throw new Error(`remotion render failed (exit ${res.status})`);
  if (!existsSync(args.out)) throw new Error("remotion reported success but output mp4 is missing");

  const outDuration = ffprobeDuration(args.out);
  console.log(`out=${args.out}`);
  console.log(`DURATION_SECONDS=${outDuration.toFixed(2)}`);
}

try {
  main();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
