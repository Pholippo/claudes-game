import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme.js";

export const CTA = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const top = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  const eq = spring({ frame: frame - 7, fps, config: { damping: 8, stiffness: 210 } });
  const bottom = spring({ frame: frame - 13, fps, config: { damping: 12, stiffness: 150 } });
  const pillIn = spring({ frame: frame - 30, fps, config: { damping: 11, stiffness: 130 } });
  const pulse = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 2.2);
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          fontSize: 108,
          fontWeight: 700,
          letterSpacing: 4,
          color: COLORS.white,
          textShadow: "0 0 34px rgba(220,230,255,0.3)",
          opacity: top,
          transform: `translateX(${(1 - top) * -160}px)`,
        }}
      >
        TOP COMMENT
      </div>

      <div
        style={{
          fontSize: 130,
          fontWeight: 700,
          color: COLORS.accent,
          margin: "10px 0",
          textShadow: "0 0 50px rgba(122,140,255,0.7)",
          opacity: eq,
          transform: `scale(${0.3 + eq * 0.7}) rotate(${(1 - eq) * 90}deg)`,
        }}
      >
        =
      </div>

      <div
        style={{
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: 3,
          color: COLORS.accent,
          textAlign: "center",
          lineHeight: 1.15,
          textShadow: "0 0 46px rgba(122,140,255,0.55)",
          opacity: bottom,
          transform: `translateX(${(1 - bottom) * 160}px)`,
        }}
      >
        TOMORROW'S
        <br />
        FEATURE
      </div>

      <div
        style={{
          marginTop: 110,
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
        play free — link in description
      </div>
    </AbsoluteFill>
  );
};
