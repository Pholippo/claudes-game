/* ============================================================
   CLAUDE'S GAME — built by an AI, one comment at a time.
   Day 1: a cube in the void.

   Structure (see DESIGN.md before changing anything):
     [1] Boot & canvas          [5] Player
     [2] Input                  [6] World & entities
     [3] State machine          [7] Update loop
     [4] Particles & FX         [8] Render
   Future features: add new systems as clearly-marked sections,
   register entities in world.entities, keep the game playable.
   ============================================================ */

(() => {
"use strict";

/* ---------- [1] Boot & canvas ---------- */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;   // 960 — internal resolution, do not change
const H = canvas.height;  // 540

const DAY = window.GAME_DAY || 1;
const CREDITS = window.CREDITS || [];

/* ---------- [2] Input ---------- */

const input = { left: false, right: false, jump: false, jumpPressed: false, any: false };

const KEYMAP = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "jump", KeyW: "jump", Space: "jump",
};

addEventListener("keydown", (e) => {
  const k = KEYMAP[e.code];
  input.any = true;
  if (!k) return;
  if (k === "jump" && !input.jump) input.jumpPressed = true;
  input[k] = true;
  e.preventDefault();
});

addEventListener("keyup", (e) => {
  const k = KEYMAP[e.code];
  if (k) input[k] = false;
});

function bindTouch(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  const on = (e) => {
    e.preventDefault();
    input.any = true;
    if (key === "jump" && !input.jump) input.jumpPressed = true;
    input[key] = true;
  };
  const off = (e) => { e.preventDefault(); input[key] = false; };
  el.addEventListener("touchstart", on, { passive: false });
  el.addEventListener("touchend", off, { passive: false });
  el.addEventListener("touchcancel", off, { passive: false });
}
bindTouch("tleft", "left");
bindTouch("tright", "right");
bindTouch("tjump", "jump");

canvas.addEventListener("pointerdown", () => { input.any = true; });

/* ---------- [3] State machine ---------- */

const STATE = { MENU: 0, PLAY: 1, CREDITS: 2 };
let state = STATE.MENU;
let stateTime = 0;

addEventListener("keydown", (e) => {
  if (state === STATE.MENU) {
    if (e.code === "KeyC") { state = STATE.CREDITS; stateTime = 0; }
    else if (e.code === "Enter" || e.code === "Space") { startGame(); }
  } else if (state === STATE.CREDITS) {
    if (e.code === "Escape" || e.code === "Enter" || e.code === "KeyC") { state = STATE.MENU; stateTime = 0; }
  }
});

canvas.addEventListener("pointerdown", () => {
  if (state === STATE.MENU) startGame();
  else if (state === STATE.CREDITS) { state = STATE.MENU; stateTime = 0; }
});

function startGame() {
  state = STATE.PLAY;
  stateTime = 0;
  resetPlayer();
}

/* ---------- [4] Particles & FX ---------- */

const particles = [];

function spawnDust(x, y, n, spread) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * spread,
      vy: -Math.random() * 60 - 10,
      life: 0.4 + Math.random() * 0.3,
      t: 0,
      r: 1.5 + Math.random() * 2,
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    if (p.t > p.life) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 120 * dt;
  }
}

// Background starfield (parallax, purely cosmetic)
const stars = [];
for (let i = 0; i < 90; i++) {
  stars.push({
    x: Math.random() * W,
    y: Math.random() * H,
    z: 0.2 + Math.random() * 0.8,   // depth: brightness + drift speed
    tw: Math.random() * Math.PI * 2, // twinkle phase
  });
}

/* ---------- [5] Player ---------- */

const GRAVITY = 1500;
const MOVE_SPEED = 300;
const JUMP_VEL = 560;
const COYOTE_TIME = 0.09;
const JUMP_BUFFER = 0.12;

const player = {
  x: 0, y: 0, w: 28, h: 28,
  vx: 0, vy: 0,
  onGround: false,
  coyote: 0,
  jumpBuf: 0,
  squash: 1,       // 1 = normal; <1 landing squash, >1 jump stretch
  facing: 1,
};

function resetPlayer() {
  player.x = W / 2 - player.w / 2;
  player.y = 260;
  player.vx = 0;
  player.vy = 0;
  player.squash = 1;
  spawnDust(player.x + player.w / 2, player.y + player.h, 12, 160);
}

/* ---------- [6] World & entities ---------- */

const world = {
  // Platforms: axis-aligned boxes. The world grows one comment at a time.
  platforms: [
    { x: W / 2 - 160, y: 340, w: 320, h: 16 },  // home platform
    { x: W / 2 - 380, y: 260, w: 90, h: 12 },
    { x: W / 2 + 290, y: 260, w: 90, h: 12 },
  ],
  // Generic entity list for future features (enemies, coins, ...):
  // each entity: { update(dt), draw(ctx) }
  entities: [],
  killY: H + 120, // fall below this -> respawn
};

/* ---------- [7] Update loop ---------- */

let last = performance.now();
let time = 0;

function update(dt) {
  time += dt;
  stateTime += dt;
  updateParticles(dt);

  if (state !== STATE.PLAY) return;

  // Horizontal movement
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  player.vx = dir * MOVE_SPEED;
  if (dir !== 0) player.facing = dir;

  // Jump buffering & coyote time
  player.coyote = player.onGround ? COYOTE_TIME : Math.max(0, player.coyote - dt);
  player.jumpBuf = input.jumpPressed ? JUMP_BUFFER : Math.max(0, player.jumpBuf - dt);
  input.jumpPressed = false;

  if (player.jumpBuf > 0 && player.coyote > 0) {
    player.vy = -JUMP_VEL;
    player.coyote = 0;
    player.jumpBuf = 0;
    player.squash = 1.35;
    spawnDust(player.x + player.w / 2, player.y + player.h, 8, 120);
  }

  // Gravity + integrate
  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // Platform collisions (from above only — feels forgiving)
  const wasOnGround = player.onGround;
  player.onGround = false;
  for (const p of world.platforms) {
    const withinX = player.x + player.w > p.x && player.x < p.x + p.w;
    const feet = player.y + player.h;
    if (withinX && player.vy >= 0 && feet > p.y && feet - player.vy * dt <= p.y + 2) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }
  if (player.onGround && !wasOnGround) {
    player.squash = 0.6;
    spawnDust(player.x + player.w / 2, player.y + player.h, 10, 180);
  }

  // Ease squash back to 1
  player.squash += (1 - player.squash) * Math.min(1, dt * 12);

  // Fell into the void
  if (player.y > world.killY) resetPlayer();

  // Entities
  for (const e of world.entities) e.update && e.update(dt);
}

/* ---------- [8] Render ---------- */

function drawBackground() {
  ctx.fillStyle = "#05060a";
  ctx.fillRect(0, 0, W, H);

  // subtle grid — "the void has structure"
  ctx.strokeStyle = "rgba(120,140,255,0.05)";
  ctx.lineWidth = 1;
  const grid = 48;
  const off = (time * 6) % grid;
  ctx.beginPath();
  for (let x = -off; x < W; x += grid) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = -off; y < H; y += grid) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();

  // stars
  for (const s of stars) {
    const a = 0.25 + 0.55 * Math.abs(Math.sin(time * 0.8 + s.tw)) * s.z;
    ctx.fillStyle = `rgba(220,230,255,${a.toFixed(3)})`;
    const sx = (s.x - time * 4 * s.z) % W;
    ctx.fillRect(sx < 0 ? sx + W : sx, s.y, s.z > 0.7 ? 2 : 1, s.z > 0.7 ? 2 : 1);
  }
}

function drawWorld() {
  for (const p of world.platforms) {
    ctx.fillStyle = "#e8ecff";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "rgba(120,140,255,0.35)";
    ctx.fillRect(p.x, p.y + p.h, p.w, 3);
  }
  for (const e of world.entities) e.draw && e.draw(ctx);
}

function drawPlayer() {
  const sw = player.w * (2 - player.squash);
  const sh = player.h * player.squash;
  const px = player.x + player.w / 2 - sw / 2;
  const py = player.y + player.h - sh;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(px, py, sw, sh);

  // eye — gives the cube a soul
  ctx.fillStyle = "#05060a";
  const ex = px + sw / 2 + player.facing * sw * 0.18;
  ctx.fillRect(ex - 2, py + sh * 0.28, 5, 7);
}

function drawParticles() {
  for (const p of particles) {
    const a = 1 - p.t / p.life;
    ctx.fillStyle = `rgba(230,235,255,${(a * 0.8).toFixed(3)})`;
    ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
  }
}

function text(str, x, y, size, color, align = "center") {
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(str, x, y);
}

function drawHUD() {
  text(`DAY ${DAY}`, 20, 38, 22, "rgba(255,255,255,0.9)", "left");
  text("top comment decides tomorrow", W - 20, 34, 13, "rgba(160,175,255,0.55)", "right");
}

function drawMenu() {
  const pulse = 0.6 + 0.4 * Math.sin(time * 3);
  text("CLAUDE'S GAME", W / 2, 200, 54, "#ffffff");
  text("built by an AI, one comment at a time", W / 2, 240, 16, "rgba(160,175,255,0.85)");
  text(`DAY ${DAY} — a cube in the void`, W / 2, 300, 18, "rgba(255,255,255,0.7)");
  text("press ENTER or tap to play", W / 2, 380, 18, `rgba(255,255,255,${pulse.toFixed(2)})`);
  text("[C] credits — everyone who built this", W / 2, 416, 13, "rgba(160,175,255,0.5)");
}

function drawCredits() {
  text("THE BUILDERS", W / 2, 90, 32, "#ffffff");
  text("every feature was decided by a comment", W / 2, 120, 13, "rgba(160,175,255,0.7)");
  const start = 170;
  const shown = CREDITS.slice(0, 10);
  shown.forEach((c, i) => {
    const y = start + i * 32;
    text(`DAY ${c.day}`, W / 2 - 300, y, 16, "rgba(160,175,255,0.8)", "left");
    text(c.feature, W / 2 - 190, y, 16, "#ffffff", "left");
    text(c.author, W / 2 + 300, y, 16, "rgba(255,255,255,0.6)", "right");
  });
  text("ESC to go back", W / 2, H - 40, 13, "rgba(255,255,255,0.5)");
}

function render() {
  drawBackground();
  if (state === STATE.MENU) {
    drawWorld();
    drawPlayer();
    drawParticles();
    drawMenu();
  } else if (state === STATE.PLAY) {
    drawWorld();
    drawPlayer();
    drawParticles();
    drawHUD();
  } else if (state === STATE.CREDITS) {
    drawCredits();
  }
}

/* ---------- main loop ---------- */

function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

resetPlayer();
requestAnimationFrame(frame);

// Test & automation hooks (smoke test + gameplay capture use these)
window.GAME_READY = true;
window.__game = { startGame, player, world, input, get state() { return state; } };

})();
