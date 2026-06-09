import React from 'react';
import { FeedData } from './feedLoreData';

interface FeedMetadataProps {
  feed: FeedData;
  energySpike?: number;
  currentEventText: string;
}

export function FeedMetadata({ feed, energySpike, currentEventText }: FeedMetadataProps) {
  return (
    <div className="w-[180px] shrink-0 border-l border-[#1e2535] bg-[#0c1015] p-3 flex flex-col justify-between font-mono text-[10px] text-gray-400 select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Source Identification */}
        <div>
          <span className="text-[9px] text-[#00c2ff] font-bold block mb-1">CLASSIFIED FEED SOURCE:</span>
          <div className="bg-[#141a22] border border-[#1e2535] p-1.5 rounded text-[9.5px] text-[#ffb300] font-black break-all">
            {feed.source}
          </div>
        </div>

        {/* Real-time Status */}
        <div className="space-y-1">
          <span className="text-[8.5px] text-stone-500 font-bold block">SIGNAL STATUS:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-bold">{feed.status}</span>
          </div>
        </div>

        {/* Feed Dynamic Metrics */}
        <div className="space-y-2 border-t border-[#1e2535]/50 pt-2.5">
          <div className="flex justify-between">
            <span className="text-stone-500">{feed.metricLabel}</span>
            <span className="text-white font-bold">
              {feed.id === 'CERN' && energySpike ? `${energySpike.toFixed(2)} TeV` : feed.metricValue}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">CLARITY MATRIX:</span>
            <span className="text-[#00ff88] font-bold">{feed.clarity}</span>
          </div>
        </div>

        {/* Detailed Spec Bullet Points */}
        <div className="space-y-1.5 border-t border-[#1e2535]/50 pt-2.5">
          <span className="text-[8.5px] text-stone-500 font-bold block">INTERNAL DEVIATIONS:</span>
          <div className="space-y-1">
            {feed.description.map((desc, i) => (
              <div key={i} className="text-[9px] leading-tight text-stone-400 border-l border-[#ff6f00]/40 pl-1.5">
                {desc}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Active Telemetry Output at Bottom */}
      <div className="border-t border-[#1e2535] pt-3 mt-4">
        <span className="text-[8px] text-[#ff6f00] font-bold tracking-widest block mb-1">TELEMETRY DECODER:</span>
        <div className="text-[8.5px] leading-normal text-stone-500 bg-[#07090c] p-1.5 border border-[#1e2535] rounded font-terminal overflow-hidden text-ellipsis">
          {currentEventText}
        </div>
      </div>
    </div>
  );
}
