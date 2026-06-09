import React from 'react';
import { VIDEO_SOURCES } from '../config/videoSources';

interface YouTubeBackgroundProps {
  currentAct: 'ACT_I' | 'ACT_II' | 'ACT_III' | 'ACT_IV' | 'DONE';
}

export function YouTubeBackground({ currentAct }: YouTubeBackgroundProps) {
  // Determine video ID based on current Act
  let videoId: string | undefined = undefined;

  if (currentAct === 'ACT_I' || currentAct === 'ACT_II') {
    videoId = VIDEO_SOURCES.intro_act1_cern;
  } else if (currentAct === 'ACT_III' || currentAct === 'ACT_IV') {
    // Prefer Bloomberg, fallback to Palantir configuration
    videoId = VIDEO_SOURCES.intro_act3_bloomberg !== 'YOUTUBE_VIDEO_ID_HERE'
      ? VIDEO_SOURCES.intro_act3_bloomberg
      : VIDEO_SOURCES.intro_act3_palantir;
  }

  // Verify YouTube code presence
  const isAvailable = videoId && videoId !== 'YOUTUBE_VIDEO_ID_HERE' && videoId.trim() !== '';

  // Determine background layer opacities
  let opacityClass = 'opacity-0';
  if (isAvailable) {
    if (currentAct === 'ACT_I') opacityClass = 'opacity-35 transition-opacity duration-[3000ms]';
    else if (currentAct === 'ACT_II') opacityClass = 'opacity-35';
    else if (currentAct === 'ACT_III') opacityClass = 'opacity-40 transition-opacity duration-1000';
    else if (currentAct === 'ACT_IV') opacityClass = 'opacity-65 transition-opacity duration-[2000ms]';
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden pointer-events-none select-none z-1">
      {isAvailable ? (
        <iframe
          className={`absolute inset-0 w-full h-full scale-[1.12] object-cover pointer-events-none ${opacityClass}`}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=${videoId}`}
          allow="autoplay; encrypted-media"
          style={{ border: 'none', pointerEvents: 'none' }}
        />
      ) : (
        /* Standalone black atmospheric mode */
        <div className="absolute inset-0 bg-black" />
      )}
    </div>
  );
}
