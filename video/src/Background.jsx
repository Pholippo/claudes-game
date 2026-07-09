import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "./theme.js";

// Deterministic PRNG so the starfield is identical on every frame/render.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_COUNT = 110;
const rand = mulberry32(1337);
const STARS = Array.from({ length: STAR_COUNT }, () => ({
  x: rand() * 100,
  y: rand() * 100,
  z: 0.2 + rand() * 0.8, // depth: brightness + drift speed
  tw: rand() * Math.PI * 2, // twinkle phase
}));

const GRID = 54; // px

export const Background = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const drift = (t * 6) % GRID;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      {/* subtle grid — "the void has structure" */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(122,140,255,0.055) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(122,140,255,0.055) 1px, transparent 1px)",
          backgroundSize: `${GRID}px ${GRID}px`,
          backgroundPosition: `${-drift}px ${-drift}px`,
        }}
      />
      {/* starfield */}
      {STARS.map((s, i) => {
        const a = 0.2 + 0.55 * Math.abs(Math.sin(t * 0.8 + s.tw)) * s.z;
        const size = s.z > 0.7 ? 3 : 2;
        const x = (s.x - t * 0.35 * s.z + 100) % 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${s.y}%`,
              width: size,
              height: size,
              backgroundColor: `rgba(220,230,255,${a.toFixed(3)})`,
            }}
          />
        );
      })}
      {/* soft vignette to focus the center */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% 45%, transparent 55%, rgba(0,0,5,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
