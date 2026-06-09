/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { SimState, LabStructure } from '../types';
import { Hammer, Zap, Droplet, Plus, Heart, ShieldAlert, ArrowUpCircle, Trash2 } from 'lucide-react';

interface LabMapViewProps {
  state: SimState;
  onModifyState: (modifier: (prev: SimState) => SimState) => void;
  onLogTerminal: (msg: string, isErr?: boolean) => void;
  playSyntheticSound: (type: 'tick' | 'order' | 'click' | 'alert' | 'success') => void;
}

const GRID_COLS = 8;
const GRID_ROWS = 6;

const BUILDING_TEMPLATES = {
  CROP_POD: { name: 'Crop Bio-Pod', cost: 15000000, biomassCost: 50, power: 15, water: 25, desc: 'Yields biomass & passive food contract income ($1.8M/tick).' },
  SERVER_RACK: { name: 'Quantum Server Rack', cost: 30000000, biomassCost: 0, power: 25, water: 5, desc: 'Algos arbitrage trading giving passive income ($2.5M/tick).' },
  CARBON_CAPTURE: { name: 'Carbon Filter Matrix', cost: 20000000, biomassCost: 10, power: 20, water: 0, desc: 'Filters carbon, gives passive carbon credits ($1.5M/tick) & lowers Heat.' },
  GENE_CHAMBER: { name: 'Gene Splicing Vault', cost: 25000000, biomassCost: 120, power: 15, water: 15, desc: 'Generates passive research points & rare biomass materials.' },
  DRONE_BAY: { name: 'Drone Repair Depot', cost: 35000000, biomassCost: 80, power: 18, water: 5, desc: 'Autonomously heals damaged laboratory structures around sectors.' },
  WEATHER_RADAR: { name: 'Radar Canopy Tower', cost: 18000000, biomassCost: 15, power: 10, water: 0, desc: 'Dampens climate event vector risks globally.' },
  BIO_REACTOR: { name: 'Anaerobic Bio-Reactor', cost: 45000000, biomassCost: 100, power: -40, water: 10, desc: 'Heavy organic reactor. Generates +40MW net power feed.' },
  COMMAND_ROOM: { name: 'Syndicate Command Center', cost: 40000000, biomassCost: 50, power: 10, water: 2, desc: 'Reduces agency regulatory oversight and raises faction reputation.' }
};

export const LabMapView: React.FC<LabMapViewProps> = ({
  state,
  onModifyState,
  onLogTerminal,
  playSyntheticSound
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedX, setSelectedX] = useState<number | null>(4);
  const [selectedY, setSelectedY] = useState<number | null>(3);
  const [buildType, setBuildType] = useState<keyof typeof BUILDING_TEMPLATES | ''>('');
  
  // Animation state references
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Handle cell click on the canvas matrix
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Convert pixel to grid index
    const tileW = canvas.width / GRID_COLS;
    const tileH = canvas.height / GRID_ROWS;
    const gX = Math.floor(clickX / tileW);
    const gY = Math.floor(clickY / tileH);

    if (gX >= 0 && gX < GRID_COLS && gY >= 0 && gY < GRID_ROWS) {
      setSelectedX(gX);
      setSelectedY(gY);
      setBuildType('');
      playSyntheticSound('tick');
    }
  };

  // Find structure at selected tile coordinates
  const selectedStructure = state.labStructures?.find(
    s => s.x === selectedX && s.y === selectedY
  );

  // Trigger repair command
  const handleRepair = () => {
    if (!selectedStructure) return;
    const cost = Math.floor((100 - selectedStructure.health) * 150000); // repair cost calculation
    if (state.player.cash < cost) {
      onLogTerminal('REJECTED: Insufficient cash reserves to trigger structural repairs.', true);
      playSyntheticSound('alert');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      next.player.cash -= cost;
      const target = next.labStructures.find(s => s.id === selectedStructure.id);
      if (target) {
        target.health = 100;
        onLogTerminal(`STRUCTURE REPAIRED: Fully restored structural integrity of ${selectedStructure.type} at Sector [${selectedStructure.x}, ${selectedStructure.y}]. Debited $${cost.toLocaleString()} cash.`);
        playSyntheticSound('success');
      }
      return next;
    });
  };

  // Trigger Upgrade command
  const handleUpgrade = () => {
    if (!selectedStructure) return;
    if (selectedStructure.level >= 3) {
      onLogTerminal('REJECTED: Selected room structure is already at peak level apex clearance (Level 3).', true);
      playSyntheticSound('alert');
      return;
    }
    const cashCost = selectedStructure.level * 20000000;
    const bioCost = selectedStructure.level * 150;

    if (state.player.cash < cashCost) {
      onLogTerminal('REJECTED: Insufficient liquid cash to process sector somatic upgrade.', true);
      playSyntheticSound('alert');
      return;
    }
    if (state.biomass < bioCost) {
      onLogTerminal('REJECTED: Insufficient raw somatic biomass materials to engineer room upgrade.', true);
      playSyntheticSound('alert');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      next.player.cash -= cashCost;
      next.biomass -= bioCost;
      const target = next.labStructures.find(s => s.id === selectedStructure.id);
      if (target) {
        target.level += 1;
        target.health = 100; // auto-restores to pristine health
        onLogTerminal(`SECTOR UPGRADED: Elevated ${selectedStructure.type} to level [${target.level}]. Power yields and efficiencies boosted.`);
        playSyntheticSound('success');
      }
      return next;
    });
  };

  // Trigger demolish / scrap item
  const handleScrap = () => {
    if (!selectedStructure) return;
    if (selectedStructure.type === 'COMMAND_ROOM') {
      onLogTerminal('REJECTED: Command Center is the structural nexus of the laboratory. Scrapping is forbidden.', true);
      playSyntheticSound('alert');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      const scrapReturn = 8000000; // recover $8M
      next.player.cash += scrapReturn;
      next.labStructures = next.labStructures.filter(s => s.id !== selectedStructure.id);
      onLogTerminal(`STRUCTURE DEMOLISHED: Reclaimed $${scrapReturn.toLocaleString()} scrap material resources from sector [${selectedStructure.x}, ${selectedStructure.y}].`);
      playSyntheticSound('success');
      return next;
    });
  };

  // Buy & Build structure
  const handleBuildElement = (type: keyof typeof BUILDING_TEMPLATES) => {
    const template = BUILDING_TEMPLATES[type];
    if (state.player.cash < template.cost) {
      onLogTerminal('REJECTED: Insufficient investment cash reserves to acquire building modules.', true);
      playSyntheticSound('alert');
      return;
    }
    if (state.biomass < template.biomassCost) {
      onLogTerminal('REJECTED: Insufficient biological biomass cores to splice this element.', true);
      playSyntheticSound('alert');
      return;
    }

    const collision = state.labStructures?.find(s => s.x === selectedX && s.y === selectedY);
    if (collision) {
      onLogTerminal('REJECTED: Target grid coordinate is already occupied by an active core facility.', true);
      playSyntheticSound('alert');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      next.player.cash -= template.cost;
      next.biomass -= template.biomassCost;

      const newStr: LabStructure = {
        id: 'str_' + Date.now(),
        type,
        x: selectedX || 0,
        y: selectedY || 0,
        level: 1,
        health: 100,
        powerUsage: template.power,
        waterUsage: template.water,
        lastTickActive: true
      };

      if (!next.labStructures) next.labStructures = [];
      next.labStructures.push(newStr);
      onLogTerminal(`CONSTRUCTION INITIATED: Erected ${template.name} on coordinates [${selectedX}, ${selectedY}]. Systems firing up.`);
      playSyntheticSound('success');
      return next;
    });
  };

  // Running Canvas Animation Loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = 580;
    const logicalHeight = 380;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    ctx.scale(dpr, dpr);

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      const tileW = logicalWidth / GRID_COLS;
      const tileH = logicalHeight / GRID_ROWS;

      // Draw background cybernetic wireframe grids
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const x = c * tileW;
          const y = r * tileH;

          // Ambient grid tiles
          ctx.strokeStyle = '#141c2b';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, tileW, tileH);

          // Subtle neon grid dots
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 1, y + 1, tileW - 2, tileH - 2);

          // Render coordinate labels in mono
          ctx.fillStyle = '#1e293b';
          ctx.font = '7px monospace';
          ctx.fillText(`C${c}R${r}`, x + 4, y + 11);
        }
      }

      // Draw Built structures
      if (state.labStructures) {
        state.labStructures.forEach(str => {
          const x = str.x * tileW;
          const y = str.y * tileH;

          // Base frame
          ctx.fillStyle = '#111827';
          ctx.fillRect(x + 2, y + 2, tileW - 4, tileH - 4);

          // Neon border highlights depending on health and type
          let statusColor = '#00ff88'; // healthy green
          if (str.health <= 0) statusColor = '#ff3b5c'; // destroyed red
          else if (str.health < 40) statusColor = '#ff9100'; // warning orange
          else if (str.type === 'SERVER_RACK') statusColor = '#00c2ff'; // cobalt
          else if (str.type === 'GENE_CHAMBER') statusColor = '#ca8a04'; // yellow
          else if (str.type === 'BIO_REACTOR') statusColor = '#8b5cf6'; // violet

          ctx.strokeStyle = statusColor;
          ctx.lineWidth = str.health <= 0 ? 1 : 1.5;
          ctx.strokeRect(x + 3, y + 3, tileW - 6, tileH - 6);

          // Animated pulsating lights
          if (str.health > 0) {
            const glowScalar = Math.sin(frameCount * 0.08) * 0.3 + 0.7;
            ctx.fillStyle = statusColor;
            ctx.globalAlpha = glowScalar * 0.4;
            ctx.beginPath();
            ctx.arc(x + tileW - 10, y + 10, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }

          // Structure Label
          ctx.fillStyle = str.health <= 0 ? '#64748b' : '#f8fafc';
          ctx.font = 'bold 8px monospace';
          // Truncated type presentation
          let shortLabel = str.type.replace('_', ' ');
          ctx.fillText(shortLabel, x + 6, y + tileH / 2 + 1);

          // Integrity health bar
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 6, y + tileH - 10, tileW - 12, 3);
          ctx.fillStyle = str.health < 40 ? '#ff3b5c' : '#00ff88';
          ctx.fillRect(x + 6, y + tileH - 10, (tileW - 12) * (str.health / 100), 3);

          ctx.fillStyle = '#64748b';
          ctx.font = '6.5px monospace';
          ctx.fillText(`LVL ${str.level}`, x + 6, y + tileH - 14);

          // Add animated sparks if damaged!
          if (str.health < 50 && Math.random() < 0.20) {
            for (let i = 0; i < 4; i++) {
              particlesRef.current.push({
                x: x + tileW / 2 + (Math.random() - 0.5) * 15,
                y: y + tileH / 2 + (Math.random() - 0.5) * 15,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2 - 1,
                color: '#ff9100',
                life: 15 + Math.random() * 10
              });
            }
          }
        });
      }

      // Draw Dynamic Weather overlays
      // Rain particles washing over canvas if stormy
      if (state.currentWeather !== 'CLEAR') {
        ctx.strokeStyle = state.currentWeather === 'BLACK_RAIN' ? 'rgba(0,0,0,0.6)' : 'rgba(0,194,255,0.25)';
        ctx.lineWidth = 1;
        const rainDensity = state.currentWeather === 'MONSOON_BREACH' ? 15 : 6;
        for (let i = 0; i < rainDensity; i++) {
          const rx = Math.random() * logicalWidth;
          const ry = Math.random() * logicalHeight;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 15);
          ctx.stroke();
        }

        // Draw lightning flashes overlay occasionally
        if (state.currentWeather === 'LIGHTNING_STORM' && Math.random() < 0.05) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        }
      }

      // Animated Floor Flood overlays
      if (state.floodLevel > 0) {
        ctx.fillStyle = 'rgba(0, 194, 255, 0.12)';
        const floodY = logicalHeight - (logicalHeight * (state.floodLevel / 100));
        ctx.fillRect(0, floodY, logicalWidth, logicalHeight - floodY);

        ctx.strokeStyle = 'rgba(0, 194, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, floodY);
        ctx.lineTo(logicalWidth, floodY);
        ctx.stroke();
      }

      // Draw Selected highlighting box
      if (selectedX !== null && selectedY !== null) {
        const sx = selectedX * tileW;
        const sy = selectedY * tileH;
        ctx.strokeStyle = '#00c2ff';
        ctx.lineWidth = 2;
        // Animated dashes
        ctx.setLineDash([4, 2 + Math.abs(Math.sin(frameCount * 0.1) * 3)]);
        ctx.strokeRect(sx + 1, sy + 1, tileW - 2, tileH - 2);
        ctx.setLineDash([]);
      }

      // Animate and draw particle sparks
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.labStructures, state.currentWeather, state.floodLevel, selectedX, selectedY]);

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-[#0a0c0f]">
      
      {/* LEFT: Game Map canvas viewport */}
      <div className="flex-1 flex flex-col justify-center items-center p-2 border-r border-[#1e2535] relative bg-[#06080a]">
        
        {/* Living Weather telemetry warning overlays */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none p-1.5 bg-black/80 border border-[#1e2535] rounded-terminal flex items-center gap-2 text-[9px] font-mono leading-none">
          <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="text-[#a6adbb] uppercase">WEATHER VECTOR MONITOR:</span>
          <span className={`font-black uppercase ${state.currentWeather === 'CLEAR' ? 'text-[#00ff88]' : 'text-red-400 animate-pulse'}`}>
            {state.currentWeather}
          </span>
          {state.weatherTicksRemaining > 0 && (
            <span className="text-slate-500 font-bold">({state.weatherTicksRemaining} Wks left)</span>
          )}
        </div>

        {state.floodLevel > 0 && (
          <div className="absolute top-2 right-2 z-10 pointer-events-none p-1.5 bg-black/80 border border-red-900 rounded-terminal text-[8.5px] font-mono text-red-400 uppercase leading-none animate-bounce">
            FLOOR FLOOD: {state.floodLevel}% WATER DEPTH SEC_GRID_C
          </div>
        )}

        <canvas
          id="lab_grid_board"
          ref={canvasRef}
          width={580}
          height={380}
          className="border border-[#1e2535] rounded-terminal bg-[#070a0e] shadow-[0_0_15px_rgba(0,194,255,0.06)] cursor-crosshair max-w-full"
          onClick={handleCanvasClick}
        />
        <div className="text-[8.5px] text-[#e8edf5]/40 mt-1 uppercase font-terminal tracking-wider">
          Click on grid sector coordinates to inspect structural chambers or build hardware.
        </div>
      </div>

      {/* RIGHT: Detailed Sector Inspector Control Board */}
      <div className="w-full md:w-[260px] p-3 flex flex-col gap-3.5 overflow-y-auto shrink-0 select-none bg-[#0a0f14] border-t md:border-t-0 border-[#1e2535]">
        
        {/* Selected Coordinates inspector */}
        <div className="border border-[#1e2535] bg-[#0c1015] p-2 rounded-terminal">
          <span className="text-[8.5px] text-[#00c2ff] font-bold block uppercase tracking-wide mb-1 font-mono">// GRID TARGET COORDINATE</span>
          <div className="flex justify-between items-center">
            <h3 className="text-white text-md font-black font-mono">
              SECTOR [{selectedX}, {selectedY}]
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">BASEMENT_SEC_C</span>
          </div>
        </div>

        {/* Selected chamber inspection controls block */}
        {selectedStructure ? (
          <div className="flex-1 flex flex-col gap-3">
            <div className="border border-indigo-900 bg-[#0c1015] p-2.5 rounded-terminal">
              <span className="text-[8px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">ROOM HARDWARE STATUS</span>
              <h4 className="text-[#00ff88] font-bold text-sm uppercase tracking-wide mt-0.5 font-mono">
                {selectedStructure.type.replace('_', ' ')}
              </h4>
              <p className="text-[9.5px] text-slate-400 leading-normal mt-1 font-mono">
                {BUILDING_TEMPLATES[selectedStructure.type as keyof typeof BUILDING_TEMPLATES]?.desc || 'Standard high-tech system infrastructure.'}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-900 text-[10px] font-mono">
                <div className="flex gap-1 items-center">
                  <Heart className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="text-slate-400">Health:</span>
                  <span className={`font-bold ${selectedStructure.health < 40 ? 'text-red-400 font-bold' : 'text-slate-200'}`}>{selectedStructure.health}%</span>
                </div>
                <div className="flex gap-1 items-center">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  <span className="text-slate-400">Level:</span>
                  <span className="text-slate-200 font-bold">LVL {selectedStructure.level}</span>
                </div>
                <div className="flex gap-1 items-center">
                  <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span className="text-slate-400">Power:</span>
                  <span className="text-slate-200 font-bold">{selectedStructure.powerUsage * selectedStructure.level} MW</span>
                </div>
                <div className="flex gap-1 items-center">
                  <Droplet className="w-3.5 h-3.5 text-[#00c2ff] shrink-0" />
                  <span className="text-slate-400">Water:</span>
                  <span className="text-slate-200 font-bold">{selectedStructure.waterUsage * selectedStructure.level} L/s</span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col gap-2 font-mono text-[10.5px]">
              {selectedStructure.health < 100 && (
                <button
                  onClick={handleRepair}
                  className="w-full bg-[#00c2ff] hover:bg-opacity-95 text-black font-black py-1.5 px-3 rounded-terminal cursor-pointer flex justify-center items-center gap-1.5 uppercase transition-all duration-150"
                >
                  <Hammer className="w-3.5 h-3.5" />
                  REPAIR FOR ${((100 - selectedStructure.health) * 150000).toLocaleString()}
                </button>
              )}

              {selectedStructure.level < 3 && (
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-[#ca8a04] hover:bg-opacity-95 text-white font-black py-1.5 px-3 rounded-terminal cursor-pointer flex justify-center items-center gap-1.5 uppercase transition-all duration-150 border border-yellow-800"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  UPGRADE (${(selectedStructure.level * 20000000).toLocaleString()} + {selectedStructure.level * 150} Bio)
                </button>
              )}

              <button
                onClick={handleScrap}
                className="w-full bg-red-950 hover:bg-red-900 text-red-400 font-bold py-1.2 px-3 rounded-terminal cursor-pointer flex justify-center items-center gap-1.5 uppercase transition-all duration-150 border border-red-900"
              >
                <Trash2 className="w-3.5 h-3.5" />
                DISSOLVE SECTOR MODULES
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-2.5">
            {buildType === '' ? (
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider font-mono">CONSTRUCT FACILITY CORE</span>
                <div className="flex-1 border border-dashed border-[#1e2535] p-3 text-center flex flex-col items-center justify-center rounded-terminal gap-2.5">
                  <Plus className="w-8 h-8 text-[#00c2ff] animate-pulse" />
                  <p className="text-[9.5px] text-slate-400 leading-normal max-w-[180px] font-mono">
                    This sector is vacant and ready for custom cybernetic assembly. Select a building module template below to mount structures.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-[10px] pt-1.5 font-mono">
                  {Object.entries(BUILDING_TEMPLATES).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => { setBuildType(key as keyof typeof BUILDING_TEMPLATES); playSyntheticSound('tick'); }}
                      className="w-full text-left bg-[#0c1015] border border-[#1e2535] p-1.5 rounded-terminal text-slate-200 hover:border-[#00c2ff] hover:text-[#00c2ff] transition-all cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-bold font-mono">{key.replace('_', ' ')}</span>
                      <span className="text-[#00ff88] font-bold font-mono">${(template.cost / 1000000).toFixed(0)}M</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-3 font-mono">
                <div className="border border-[#1e2535] bg-[#0c1015] p-2.5 rounded-terminal">
                  <span className="text-[8.5px] text-[#00c2ff] font-bold block uppercase tracking-wide font-mono">// CONFIRM CONTRACT SPECS</span>
                  <h4 className="text-white font-bold text-sm tracking-wide mt-1 uppercase font-mono">
                    {BUILDING_TEMPLATES[buildType].name}
                  </h4>
                  <p className="text-[9.5px] text-slate-400 leading-normal mt-1.5 font-mono">
                    {BUILDING_TEMPLATES[buildType].desc}
                  </p>

                  <div className="flex flex-col gap-1.5 mt-3 pt-2.5 border-t border-slate-900 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cash Investment:</span>
                      <span className="text-slate-200 font-bold">${(BUILDING_TEMPLATES[buildType].cost).toLocaleString()}</span>
                    </div>
                    {BUILDING_TEMPLATES[buildType].biomassCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Biomass Required:</span>
                        <span className="text-[#00ff88] font-bold">{BUILDING_TEMPLATES[buildType].biomassCost} CORE</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Power Grid draw:</span>
                      <span className="text-slate-200 font-bold">{BUILDING_TEMPLATES[buildType].power} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Water Drainage:</span>
                      <span className="text-slate-200 font-bold">{BUILDING_TEMPLATES[buildType].water} L/s</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-[10.5px]">
                  <button
                    onClick={() => handleBuildElement(buildType)}
                    className="w-full bg-[#00ff88] text-black font-black py-1.5 px-3 rounded-terminal cursor-pointer text-center uppercase transition-all"
                  >
                    DEPLOY STRUCTURE MODULE
                  </button>
                  <button
                    onClick={() => { setBuildType(''); playSyntheticSound('tick'); }}
                    className="w-full bg-[#141920] border border-[#1e2535] text-slate-400 font-bold py-1 px-3 rounded-terminal cursor-pointer text-center uppercase"
                  >
                    BACK TO SELECTION
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
