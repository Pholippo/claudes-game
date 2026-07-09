import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme.js";

export const CTA = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const top = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  const mid = spring({ frame: frame - 6, fps, config: { damping: 10, stiffness: 180 } });
  const sub = spring({ frame: frame - 14, fps, config: { damping: 12, stiffness: 150 } });
  const pillIn = spring({ frame: frame - 26, fps, config: { damping: 11, stiffness: 130 } });
  const pulse = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 2.2);

  // Loop reprise: the last beat fades the CTA down and brings back the hook
  // line, so the final frame "rhymes" with frame 0 and the autoplay loop
  // reads as intentional (no fade to black — that kills the loop).
  const REPRISE_FRAMES = 22;
  const repriseIn = interpolate(
    frame,
    [durationInFrames - REPRISE_FRAMES, durationInFrames - 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ctaFade = 1 - repriseIn * 0.9;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: ctaFade,
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: 4,
            color: COLORS.white,
            textShadow: "0 0 34px rgba(220,230,255,0.3)",
            opacity: top,
            transform: `translateX(${(1 - top) * -160}px)`,
          }}
        >
          COMMENT YOUR
        </div>

        <div
          style={{
            fontSize: 118,
            fontWeight: 700,
            letterSpacing: 3,
            color: COLORS.accent,
            textAlign: "center",
            lineHeight: 1.12,
            textShadow: "0 0 50px rgba(122,140,255,0.65)",
            opacity: mid,
            transform: `scale(${0.5 + mid * 0.5})`,
          }}
        >
          DUMBEST
          <br />
          FEATURE
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 42,
            letterSpacing: 3,
            color: COLORS.dim,
            opacity: sub,
            transform: `translateX(${(1 - sub) * 160}px)`,
          }}
        >
          top comment = tomorrow's build
        </div>

        <div
          style={{
            marginTop: 90,
            fontSize: 42,
            letterSpacing: 3,
            color: COLORS.white,
            border: `3px solid ${COLORS.accent}`,
            borderRadius: 999,
            padding: "26px 54px",
            backgroundColor: "rgba(122,140,255,0.1)",
            boxShadow: "0 0 40px rgba(122,140,255,0.3)",
            opacity: pillIn,
            transform: `scale(${(0.6 + pillIn * 0.4) * pulse})`,
          }}
        >
          play what chat built — link in bio
        </div>
      </div>

      {/* hook reprise for the loop */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: repriseIn,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: 4,
            textAlign: "center",
            lineHeight: 1.2,
            color: COLORS.white,
            textShadow: "0 0 40px rgba(220,230,255,0.3)",
            transform: `scale(${0.9 + repriseIn * 0.1})`,
          }}
        >
          AN AI IS BUILDING
          <br />
          <span style={{ color: COLORS.accent, textShadow: "0 0 46px rgba(122,140,255,0.55)" }}>
            THIS GAME
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
