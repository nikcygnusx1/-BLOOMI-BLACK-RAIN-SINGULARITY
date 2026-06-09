import React, { useState, useEffect, useRef } from 'react';
import { SimState, DynastyMember } from '../types';
import { Shield, HardHat, Zap, Droplet, Flame, Users, Radio, Compass, RefreshCw } from 'lucide-react';

interface BunkerPanelProps {
  state: SimState;
  onModifyState: (modifier: (prev: SimState) => SimState) => void;
  onLogTerminal: (msg: string, isError?: boolean) => void;
  playSyntheticSound: (type: any) => void;
}

interface BunkerRoom {
  id: string;
  name: string;
  level: number;
  status: 'ONLINE' | 'STANDBY' | 'CRITICAL';
  capacity: number;
  maxCapacity: number;
  description: string;
}

export function BunkerPanel({ state, onModifyState, onLogTerminal, playSyntheticSound }: BunkerPanelProps) {
  // Localized state for Bunker expansion that persists dynamically
  const [bunkerPower, setBunkerPower] = useState(85); // %
  const [bunkerFood, setBunkerFood] = useState(36); // months
  const [bunkerWater, setBunkerWater] = useState(48); // months
  const [bunkerMeds, setBunkerMeds] = useState(72); // months
  const [bunkerWeapons, setBunkerWeapons] = useState(25); // tons
  const [bunkerSecureMode, setBunkerSecureMode] = useState<Record<string, boolean>>({}); // member name -> bunkered-in
  
  const [rooms, setRooms] = useState<BunkerRoom[]>([
    { id: 'pow_1', name: 'SUBTERRANEAN PLASMA HEART', level: 1, status: 'ONLINE', capacity: 150, maxCapacity: 150, description: 'Direct thermal power core tapping Earth core heat.' },
    { id: 'gen_1', name: 'CLONAL SANCTUM & GEN LAB', level: 1, status: 'ONLINE', capacity: 2, maxCapacity: 5, description: 'Ensures genetic cloning succession and longevity splicing.' },
    { id: 'srv_1', name: 'SOVEREIGN CLOUD SERVER STACKS', level: 1, status: 'ONLINE', capacity: 8, maxCapacity: 20, description: 'Houses neural firewall algorithms and ledger records.' },
    { id: 'liv_1', name: 'ANSESTRAL RESIDENCE DOMES', level: 1, status: 'ONLINE', capacity: 3, maxCapacity: 10, description: 'Luxurious self-contained ecological cabins.' },
    { id: 'fod_1', name: 'HYDRO-AGRI STORAGE VAULTS', level: 1, status: 'ONLINE', capacity: 12000, maxCapacity: 15000, description: 'Synthetic carbohydrate stockpiles and reverse-osmosis filtration.' },
    { id: 'arm_1', name: 'AUTONOMOUS SENTINEL BAY', level: 1, status: 'STANDBY', capacity: 50, maxCapacity: 100, description: 'Militarized response drones and defensive lasers.' },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Spend player cash to drill and expand levels
  const handleDrillRoom = (roomId: string) => {
    const cost = 250000000; // $250M
    if (state.player.cash < cost) {
      onLogTerminal('REJECTED: Drilling operations require $250.0M in fluid reserves.', true);
      playSyntheticSound('splice_fail');
      return;
    }

    onModifyState((prev) => {
      prev.player.cash -= cost;
      return prev;
    });

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        onLogTerminal(`BUNKER OPERATIONS: Drilled deeper level for ${r.name}. Efficiency scaled to Lvl ${r.level + 1}.`);
        playSyntheticSound('splice_success');
        return {
          ...r,
          level: r.level + 1,
          maxCapacity: Math.floor(r.maxCapacity * 1.5),
          capacity: Math.floor(r.capacity * 1.2)
        };
      }
      return r;
    }));
  };

  const handleStockpile = (resource: 'food' | 'water' | 'meds' | 'weapons') => {
    const cost = 45000000; // $45M
    if (state.player.cash < cost) {
      onLogTerminal(`REJECTED: Stockpile upgrades require $45.0M reserve capital.`, true);
      playSyntheticSound('splice_fail');
      return;
    }

    onModifyState((prev) => {
      prev.player.cash -= cost;
      return prev;
    });

    playSyntheticSound('order');
    if (resource === 'food') setBunkerFood(f => f + 12);
    else if (resource === 'water') setBunkerWater(w => w + 12);
    else if (resource === 'meds') setBunkerMeds(m => m + 18);
    else if (resource === 'weapons') setBunkerWeapons(w => w + 5);

    onLogTerminal(`BUNKER LOGISTICS: Enhanced stockpiles for ${resource.toUpperCase()} (-$45M).`);
  };

  // Toggle dynasty members safe state
  const toggleMemberSafety = (name: string) => {
    setBunkerSecureMode(prev => {
      const NextVal = !prev[name];
      onLogTerminal(`BUNKER SECURITY: Transferred successor "${name}" ${NextVal ? 'INTO CRITICAL SAFE VAULT' : 'BACK TO PHYSICAL SURFACE CORRIDORS'}.`);
      playSyntheticSound('click');
      return { ...prev, [name]: NextVal };
    });
  };

  // Canvas schematic loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const logicalWidth = rect.width || 460;
    const logicalHeight = rect.height || 320;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;

    const renderSchematic = () => {
      // Clear canvas
      ctx.fillStyle = '#030304';
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      const width = logicalWidth;
      const height = logicalHeight;

      // Draw earth grid template background
      ctx.strokeStyle = '#141a20';
      ctx.lineWidth = 1;
      const gridSpacing = 30;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw surface border
      ctx.strokeStyle = '#ff6f00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 50);
      ctx.lineTo(width, 50);
      ctx.stroke();

      // Flat surface indicators
      ctx.fillStyle = 'rgba(255, 111, 0, 0.08)';
      ctx.fillRect(0, 0, width, 50);
      ctx.fillStyle = '#ff6f00';
      ctx.font = '9px "Share Tech Mono"';
      ctx.fillText('CRUSTAL GEOMETRICS // PHYSICAL SURFACE ZONE // ATMOSPHERE CRITICAL', 15, 25);

      // Render elevator shafts (two vertical columns in center)
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(width / 2 - 20, 50, 40, height - 80);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.03)';
      ctx.fillRect(width / 2 - 20, 50, 40, height - 80);

      // Animate sliding elevator pod
      const elevatorY = 50 + (Math.sin(Date.now() * 0.001) * 0.5 + 0.5) * (height - 150);
      ctx.fillStyle = '#00d4ff';
      ctx.strokeRect(width / 2 - 15, elevatorY, 30, 25);
      ctx.fillRect(width / 2 - 12, elevatorY + 2, 24, 21);

      // Render bunker structural chambers
      rooms.forEach((room, idx) => {
        const isLeft = idx % 2 === 0;
        const row = Math.floor(idx / 2);
        
        const rWidth = 140;
        const rHeight = 45;
        const x = isLeft ? (width / 2 - 180) : (width / 2 + 40);
        const y = 80 + row * 65;

        // Draw connecting tunnel line
        ctx.strokeStyle = '#0077aa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(isLeft ? x + rWidth : x, y + rHeight / 2);
        ctx.lineTo(width / 2, y + rHeight / 2);
        ctx.stroke();

        // Draw chamber physical card container
        ctx.fillStyle = '#080a0c';
        ctx.strokeStyle = room.status === 'CRITICAL' ? '#ff1744' : room.status === 'ONLINE' ? '#ff6f00' : '#888899';
        ctx.lineWidth = 1.5;
        ctx.fillRect(x, y, rWidth, rHeight);
        ctx.strokeRect(x, y, rWidth, rHeight);

        // Chamber flashing activity dot
        ctx.fillStyle = room.status === 'ONLINE' && (Math.sin(Date.now() * 0.005) > 0) ? '#00ff41' : '#555';
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Chamber labels
        ctx.fillStyle = '#e8dcc8';
        ctx.font = '8px "Share Tech Mono"';
        ctx.fillText(room.name.substring(0, 24), x + 18, y + 13);

        ctx.fillStyle = '#ffb300';
        ctx.font = '8px "IBM Plex Mono"';
        ctx.fillText(`LVL ${room.level} // CAP ${room.capacity}/${room.maxCapacity}`, x + 10, y + 26);

        ctx.fillStyle = '#4a5568';
        ctx.font = '7px "IBM Plex Mono"';
        ctx.fillText(room.status, x + 10, y + 38);
      });

      // Ambient scanning radar swipe lines
      const scannerY = (Date.now() * 0.15) % height;
      ctx.strokeStyle = 'rgba(255, 111, 0, 0.1)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, scannerY);
      ctx.lineTo(width, scannerY);
      ctx.stroke();

      animId = requestAnimationFrame(renderSchematic);
    };

    renderSchematic();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [rooms]);

  return (
    <div className="flex flex-col h-full font-terminal overflow-hidden text-[#e8dcc8] select-none p-2 gap-3.5 bg-black">
      {/* Module Title Chrome bar */}
      <div className="h-7 border border-[#FF6F00] bg-[#0c0805] px-3 flex justify-between items-center select-none shrink-0" style={{ boxShadow: '0 0 10px rgba(255, 111, 0, 0.15)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] animate-pulse" />
          <span className="font-display text-sm tracking-widest uppercase text-white font-black">F11: SUB-SURFACE SANCTUARY COMPLEX [BUNKER]</span>
        </div>
        <div className="text-[10px] font-mono text-[#ffb300]">SEC_LEVEL: 5_EYES_ONLY</div>
      </div>

      {/* Main Split Layout Grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 overflow-hidden">
        
        {/* Left Column: Canvas Schematic mapping of chambers (7 Cols) */}
        <div className="col-span-7 border border-[#1e2530] bg-[#080a0c] flex flex-col p-2.5 relative justify-between overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 select-none pointer-events-none bg-[#030304]/80 p-2 border border-[#1e2530] text-[9.5px]">
            <div>STRUCTURAL CAPACITY: <span className="text-[#FF6F00] font-black">L3_SUBCELLS_ACTIVE</span></div>
            <div>SHIELD STRUCT: <span className="text-[#00ff41] font-bold">100% PRESSURE CAPACITY</span></div>
            <div>SEEDS PRESERVES: <span className="text-[#00d4ff] font-bold">ARC_V_STABLE</span></div>
          </div>
          <div className="flex-1 bg-black rounded border border-[#1e2530]">
            <canvas 
              ref={canvasRef} 
              width={460} 
              height={320} 
              className="w-full h-full block bg-black"
            />
          </div>
        </div>

        {/* Right Column: Gauges, Controls, Occupants lists (5 Cols) */}
        <div className="col-span-5 flex flex-col gap-3.5 overflow-y-auto">
          
          {/* Resource gauges status telemetry */}
          <div className="border border-[#1e2530] bg-[#080a0c] p-3 flex flex-col gap-2.5">
            <h3 className="font-display text-[#ffb300] uppercase text-xs border-b border-[#1e2530] pb-1 flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 text-[#ff6f00]" />
              SUB-VOID CRITICAL RESOURCES STOCKPILES
            </h3>
            
            <div className="flex flex-col gap-2.5 text-[10px]">
              <div>
                <div className="flex justify-between font-mono text-[9px] mb-1">
                  <span>REACTOR POWER INJECTION:</span>
                  <span className="text-[#00ff41] font-bold">{bunkerPower}% (STABLE)</span>
                </div>
                <div className="h-2 bg-neutral-900 border border-[#1e2530] p-0.5 rounded-sm">
                  <div className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-[#00ff41]" style={{ width: `${bunkerPower}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-[9px] mb-1">
                  <span>BIO-CARBOHYDRATE STORES:</span>
                  <span className="text-amber-400 font-bold">{bunkerFood} MONTHS CAPACITY</span>
                </div>
                <div className="h-2 bg-neutral-900 border border-[#1e2530] p-0.5 rounded-sm">
                  <div className="h-full bg-gradient-to-r from-red-650 to-amber-500" style={{ width: `${Math.min(100, (bunkerFood/120)*100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-[9px] mb-1">
                  <span>RECOVERY DECAL-LITRE RESERVOIR:</span>
                  <span className="text-cyan-400 font-bold">{bunkerWater} MONTHS</span>
                </div>
                <div className="h-2 bg-neutral-900 border border-[#1e2530] p-0.5 rounded-sm">
                  <div className="h-full bg-gradient-to-r from-cyan-650 to-[#00D4FF]" style={{ width: `${Math.min(100, (bunkerWater/120)*100)}%` }} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button 
                  onClick={() => handleStockpile('food')}
                  className="bg-[#141920] border border-[#1e2530] text-[9px] text-[#ffb300] py-1 rounded cursor-pointer hover:bg-[#1a212b]"
                >
                  STRENGTHEN FOOD (-$45M)
                </button>
                <button 
                  onClick={() => handleStockpile('water')}
                  className="bg-[#141920] border border-[#1e2530] text-[9px] text-[#ffb300] py-1 rounded cursor-pointer hover:bg-[#1a212b]"
                >
                  UPGRADE FILTRATION (-$45M)
                </button>
              </div>
            </div>
          </div>

          {/* Splicer Heirs protection manifests control panel */}
          <div className="border border-[#1e2530] bg-[#080a0c] p-3 flex flex-col gap-2">
            <h3 className="font-display text-[#ffb300] uppercase text-xs border-b border-[#1e2530] pb-1 flex items-center gap-1.5 font-bold">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              SANCTUARY FAMILY PROTECTORATE
            </h3>

            <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto font-terminal">
              {state.dynasty.members.map((member, idx) => {
                const bunkered = bunkerSecureMode[member.name] || false;
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleMemberSafety(member.name)}
                    className={`flex justify-between items-center p-1.5 rounded border cursor-pointer select-none transition-all duration-150 ${
                      bunkered 
                        ? 'border-[#00ff41]/50 bg-[#00ff41]/5 hover:bg-[#00ff41]/10 text-white' 
                        : 'border-[#ff1744]/30 bg-red-950/10 hover:bg-red-950/20 text-[#a3a3a3]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[9.5px]">{member.name}</div>
                      <div className="text-[8px] opacity-60 font-mono">{member.role} // AGE: {member.age}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span className="text-[8.5px] font-black uppercase tracking-wider">{bunkered ? 'BUNKERED_SAFE' : 'EXPOSED_SURFACE'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls: DRILL Deeper Level rooms */}
          <div className="border border-[#1e2530] bg-[#080a0c] p-3 flex flex-col gap-2">
            <h3 className="font-display text-[#ff6f00] uppercase text-xs border-b border-[#1e2530] pb-1 flex items-center gap-2 font-bold">
              <Shield className="w-3.5 h-3.5 text-[#ff6f00]" />
              ACTIVATE CRUSTAL DRILL ACTIONS
            </h3>
            
            <div className="flex flex-col gap-1.5">
              {rooms.map(room => (
                <div key={room.id} className="flex justify-between items-center text-[10px] bg-black/40 border border-[#1e2530] p-1.5 rounded">
                  <div>
                    <span className="font-bold text-[9px] block text-stone-300">{room.name}</span>
                    <span className="text-[8px] text-stone-500 font-mono">Current lvl: {room.level}</span>
                  </div>
                  <button 
                    onClick={() => handleDrillRoom(room.id)}
                    className="bg-[#ff6f00]/10 hover:bg-[#ff6f00]/20 border border-[#ff6f00]/40 text-[#ffb300] font-bold text-[8.5px] px-2 py-1 rounded cursor-pointer uppercase font-mono"
                  >
                    UPGRADE CELLS (-$250M)
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
