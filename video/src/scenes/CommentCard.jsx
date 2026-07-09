import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme.js";

const ThumbUp = ({ size = 34, color = COLORS.dim }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
  </svg>
);

const Caret = ({ frame }) => (
  <span
    style={{
      display: "inline-block",
      width: 22,
      height: 46,
      marginLeft: 8,
      verticalAlign: "middle",
      backgroundColor: COLORS.accent,
      opacity: Math.floor(frame / 16) % 2 === 0 ? 1 : 0,
    }}
  />
);

export const CommentCard = ({ promptAuthor, promptText, isIntro, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 120 } });
  const headIn = spring({ frame: frame - 3, fps, config: { damping: 12, stiffness: 160 } });
  const likeIn = spring({ frame: frame - 22, fps, config: { damping: 9, stiffness: 180 } });
  const exit = interpolate(frame, [durationInFrames - 9, durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const author = isIntro ? "you?" : promptAuthor || "someone";
  const initial = (isIntro ? "?" : (promptAuthor || "?").replace(/^@/, "").charAt(0)).toUpperCase();

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, opacity: exit }}
    >
      {/* heading */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: 8,
          color: COLORS.white,
          marginBottom: 20,
          opacity: headIn,
          transform: `translateY(${(1 - headIn) * -50}px)`,
        }}
      >
        {isIntro ? "HOW IT WORKS" : "TODAY'S TOP COMMENT"}
      </div>
      <div
        style={{
          fontSize: 30,
          color: COLORS.faint,
          letterSpacing: 3,
          marginBottom: 60,
          opacity: headIn,
        }}
      >
        {isIntro ? "your prompt goes 1:1 to the AI" : "it becomes today's feature"}
      </div>

      {/* the comment card, YouTube style */}
      <div
        style={{
          width: 900,
          backgroundColor: COLORS.panel,
          border: isIntro ? `3px dashed rgba(122,140,255,0.55)` : `2px solid ${COLORS.panelBorder}`,
          borderRadius: 28,
          padding: "44px 48px",
          boxShadow: "0 24px 80px rgba(0,0,10,0.6), 0 0 60px rgba(122,140,255,0.12)",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 240}px) scale(${0.92 + enter * 0.08})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: isIntro
                ? "rgba(122,140,255,0.18)"
                : `linear-gradient(135deg, ${COLORS.accent}, #4a5ae0)`,
              border: isIntro ? "2px dashed rgba(122,140,255,0.6)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 700,
              color: COLORS.white,
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div>
            <span style={{ fontSize: 34, fontWeight: 700, color: COLORS.white }}>@{author}</span>
            <span style={{ fontSize: 28, color: COLORS.dim, marginLeft: 22 }}>today</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 34,
            fontSize: isIntro ? 44 : 42,
            lineHeight: 1.4,
            color: COLORS.white,
            wordBreak: "break-word",
          }}
        >
          {isIntro ? (
            <>
              <span style={{ color: COLORS.dim }}>drop a prompt below — </span>
              <span style={{ color: COLORS.accent, fontWeight: 700 }}>
                "add lava" · "give it a hat" · ANYTHING
              </span>
              <Caret frame={frame} />
            </>
          ) : (
            promptText
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 38 }}>
          <div style={{ transform: `scale(${likeIn})` }}>
            <ThumbUp color={isIntro ? COLORS.dim : COLORS.accent} />
          </div>
          <span style={{ fontSize: 30, color: isIntro ? COLORS.dim : COLORS.accent, fontWeight: 700 }}>
            {isIntro ? "0" : "TOP"}
          </span>
          <div style={{ transform: "scale(-1, -1)", marginLeft: 26, opacity: 0.55 }}>
            <ThumbUp size={30} />
          </div>
          <span style={{ fontSize: 28, color: COLORS.dim, marginLeft: 40, letterSpacing: 2 }}>
            REPLY
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
