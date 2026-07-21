// D2G Technology Promo Video - 30-45 second animated ad

import { useEffect, useRef, type ComponentType } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { AnimatePresence } from 'framer-motion';

import { Scene1_Hero } from './video_scenes/Scene1_Hero';
import { Scene2_Problem } from './video_scenes/Scene2_Problem';
import { Scene3_Process } from './video_scenes/Scene3_Process';
import { Scene4_Benefits } from './video_scenes/Scene4_Benefits';
import { Scene5_Pricing } from './video_scenes/Scene5_Pricing';
import { Scene6_CTA } from './video_scenes/Scene6_CTA';
import { Scene7_Outro } from './video_scenes/Scene7_Outro';

export const SCENE_DURATIONS = {
  hero: 3500,      // Logo + hook headline
  problem: 4500,   // The frustration
  process: 5500,   // 3-step process reveal
  benefits: 3500,  // Why D2G
  pricing: 4500,   // Two pricing tiers
  cta: 4500,       // Book free call
  outro: 2500,     // Logo lockup
};

const SCENE_COMPONENTS: Record<string, ComponentType> = {
  hero: Scene1_Hero,
  problem: Scene2_Problem,
  process: Scene3_Process,
  benefits: Scene4_Benefits,
  pricing: Scene5_Pricing,
  cta: Scene6_CTA,
  outro: Scene7_Outro,
};

// Cumulative start offset (seconds) of each scene in the canonical order —
// used to keep the music aligned on loops, jumps, and scene-lock replays.
const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <div
      className="w-full h-screen overflow-hidden relative noise-texture"
      style={{ backgroundColor: 'var(--color-bg-dark)' }}
    >
      {/* Use mode="popLayout" for smooth scene transitions */}
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </div>
  );
}
