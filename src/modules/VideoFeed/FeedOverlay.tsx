import React, { useEffect, useState } from 'react';
import { FeedData } from './feedLoreData';

interface FeedOverlayProps {
  feed: FeedData;
  energySpike?: number;
  currentTick: number;
  glitchTriggerCount: number;
}

export function FeedOverlay({ feed, energySpike, currentTick, glitchTriggerCount }: FeedOverlayProps) {
  const [localGlitch, setLocalGlitch] = useState(false);

  // Trigger brief glitch animation when glitchTriggerCount increments
  useEffect(() => {
    if (glitchTriggerCount > 0) {
      setLocalGlitch(true);
      const t = setTimeout(() => {
        setLocalGlitch(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [glitchTriggerCount]);

  const valueLabel = feed.id === 'CERN' && energySpike 
    ? `${energySpike.toFixed(2)} TeV` 
    : feed.metricValue;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between overflow-hidden">
      {/* 1. Subtle Radial Vignette Gradient & Amber Ambient Grade Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,3,4,0.6)_100%)] mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 bg-[#ff6f00]/[0.05] mix-blend-screen pointer-events-none" />

      {/* 2. Repeating Scan Lines Overlay (Clipped purely on the video) */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />

      {/* 3. Signal Noise / Extreme Glitch Effect Cover Layer */}
      {localGlitch && (
        <div className="absolute inset-0 w-full h-full bg-cover z-20 opacity-25 select-none"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0%200%20100%20100'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter%20id='noise'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.8'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23noise)'/%3E%3C/svg%3E")`,
               filter: 'contrast(300%) brightness(150%)'
             }}
        />
      )}

      {/* 4. Top Row: LIVE indicator and Signal frequency */}
      <div className="p-3.5 flex justify-between items-start z-10">
        <div className="flex items-center gap-2 bg-[#030304]/80 px-2 py-0.5 rounded border border-[#ff6f00]/30 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-[8px] font-mono font-black text-rose-500 tracking-wider">LIVE</span>
        </div>
        <div className="text-[7.5px] font-mono text-stone-400 bg-[#030304]/85 px-2 py-0.5 rounded border border-[#1e2535]">
          SIG_FREQ: <span className="text-[#00D4FF] font-semibold">443.08 MHz</span>
        </div>
      </div>

      {/* 5. Four Corner Brackets (surveillance reticle styling) */}
      <svg className="absolute inset-0 w-full h-full text-[#ff6f00]/65 stroke-current" fill="none">
        {/* Top Left */}
        <path d="M 12 24 L 12 12 L 24 12" strokeWidth="1.5" />
        {/* Top Right */}
        <path d="M calc(100% - 12) 24 L calc(100% - 12) 12 L calc(100% - 24) 12" strokeWidth="1.5" />
        {/* Bottom Left */}
        <path d="M 12 calc(100% - 24) L 12 calc(100% - 12) L 24 calc(100% - 12)" strokeWidth="1.5" />
        {/* Bottom Right */}
        <path d="M calc(100% - 12) calc(100% - 24) L calc(100% - 12) calc(100% - 12) L calc(100% - 24) calc(100% - 12)" strokeWidth="1.5" />
      </svg>

      {/* 6. Dynamic Semi-Transparent Amber Telemetry Bar at Bottom */}
      <div className="p-3.5 z-10 flex w-full">
        <div className="w-full bg-[#030304]/85 border-l-2 border-[#ff6f00] px-3 py-1 flex items-center justify-between text-[8px] font-mono tracking-wide text-[#ffb300]">
          <div>FEEDID_01 // {feed.source}</div>
          <div className="hidden sm:block opacity-65">// METRIC: {valueLabel}</div>
          <div>// TICK: {String(currentTick).padStart(5, '0')}</div>
          <div className="opacity-80">// CLARITY: {feed.clarity}</div>
        </div>
      </div>
    </div>
  );
}
