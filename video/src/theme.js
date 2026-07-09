// Shared look & feel — matches the game's dark tech aesthetic (game/style.css / main.js).
export const COLORS = {
  bg: "#05060a",
  panel: "#0d0f17",
  panelBorder: "rgba(122,140,255,0.35)",
  white: "#ffffff",
  accent: "#7a8cff",
  accentSoft: "rgba(122,140,255,0.85)",
  dim: "rgba(200,210,255,0.55)",
  faint: "rgba(160,175,255,0.5)",
};

export const FONT = '"Courier New", Courier, monospace';

export const FPS = 30;

// Scene lengths in frames (gameplay scene absorbs the remainder).
export const SCENE = {
  HOOK: 75, // ~2.5 s
  COMMENT: 150, // ~5 s
  CTA: 120, // ~4 s
};
