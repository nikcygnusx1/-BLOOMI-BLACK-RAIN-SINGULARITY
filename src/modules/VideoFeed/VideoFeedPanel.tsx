import React, { useState } from 'react';
import { FEED_LORE_DATA, FeedData } from './feedLoreData';
import { useGameEventSync } from './useGameEventSync';
import { YouTubeEmbed } from './YouTubeEmbed';
import { FeedMetadata } from './FeedMetadata';
import { FeedSelector } from './FeedSelector';
import { SimState } from '../../types';

interface VideoFeedPanelProps {
  state: SimState | null;
  playSyntheticSound: (type: any) => void;
  isAmbient?: boolean;
}

export function VideoFeedPanel({ state, playSyntheticSound, isAmbient = false }: VideoFeedPanelProps) {
  const [activeFeedId, setActiveFeedId] = useState<FeedData['id']>('CERN');

  // Trigger game events monitoring and sync
  const {
    glitchTrigger,
    colorGrade,
    borderPulse,
    energySpike,
    currentEventText
  } = useGameEventSync({
    state,
    onFeedSwitch: (feedId) => setActiveFeedId(feedId)
  });

  const activeFeed = FEED_LORE_DATA[activeFeedId];

  // Apply subtle border styling on high intensity events
  const getBorderPulseClass = () => {
    if (borderPulse === 'red') return 'border-rose-600 animate-pulse';
    if (borderPulse === 'amber') return 'border-[#ff6f00] animate-pulse';
    return 'border-[#1e2535]';
  };

  return (
    <div 
      className={`h-full flex flex-col bg-[#05070a] border rounded-terminal overflow-hidden font-mono transition-opacity duration-300 ${getBorderPulseClass()} ${
        isAmbient ? 'opacity-65 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* 1. TOP HEADER STATUS ROW */}
      <div className="h-8 bg-[#0b0c10] border-b border-[#1e2535] px-3 flex items-center justify-between select-none shrink-0 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold tracking-wider uppercase">VIDEO_FEED</span>
          <span className="text-[#10151c] text-[8px] font-bold select-none">//</span>
          <span className="text-[#00c2ff]/90 font-bold tracking-tight uppercase">SOVEREIGN INTELLIGENCE BROADCAST</span>
          <span className="text-[#10151c] text-[8px] font-bold select-none">//</span>
          <span className="text-rose-500 font-extrabold flex items-center gap-1">
            LIVE <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </span>
        </div>
        
        {/* State Indicators */}
        <div className="flex items-center gap-2 text-[8.5px] font-semibold text-stone-500">
          <span className="text-emerald-500">[ACTIVE]</span>
          <span className="text-[#00c2ff]">[ARMED]</span>
          <span className="text-rose-500">[MUTED]</span>
        </div>
      </div>

      {/* Secondary Subheading */}
      <div className="h-6 bg-[#080a0e] border-b border-[#1e2535] px-3 flex items-center shrink-0 text-[8.5px] text-stone-400 select-none font-terminal">
        <span>FEED: {activeFeed.name}</span>
        <span className="mx-2 text-stone-800">|</span>
        <span>ENERGY MATRIX COUPLING: ON</span>
        <span className="mx-2 text-stone-800">|</span>
        <span>CLEARANCE LEVEL_5</span>
      </div>

      {/* 2. CORE VIEWPORT INTEGRATION (SPLIT WINDOW) */}
      <div className="flex-1 flex overflow-hidden bg-[#030304]">
        {/* Dynamic Video Streaming frame */}
        <div className="flex-1 p-2 flex flex-col relative">
          <YouTubeEmbed
            feed={activeFeed}
            energySpike={energySpike}
            currentTick={state?.currentTick || 1}
            glitchTriggerCount={glitchTrigger}
            colorGrade={colorGrade}
          />
        </div>

        {/* Technical metadata statistics panel */}
        <FeedMetadata
          feed={activeFeed}
          energySpike={energySpike}
          currentEventText={currentEventText}
        />
      </div>

      {/* 3. CHANNEL SELECTION DESK BAR */}
      <FeedSelector
        activeFeedId={activeFeedId}
        onSelectFeed={(id) => setActiveFeedId(id)}
        playSyntheticSound={playSyntheticSound}
      />
    </div>
  );
}
