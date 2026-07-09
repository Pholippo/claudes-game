import React from "react";
import { Composition } from "remotion";
import { Daily } from "./Daily.jsx";
import { FPS } from "./theme.js";

const FALLBACK_DURATION = 38 * FPS;
const TAIL_SEC = 4; // silence after the voiceover ends (gameplay outro + CTA)

export const RemotionRoot = () => (
  <Composition
    id="Daily"
    component={Daily}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={FALLBACK_DURATION}
    defaultProps={{
      day: 1,
      promptText: "",
      promptAuthor: "",
      script: "",
      voiceoverSrc: "",
      gameplaySrc: "",
      isIntro: true,
      audioDurationSec: 0,
      gameplayDurationSec: 22,
    }}
    calculateMetadata={({ props }) => {
      const explicit = Number(props.durationInFrames);
      const fromAudio =
        Number(props.audioDurationSec) > 0
          ? Math.round((Number(props.audioDurationSec) + TAIL_SEC) * FPS)
          : 0;
      const durationInFrames =
        Number.isFinite(explicit) && explicit > 0
          ? Math.round(explicit)
          : fromAudio || FALLBACK_DURATION;
      return { durationInFrames, props };
    }}
  />
);
