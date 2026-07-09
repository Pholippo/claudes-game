// Smoke test: the game must boot, run, and respond to input. Exit 0 = OK, 1 = broken.
// Usage: node pipeline/smoke.mjs
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gameUrl = pathToFileURL(path.join(repoRoot, "game", "index.html")).href;

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
});

try {
  await page.goto(gameUrl, { waitUntil: "load", timeout: 15000 });

  // 1. Game must declare itself ready
  await page.waitForFunction(() => window.GAME_READY === true, null, { timeout: 8000 });

  // 2. Hooks must exist
  const hooksOk = await page.evaluate(
    () => !!(window.__game && window.__game.startGame && window.__game.player && window.__game.world)
  );
  if (!hooksOk) throw new Error("window.__game hooks missing (see DESIGN.md)");

  // 3. Start the game, hold right + jump, player must actually move
  await page.evaluate(() => window.__game.startGame());
  const x0 = await page.evaluate(() => window.__game.player.x);
  await page.keyboard.down("ArrowRight");
  await page.keyboard.press("Space");
  await page.waitForTimeout(1200);
  await page.keyboard.up("ArrowRight");
  const x1 = await page.evaluate(() => window.__game.player.x);
  if (Math.abs(x1 - x0) < 10) throw new Error(`player did not move (x ${x0} -> ${x1})`);

  // 4. Main loop must keep running without errors for a moment
  await page.waitForTimeout(1500);
  if (errors.length) throw new Error(errors.join(" | "));

  console.log("SMOKE OK - game boots, runs, player moves");
  await browser.close();
  process.exit(0);
} catch (err) {
  console.error(`SMOKE FAILED: ${err.message}`);
  if (errors.length) console.error(errors.join("\n"));
  await browser.close();
  process.exit(1);
}
