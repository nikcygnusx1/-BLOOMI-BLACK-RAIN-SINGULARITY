import React from 'react';
import { FEED_LORE_DATA, FeedData } from './feedLoreData';

interface FeedSelectorProps {
  activeFeedId: FeedData['id'];
  onSelectFeed: (id: FeedData['id']) => void;
  playSyntheticSound: (type: any) => void;
}

export function FeedSelector({ activeFeedId, onSelectFeed, playSyntheticSound }: FeedSelectorProps) {
  const feeds: { id: FeedData['id']; label: string; tooltip: string }[] = [
    { id: 'CERN', label: 'CERN', tooltip: 'Hadron Collider & Resonance' },
    { id: 'MRKTS', label: 'MRKTS', tooltip: 'Sovereign Swaps & Sourced Capital' },
    { id: 'INTEL', label: 'INTEL', tooltip: 'Palantir Security Graph Intel' },
    { id: 'DARK', label: 'DARK', tooltip: 'Meteorological Atmospheric Satellites' },
  ];

  return (
    <div className="h-9 bg-[#0b0c0f] border-t border-[#1e2535] px-3 flex items-center gap-1.5 select-none shrink-0 font-mono text-[9px]">
      <span className="text-stone-500 font-bold uppercase tracking-wider mr-2">SOVEREIGN ROUTING STREAMS:</span>
      <div className="flex gap-2">
        {feeds.map((feed) => {
          const isActive = activeFeedId === feed.id;
          return (
            <button
              key={feed.id}
              onClick={() => {
                onSelectFeed(feed.id);
                playSyntheticSound('tick');
              }}
              title={feed.tooltip}
              className={`h-5.5 px-2.5 rounded border text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#FF6F00] text-black border-white shadow-[0_0_8px_rgba(255,111,0,0.45)]'
                  : 'bg-[#141920] border-[#1e2535] text-slate-400 hover:text-slate-100 hover:bg-[#1f2732]'
              }`}
            >
              <span>[{feed.label} ▸]</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
