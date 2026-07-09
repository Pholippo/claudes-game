import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Loop,
  OffthreadVideo,
  Sequence,
  staticFile,
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
  musicSrc,
  isIntro,
  audioDurationSec = 0,
  gameplayDurationSec = 22,
}) => {
  const { durationInFrames, fps } = useVideoConfig();

  const gameplayStart = SCENE.HOOK + SCENE.COMMENT;
  const gameplayFrames = Math.max(1, durationInFrames - gameplayStart - SCENE.CTA);
  const ctaStart = gameplayStart + gameplayFrames;

  const voice = resolveSrc(voiceoverSrc);
  const gameplay = resolveSrc(gameplaySrc);
  const music = resolveSrc(musicSrc);
  const backdropLoop = Math.max(1, Math.floor((gameplayDurationSec || 22) * fps));

  return (
    <AbsoluteFill style={{ backgroundColor: "#05060a" }}>
      <Background />

      {/* Blurred gameplay backdrop for the whole video — the first visible frame
          already has motion (hook text never sits on a dead background), and the
          gameplay scene gets the standard "video echo" look behind its panel. */}
      {gameplay ? (
        <AbsoluteFill style={{ opacity: 0.35 }}>
          <Loop durationInFrames={backdropLoop}>
            <OffthreadVideo
              src={gameplay}
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "blur(3px) brightness(0.65)",
              }}
            />
          </Loop>
        </AbsoluteFill>
      ) : null}

      {voice ? <Audio src={voice} /> : null}
      {music ? (
        // Music bed, ducked under the voiceover, fading in/out at the edges.
        <Audio
          src={music}
          volume={(f) =>
            interpolate(
              f,
              [0, 18, durationInFrames - 34, durationInFrames - 4],
              [0, 0.22, 0.22, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          }
        />
      ) : null}

      <Sequence durationInFrames={SCENE.HOOK} name="Hook">
        <Hook day={day} isIntro={isIntro} durationInFrames={SCENE.HOOK} />
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
    </AbsoluteFill>
  );
};
