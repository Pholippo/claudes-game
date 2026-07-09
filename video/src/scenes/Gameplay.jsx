import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Loop,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT } from "../theme.js";
import { DayBadge } from "../DayBadge.jsx";
import { timedChunks } from "../captions.js";

const VIDEO_W = 1000; // 16:9 panel inside the 1080-wide vertical frame
const VIDEO_H = Math.round((VIDEO_W / 16) * 9); // 562

// One kinetic caption chunk. `local` is frames since the chunk appeared.
const Caption = ({ text, local, chunkFrames, fps, accent }) => {
  const pop = spring({ frame: local, fps, config: { damping: 10, stiffness: 220 } });
  const out = interpolate(local, [chunkFrames - 4, chunkFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 84,
        letterSpacing: 2,
        lineHeight: 1.15,
        textAlign: "center",
        textTransform: "uppercase",
        color: accent ? COLORS.accent : COLORS.white,
        textShadow: accent
          ? "0 0 40px rgba(122,140,255,0.6), 0 4px 18px rgba(0,0,10,0.9)"
          : "0 4px 18px rgba(0,0,10,0.9), 0 0 26px rgba(220,230,255,0.25)",
        opacity: Math.min(pop, out),
        transform: `scale(${0.82 + pop * 0.18}) translateY(${(1 - pop) * 30}px)`,
        maxWidth: 960,
      }}
    >
      {text}
    </div>
  );
};

const ACCENT_WORDS = /comment|build|game|free|tomorrow|decides|weird/i;

export const Gameplay = ({
  day,
  script,
  gameplaySrc,
  gameplayDurationSec,
  audioDurationSec,
  sceneStartFrame,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 110 } });
  const badgeIn = spring({ frame: frame - 8, fps, config: { damping: 10, stiffness: 170 } });
  const exit = interpolate(frame, [durationInFrames - 9, durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Captions: rough per-word timing across the whole voiceover; this scene
  // shows the chunks whose window overlaps it.
  const voiceDur = audioDurationSec > 0 ? audioDurationSec : durationInFrames / fps;
  const chunks = timedChunks(script, voiceDur);
  const absSec = (sceneStartFrame + frame) / fps;
  const active = chunks.find((c) => absSec >= c.startSec && absSec < c.endSec);
  const activeLocal = active
    ? frame - Math.max(0, Math.round(active.startSec * fps) - sceneStartFrame)
    : 0;
  const activeFrames = active
    ? Math.max(6, Math.round((active.endSec - active.startSec) * fps))
    : 1;

  const loopFrames = Math.max(1, Math.floor((gameplayDurationSec || 22) * fps));

  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: exit }}>
      {/* header */}
      <div
        style={{
          position: "absolute",
          top: 210,
          width: "100%",
          textAlign: "center",
          opacity: badgeIn,
          transform: `translateY(${(1 - badgeIn) * -40}px)`,
        }}
      >
        <div style={{ fontSize: 40, letterSpacing: 6, color: COLORS.faint, marginBottom: 26 }}>
          LIVE FROM THE VOID
        </div>
        <DayBadge day={day} scale={1.05} />
      </div>

      {/* gameplay panel, 16:9 fitted into the vertical frame */}
      <div
        style={{
          position: "absolute",
          top: 470,
          left: (1080 - VIDEO_W) / 2,
          width: VIDEO_W,
          height: VIDEO_H,
          borderRadius: 20,
          overflow: "hidden",
          border: `2px solid ${COLORS.panelBorder}`,
          boxShadow: "0 30px 90px rgba(0,0,10,0.7), 0 0 70px rgba(122,140,255,0.18)",
          opacity: enter,
          transform: `scale(${0.9 + enter * 0.1}) translateY(${(1 - enter) * 120}px)`,
          backgroundColor: "#000",
        }}
      >
        {gameplaySrc ? (
          <Loop durationInFrames={loopFrames}>
            <OffthreadVideo
              src={gameplaySrc}
              muted
              style={{ width: VIDEO_W, height: VIDEO_H, objectFit: "cover" }}
            />
          </Loop>
        ) : null}
        {/* small overlay tag on the video itself (bottom-right — the game's
            own HUD already occupies both top corners) */}
        <div
          style={{
            position: "absolute",
            bottom: 18,
            right: 22,
            fontSize: 26,
            letterSpacing: 3,
            color: "rgba(255,255,255,0.85)",
            backgroundColor: "rgba(5,6,10,0.55)",
            border: "1px solid rgba(122,140,255,0.4)",
            borderRadius: 8,
            padding: "6px 14px",
          }}
        >
          DAY {day} BUILD
        </div>
      </div>

      {/* kinetic captions under the video */}
      <div
        style={{
          position: "absolute",
          top: 1150,
          width: "100%",
          height: 420,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {active ? (
          <Caption
            key={`${active.startSec}`}
            text={active.text}
            local={activeLocal}
            chunkFrames={activeFrames}
            fps={fps}
            accent={ACCENT_WORDS.test(active.text)}
          />
        ) : null}
      </div>

      {/* footer hint */}
      <div
        style={{
          position: "absolute",
          bottom: 150,
          width: "100%",
          textAlign: "center",
          fontSize: 30,
          letterSpacing: 4,
          color: COLORS.faint,
          opacity: badgeIn * 0.9,
        }}
      >
        playable in your browser — free
      </div>
    </AbsoluteFill>
  );
};
