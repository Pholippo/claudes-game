import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SCENE } from "./theme.js";
import { Background } from "./Background.jsx";
import { Hook } from "./scenes/Hook.jsx";
import { CommentCard } from "./scenes/CommentCard.jsx";
import { Gameplay } from "./scenes/Gameplay.jsx";
import { CTA } from "./scenes/CTA.jsx";

// Local assets are staged into the public dir by render_daily.mjs and passed
// as public-relative paths. http(s) URLs pass through untouched.
const resolveSrc = (src) => {
  if (!src) return null;
  return /^https?:\/\//.test(src) ? src : staticFile(src);
};

export const Daily = ({
  day,
  promptText,
  promptAuthor,
  script,
  voiceoverSrc,
  gameplaySrc,
  isIntro,
  audioDurationSec = 0,
  gameplayDurationSec = 22,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const gameplayStart = SCENE.HOOK + SCENE.COMMENT;
  const gameplayFrames = Math.max(1, durationInFrames - gameplayStart - SCENE.CTA);
  const ctaStart = gameplayStart + gameplayFrames;

  // Global fade to black over the final moments.
  const endFade = interpolate(frame, [durationInFrames - 14, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const voice = resolveSrc(voiceoverSrc);
  const gameplay = resolveSrc(gameplaySrc);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05060a" }}>
      <Background />

      {voice ? <Audio src={voice} /> : null}

      <Sequence durationInFrames={SCENE.HOOK} name="Hook">
        <Hook day={day} durationInFrames={SCENE.HOOK} />
      </Sequence>

      <Sequence from={SCENE.HOOK} durationInFrames={SCENE.COMMENT} name="Comment">
        <CommentCard
          promptAuthor={promptAuthor}
          promptText={promptText}
          isIntro={isIntro}
          durationInFrames={SCENE.COMMENT}
        />
      </Sequence>

      <Sequence from={gameplayStart} durationInFrames={gameplayFrames} name="Gameplay">
        <Gameplay
          day={day}
          script={script}
          gameplaySrc={gameplay}
          gameplayDurationSec={gameplayDurationSec}
          audioDurationSec={audioDurationSec}
          sceneStartFrame={gameplayStart}
          durationInFrames={gameplayFrames}
        />
      </Sequence>

      <Sequence from={ctaStart} durationInFrames={SCENE.CTA} name="CTA">
        <CTA durationInFrames={SCENE.CTA} />
      </Sequence>

      <AbsoluteFill style={{ backgroundColor: "#000", opacity: endFade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
