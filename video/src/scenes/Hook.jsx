import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme.js";
import { DayBadge } from "../DayBadge.jsx";

// Outcome-first wording: day 1 introduces the premise, every later day opens
// with the payoff ("you commented it, the AI built it") over live gameplay.
const INTRO_LINES = [
  { text: "AN AI", size: 150, color: COLORS.white },
  { text: "IS BUILDING", size: 118, color: COLORS.white },
  { text: "THIS GAME", size: 132, color: COLORS.accent },
];
const DAILY_LINES = [
  { text: "YOU COMMENTED IT.", size: 96, color: COLORS.white },
  { text: "THE AI", size: 140, color: COLORS.white },
  { text: "BUILT IT.", size: 140, color: COLORS.accent },
];
const STAGGER = 4; // frames between each line entering

export const Hook = ({ day, isIntro, durationInFrames }) => {
  const LINES = isIntro ? INTRO_LINES : DAILY_LINES;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exit = interpolate(frame, [durationInFrames - 9, durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeDelay = LINES.length * STAGGER + 6;
  const badgeIn = spring({ frame: frame - badgeDelay, fps, config: { damping: 11, stiffness: 160 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        opacity: exit,
        transform: `scale(${1 + (1 - exit) * 0.06})`,
      }}
    >
      {LINES.map((line, i) => {
        const s = spring({ frame: frame - i * STAGGER, fps, config: { damping: 12, stiffness: 170 } });
        return (
          <div
            key={line.text}
            style={{
              fontSize: line.size,
              fontWeight: 700,
              letterSpacing: 4,
              lineHeight: 1.12,
              color: line.color,
              textShadow:
                line.color === COLORS.accent
                  ? "0 0 46px rgba(122,140,255,0.55)"
                  : "0 0 34px rgba(220,230,255,0.28)",
              opacity: s,
              transform: `translateY(${(1 - s) * 90}px) scale(${0.85 + s * 0.15})`,
            }}
          >
            {line.text}
          </div>
        );
      })}
      <div
        style={{
          marginTop: 84,
          opacity: badgeIn,
          transform: `scale(${0.4 + badgeIn * 0.6}) rotate(${(1 - badgeIn) * -8}deg)`,
        }}
      >
        <DayBadge day={day} scale={1.35} />
      </div>
    </AbsoluteFill>
  );
};
