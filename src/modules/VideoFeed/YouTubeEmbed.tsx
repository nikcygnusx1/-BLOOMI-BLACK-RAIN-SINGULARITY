import React from 'react';
import { VIDEO_SOURCES } from '../../config/videoSources';
import { FeedData } from './feedLoreData';
import { FeedOverlay } from './FeedOverlay';

// Define which feed maps to which config key
const FEED_CONFIG_MAP: Record<FeedData['id'], keyof typeof VIDEO_SOURCES | undefined> = {
  CERN: 'panel_feed_1',
  MRKTS: 'panel_feed_2',
  INTEL: 'panel_feed_3',
  DARK: undefined // Falls back to offline by default
};

interface YouTubeEmbedProps {
  feed: FeedData;
  energySpike: number;
  currentTick: number;
  glitchTriggerCount: number;
  colorGrade: 'normal' | 'warm' | 'cold';
}

export function YouTubeEmbed({ feed, energySpike, currentTick, glitchTriggerCount, colorGrade }: YouTubeEmbedProps) {
  const configKey = FEED_CONFIG_MAP[feed.id];
  const videoId = configKey ? VIDEO_SOURCES[configKey] : 'YOUTUBE_VIDEO_ID_HERE';

  const isConfigured = videoId && videoId !== 'YOUTUBE_VIDEO_ID_HERE' && videoId.trim() !== '';

  // Return a class name according to colorGrade state
  const getColorGradeClass = () => {
    if (colorGrade === 'warm') return 'transition-all duration-800 border-[#FF3B5C]/30 bg-[#160a0a]';
    if (colorGrade === 'cold') return 'transition-all duration-800 border-[#00c2ff]/30 bg-[#06111a]';
    return 'transition-all duration-800 border-[#1e2535] bg-[#0c1015]';
  };

  return (
    <div className={`flex-1 relative flex flex-col items-center justify-center border rounded-terminal overflow-hidden min-h-[280px] ${getColorGradeClass()}`}>
      {isConfigured ? (
        <>
          {/* Chromeless muted loop autoplay YouTube Embed */}
          <iframe
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-85"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=${videoId}`}
            title="Sovereign Broadcast Feed"
            allow="autoplay; encrypted-media"
            style={{ border: 'none', pointerEvents: 'none' }}
          />
          {/* Signal active overlay layers */}
          <FeedOverlay
            feed={feed}
            energySpike={energySpike}
            currentTick={currentTick}
            glitchTriggerCount={glitchTriggerCount}
          />
        </>
      ) : (
        /* Native classified "SIGNAL OFFLINE" state */
        <div className="absolute inset-0 bg-[#030304] flex flex-col items-center justify-center p-6 text-center select-none font-mono">
          {/* Outer offline containment border box */}
          <div className="max-w-[420px] p-6 border border-[#ff6f00]/40 rounded-terminal bg-[#07090c]/90 space-y-4">
            <div className="text-[14px] font-black text-[#ff6f00] tracking-widest animate-pulse">
              [ NO CARRIER ]
            </div>
            <div className="space-y-1.5">
              <div className="text-[9.5px] font-bold text-white uppercase tracking-wider">
                FEED_ID: {feed.name}
              </div>
              <div className="text-[9px] text-stone-500 leading-normal">
                THE BROADCAST TARGET IS NOT CURRENTLY ARMED.<br />
                CONFIGURE THE CONFIG ENTRY <code className="text-[#00D4FF] block mt-1">/src/config/videoSources.ts</code> TO ACTIVATE THIS STREAM.
              </div>
            </div>
            {/* Embedded retro aesthetic diagnostic lines */}
            <div className="text-[7.5px] text-stone-600 border-t border-[#1e2535] pt-2.5 flex justify-between font-terminal uppercase">
              <span>STATUS: SUSPENDED</span>
              <span>CLEARANCE: LEVEL_4</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
