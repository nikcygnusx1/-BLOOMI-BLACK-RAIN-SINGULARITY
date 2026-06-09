/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { SimState, DynastyMember } from '../types';

interface DynastyTreeProps {
  state: SimState;
  onSomaticEdits: () => void;
  onHeirSpawn: (name: string, role: DynastyMember['role']) => void;
  onModifyState: (fn: (prev: SimState) => SimState) => void;
  onLogTerminal: (msg: string, isError?: boolean) => void;
  playSyntheticSound: (type: 'tick' | 'order' | 'profit' | 'warning' | 'liquidation' | 'click' | 'alert' | 'success') => void;
}

export const DynastyTree: React.FC<DynastyTreeProps> = ({
  state,
  onSomaticEdits,
  onHeirSpawn,
  onModifyState,
  onLogTerminal,
  playSyntheticSound
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });
  const [heirName, setHeirName] = useState('Alexander Sharma');
  const [heirRole, setHeirRole] = useState<DynastyMember['role']>('Heir');
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);

  // Rotation angle for DNA animator
  const helixAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(220, height - 140) });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // HTML5 Double Helix Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || dimensions.width;
    const height = rect.height || dimensions.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const renderLoop = () => {
      // Dark futuristic matrix gradient background
      ctx.fillStyle = '#06070a';
      ctx.fillRect(0, 0, width, height);

      // Fine tech grid background
      ctx.strokeStyle = 'rgba(255, 176, 0, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // 1. DRAW ANIMATED FLOATING DNA HELIX BACKGROUND
      helixAngleRef.current += 0.025;
      const angle = helixAngleRef.current;
      const midY = height / 2;

      ctx.lineWidth = 1;
      for (let x = 20; x < width - 20; x += 16) {
        // Double sine waves corresponding to DNA strands
        const relativeOffset = x * 0.012;
        const sineY1 = midY + Math.sin(angle + relativeOffset) * 45;
        const sineY2 = midY - Math.sin(angle + relativeOffset) * 45;

        // Draw connections (Base pair bridges)
        ctx.strokeStyle = 'rgba(255, 176, 0, 0.12)';
        ctx.beginPath();
        ctx.moveTo(x, sineY1);
        ctx.lineTo(x, sineY2);
        ctx.stroke();

        // Draw node beads
        ctx.fillStyle = 'rgba(255, 176, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(x, sineY1, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 194, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x, sineY2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. RENDER DYNASTY NODES ON CANVAS
      const members = state.dynasty?.members || [];
      if (members.length > 0) {
        const nodeSpacing = width / (members.length + 1);
        const nodeY = height / 2;

        // Connective family lines
        ctx.strokeStyle = 'rgba(2ff, 176, 0, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        members.forEach((m, idx) => {
          const nodeX = nodeSpacing * (idx + 1);
          if (idx === 0) {
            ctx.moveTo(nodeX, nodeY);
          } else {
            ctx.lineTo(nodeX, nodeY);
          }
        });
        ctx.stroke();

        // Draw each member node card
        members.forEach((m, idx) => {
          const nodeX = nodeSpacing * (idx + 1);
          const isSelected = selectedMemberName === m.name;

          // Draw neon glowing shadows on selection or active heads
          if (isSelected || m.role === 'Head of Dynasty') {
            ctx.shadowColor = '#FFB000';
            ctx.shadowBlur = 12;
          } else {
            ctx.shadowBlur = 0;
          }

          // Node body
          ctx.fillStyle = m.status === 'Alive' ? '#0a0d14' : '#1a0505';
          ctx.strokeStyle = isSelected ? '#ffb300' : (m.role === 'Head of Dynasty' ? '#e29500' : 'rgba(255, 176, 0, 0.25)');
          ctx.lineWidth = isSelected ? 2.0 : 1.0;

          const boxW = 125;
          const boxH = 55;
          ctx.fillRect(nodeX - boxW / 2, nodeY - boxH / 2, boxW, boxH);
          ctx.strokeRect(nodeX - boxW / 2, nodeY - boxH / 2, boxW, boxH);

          // Clear shadows for text rendering
          ctx.shadowBlur = 0;

          // Status indicator dot
          ctx.fillStyle = m.status === 'Alive' ? '#00ff88' : '#ff3b5c';
          ctx.beginPath();
          ctx.arc(nodeX - boxW / 2 + 8, nodeY - boxH / 2 + 8, 3, 0, Math.PI * 2);
          ctx.fill();

          // Texts
          ctx.fillStyle = m.status === 'Alive' ? '#ffffff' : '#994444';
          ctx.font = 'bold 9px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(m.name.toUpperCase(), nodeX, nodeY - 11);

          ctx.fillStyle = '#ffaa00';
          ctx.font = '8px "IBM Plex Mono", monospace';
          ctx.fillText(`${m.role.toUpperCase()} (AGE:${m.age})`, nodeX, nodeY + 4);

          ctx.fillStyle = m.sociopathyIndex > 70 ? '#ff405f' : '#00ffd0';
          ctx.fillText(`SOCIOPATHY: ${m.sociopathyIndex}%`, nodeX, nodeY + 16);
        });
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, state, selectedMemberName]);

  // Click on member nodes detection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const members = state.dynasty?.members || [];
    const nodeSpacing = dimensions.width / (members.length + 1);
    const nodeY = dimensions.height / 2;

    const boxW = 125;
    const boxH = 55;

    let clickedAny = false;
    members.forEach((m, idx) => {
      const nodeX = nodeSpacing * (idx + 1);
      const minX = nodeX - boxW / 2;
      const maxX = nodeX + boxW / 2;
      const minY = nodeY - boxH / 2;
      const maxY = nodeY + boxH / 2;

      // Check hit box coordinates
      if (clickX >= minX && clickX <= maxX && clickY >= minY && clickY <= maxY) {
        setSelectedMemberName(m.name);
        clickedAny = true;
        playSyntheticSound('click');
        onLogTerminal(`DYNAST SELECTED: Accessing neurological logs of ${m.name} (${m.role}).`);
      }
    });

    if (!clickedAny) {
      setSelectedMemberName(null);
    }
  };

  // ADVANCED DYNASTIC OPERATIONS TRIGGERS
  const executeAssassination = () => {
    if (state.player.cash < 800000000000) {
      onLogTerminal('REJECTED: Insufficient family asset funds ($800.0B required) for rival takeover assassinations.', true);
      playSyntheticSound('warning');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      next.player.cash -= 800000000000;
      // Synthesize some physical raw material liquidity or biomass from competitors
      next.biomass = (next.biomass || 0) + 400;
      onLogTerminal('CLANDESTINE ASSASSINATION COMPLETED: Liquidated key board directors of competitor raw material holdings. Yielded +400 Biomass.');
      playSyntheticSound('alert');
      return next;
    });
  };

  const executeSupremeCourtBribe = () => {
    if (state.player.cash < 1200000000000) {
      onLogTerminal('REJECTED: Insufficient family asset funds ($1.2T required) to compromise legal frameworks.', true);
      playSyntheticSound('warning');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      next.player.cash -= 1200000000000;
      next.neuralFirewallPower = Math.min(100, (next.neuralFirewallPower || 50) + 15);
      onLogTerminal('SOVEREIGN BRIEFING SECURED: Supreme Court lobbying bypass confirmed. Gained +15% Neural Firewall buffering power.');
      playSyntheticSound('success');
      return next;
    });
  };

  const executeSociopathInoculation = () => {
    if (state.player.cash < 1500000000000) {
      onLogTerminal('REJECTED: Insufficient funds ($1.5T required) for DNA sociopathic inoculation.', true);
      playSyntheticSound('warning');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      next.player.cash -= 1500000000000;
      // Boost sociopathy levels of all alive members
      if (next.dynasty?.members) {
        next.dynasty.members = next.dynasty.members.map(m => {
          if (m.status === 'Alive') {
            return { ...m, sociopathyIndex: Math.min(100, m.sociopathyIndex + 18) };
          }
          return m;
        });
      }
      onLogTerminal('GENOME DRILL SUCCESSFUL: Inoculated empathy bypass serum across active dynasts blood cells. +18% Sociopathy Index across heirs.');
      playSyntheticSound('profit');
      return next;
    });
  };

  const activeHead = state.dynasty?.members.find(m => m.role === 'Head of Dynasty' && m.status === 'Alive');

  return (
    <div className="flex flex-col h-full overflow-hidden select-none font-mono text-[#FFB000] bg-[#07090d]" ref={containerRef}>
      
      {/* Dynamic Header */}
      <div className="flex justify-between items-center bg-[#10141d] border border-[#1e2535] p-2 rounded-terminal mb-1 shrink-0 font-terminal">
        <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider animate-pulse">// RECONSTRUCTING COGNITIVE REINDEER BLOOD LINEAGE</span>
        <span className="text-[9px] text-[#00c2ff]">SECULAR SUCCESSION DESK</span>
      </div>

      {/* Interactive visual canvas */}
      <div className="flex-1 relative overflow-hidden bg-black border border-[#FFB000]/30 rounded-terminal my-1">
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="absolute inset-0 block w-full h-full cursor-pointer" 
        />
        <div className="absolute top-2 right-2 text-[8px] bg-[#0f1318]/95 px-1.5 py-0.5 rounded border border-[#1e2535] text-slate-400 capitalize hover:text-white pointer-events-none">
          Click nodes to analyze cognitive neural levels
        </div>
      </div>

      {/* CORE CONTROL ACTION DECORS */}
      <div className="bg-black border border-[#FFB000]/30 p-3 rounded-terminal grid grid-cols-1 md:grid-cols-2 gap-3 select-none text-[11px] shrink-0 font-terminal mt-1">
        
        {/* Genetics Succession form */}
        <div className="flex flex-col gap-1.5 pr-3 border-r border-[#ffb300]/20 justify-between">
          <div>
            <h4 className="text-[#FFB000] font-bold uppercase text-[9.5px] tracking-tight border-b border-[#ffb300]/25 pb-0.5 mb-1.5">
              // SPONSOR COGNITIVE CLONING CORES
            </h4>
            <div className="flex gap-1.5 items-center mb-1.5">
              <input 
                type="text" 
                value={heirName} 
                onChange={e => setHeirName(e.target.value)}
                className="bg-black border border-[#FFB000]/30 px-2 py-1 outline-none text-white font-bold flex-1 focus:border-[#ffb300] rounded text-[10px]"
                placeholder="Successor Call-name"
              />
              <select 
                value={heirRole} 
                onChange={e => setHeirRole(e.target.value as DynastyMember['role'])}
                className="bg-black border border-[#FFB000]/30 px-1 py-1 outline-none text-[#FFB000] rounded text-[9.5px]"
              >
                <option value="Heir">MAIN HEIR</option>
                <option value="Operative">SHADOW OPERATIVE</option>
                <option value="Lobbyist_Chief">LOBBY CHIEF</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              onHeirSpawn(heirName, heirRole);
              playSyntheticSound('success');
            }}
            className="bg-[#ffb300]/10 hover:bg-[#ffb300]/20 border border-[#ffb300]/60 text-[#FFB000] font-black py-1.5 px-4 cursor-pointer text-center rounded uppercase tracking-wider text-[9.5px]"
          >
            SPAWN DIRECT GENOME SUCCESSOR
          </button>
        </div>

        {/* Somatic therapies and Bribing desk */}
        <div className="flex flex-col justify-between font-terminal">
          <div>
            <h4 className="text-[#FFB000] font-bold uppercase text-[9.5px] tracking-tight border-b border-[#ffb300]/25 pb-0.5 mb-1.5">
              // CONSPIRACY OPERATIONS PANEL
            </h4>
            
            <div className="grid grid-cols-3 gap-1 mb-1.5 text-center">
              <button
                onClick={executeAssassination}
                className="p-1 border border-red-700 hover:bg-red-950/20 text-red-400 rounded text-[8.5px] font-black cursor-pointer uppercase transition-colors"
              >
                ASSASSINATE RIVALS <span className="block text-[6.5px] font-medium opacity-65">$800B</span>
              </button>

              <button
                onClick={executeSupremeCourtBribe}
                className="p-1 border border-[#00c2ff]/40 hover:bg-cyan-950/20 text-[#00c2ff] rounded text-[8.5px] font-black cursor-pointer uppercase transition-colors"
              >
                BRIBE COURT STRIKE <span className="block text-[6.5px] font-medium opacity-65">$1.2T</span>
              </button>

              <button
                onClick={executeSociopathInoculation}
                className="p-1 border border-[#ffb300]/40 hover:bg-[#ffb300]/10 text-[#ffb300] rounded text-[8.5px] font-black cursor-pointer uppercase transition-colors"
              >
                SPLICE EMATH_BY <span className="block text-[6.5px] font-medium opacity-65">$1.5T</span>
              </button>
            </div>
          </div>

          <button
            onClick={onSomaticEdits}
            disabled={state.player.cash < 5000000000000}
            className={`w-full font-black py-1.5 rounded uppercase text-center cursor-pointer select-none border text-[9.5px] ${
              state.player.cash >= 5000000000000
                ? 'bg-[#FFB000] text-black border-[#FFB000] hover:bg-amber-600' 
                : 'bg-black text-white/20 border-white/10 cursor-not-allowed'
            }`}
          >
            {state.player.cash >= 5000000000000 
              ? 'DEPLOY SOMATIC INTERVENTION INJECTIONS' 
              : 'INSUFFICIENT CAPITAL (SOMATIC REQUIRES $5.0T)'}
          </button>
        </div>

      </div>
    </div>
  );
};
