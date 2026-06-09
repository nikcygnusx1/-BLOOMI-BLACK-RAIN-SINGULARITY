/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimState, Country, WeaponSystem, ActiveStrike } from '../types';
import { Shield, Target, Navigation, AlertTriangle, Zap } from 'lucide-react';

interface GothamTacticalMapProps {
  state: SimState;
  onModifyState: (modifier: (prev: SimState) => SimState) => void;
  onLogTerminal: (msg: string, isErr?: boolean) => void;
  playSyntheticSound: (type: 'tick' | 'order' | 'click' | 'alert' | 'success') => void;
}

export const GothamTacticalMap: React.FC<GothamTacticalMapProps> = ({
  state,
  onModifyState,
  onLogTerminal,
  playSyntheticSound
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('CN');
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>('');

  const playerNationality = state.player?.nationality || 'US';
  const playerCountry = state.countries[playerNationality];

  // Eligible weapons of type ICBM or CLIMATE or CYBER with stockpile > 0
  const strikeWeapons = playerCountry?.weapons?.filter(w => w.stockpile > 0) || [];

  const handleLaunchStrike = () => {
    if (!selectedWeaponId) {
      onLogTerminal('LAUNCH DENIED: Select a weapon system payload before initializing ignition sequence.', true);
      playSyntheticSound('alert');
      return;
    }
    if (selectedTarget === playerNationality) {
      onLogTerminal('LAUNCH PLAN CRITICAL ERROR: Targeting of sovereign capital origins is locked by safety firmware.', true);
      playSyntheticSound('alert');
      return;
    }

    const weaponToArm = playerCountry.weapons?.find(w => w.id === selectedWeaponId);
    if (!weaponToArm || weaponToArm.stockpile <= 0) {
      onLogTerminal('LAUNCH DENIED: Armed stockpile depletion. Maintenance team requires production cycles.', true);
      playSyntheticSound('alert');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      const sender = next.countries[playerNationality];
      const target = next.countries[selectedTarget];
      
      if (!sender || !target) return next;

      // Deduct weapon unit
      const activeWeapon = sender.weapons?.find(w => w.id === selectedWeaponId);
      if (activeWeapon) {
        activeWeapon.stockpile--;
      }

      // Bezier helper coordinates
      let startX = 220, startY = 180;
      if (playerNationality === 'US') { startX = 220; startY = 180; }
      else if (playerNationality === 'CN') { startX = 620; startY = 185; }
      else if (playerNationality === 'EU') { startX = 455; startY = 150; }
      else if (playerNationality === 'CH') { startX = 445; startY = 190; }

      let endX = 620, endY = 185;
      if (selectedTarget === 'US') { endX = 220; endY = 180; }
      else if (selectedTarget === 'CN') { endX = 620; endY = 185; }
      else if (selectedTarget === 'EU') { endX = 455; endY = 150; }
      else if (selectedTarget === 'CH') { endX = 445; endY = 190; }

      const ctrlX = (startX + endX) / 2;
      const ctrlY = 40; // High arc

      const newStrike: ActiveStrike = {
        id: `strike_${Date.now()}`,
        source: playerNationality,
        target: selectedTarget,
        weaponId: selectedWeaponId,
        progress: 0,
        bezierPoints: [
          { x: startX, y: startY },
          { x: ctrlX, y: ctrlY },
          { x: endX, y: endY }
        ],
        impactTick: next.currentTick + 5
      };

      if (!next.activeStrikes) {
        next.activeStrikes = [];
      }
      next.activeStrikes.push(newStrike);

      onLogTerminal(`WARHEAD IGNITION SUCCESSFUL: Launch detected of ${weaponToArm.name} against coordinates ${selectedTarget}. Impact calculated in 5 ticks.`);
      playSyntheticSound('order');
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0c0f] overflow-hidden p-3 gap-3 font-mono">
      {/* HUD Header */}
      <div className="flex justify-between items-center border-b border-[#1e2535] pb-2">
        <div>
          <h2 className="text-white text-md font-black tracking-wider uppercase font-sans flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500 animate-spin" />
            PALANTIR GOTHAM COGNITIVE COMBAT MAP
          </h2>
          <p className="text-[10px] text-slate-500 uppercase mt-0.5">// Tactical Ballistic Missile Strikes and Sovereignty Interception Controllers</p>
        </div>
        <div className="bg-[#11141b] border border-red-900 px-3 py-1.5 rounded-terminal">
          <span className="text-[8.5px] text-slate-400 block uppercase font-bold text-right">GLOBAL DEFENSE SPREAD</span>
          <span className="text-red-500 text-sm font-black text-right block mt-0.5">{state.globalStability}% INTEGRITY</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
        {/* Left column: Tactical Map */}
        <div className="md:col-span-2 bg-[#07090d] border border-[#1e2535] rounded-terminal overflow-hidden relative flex flex-col justify-between">
          <div className="absolute left-2.5 top-2.5 flex flex-col text-[8.5px] text-slate-500 font-terminal pointer-events-none z-10 leading-snug">
            <span>RADAR: PASSIVE SCAN ACTIVE</span>
            <span>BEARING: {120.5 + state.currentTick * 0.5}° NNE</span>
            <span>ORBIT RESIDENCE: SAT-{state.activeSatellitesCount || 2} DEPLOYED</span>
          </div>

          {/* High Fidelity Vector SVG Map */}
          <svg viewBox="0 0 800 380" className="w-full h-full text-slate-800 z-10 flex-1">
            <defs>
              <pattern id="ggrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#121822" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ggrid)" />

            {/* Orbit track trajectories */}
            <ellipse cx="400" cy="190" rx="360" ry="110" className="stroke-slate-900 fill-none stroke-1" style={{ strokeDasharray: '4 4' }} />
            <ellipse cx="400" cy="190" rx="280" ry="150" className="stroke-emerald-950/20 fill-none stroke-1" />

            {/* SVG Lines of Active Inflight ballistics */}
            {state.activeStrikes && state.activeStrikes.map((s) => {
              const [start, ctrl, end] = s.bezierPoints;
              // Calc current interpolation coordinate
              const t = s.progress / 100;
              const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x;
              const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y;

              return (
                <g key={s.id}>
                  <path d={`M ${start.x} ${start.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`} fill="none" className="stroke-red-500/40 stroke-2 stroke-dashed" />
                  <circle cx={x} cy={y} r="5" className="fill-red-500 stroke-black stroke-2" />
                  <circle cx={x} cy={y} r="10" className="fill-none stroke-red-500 stroke-1 animate-ping" />
                  <text x={x + 8} y={y - 4} className="text-[7.5px] fill-red-400 font-bold bg-black">ALERT: INBOUND PAYLOAD ({s.source} ➔ {s.target})</text>
                </g>
              );
            })}

            {/* Coordinates overlay of countries */}
            <g transform="translate(140, 110)">
              <polygon points="10,20 80,10 140,40 160,80 120,110 50,115" className={`fill-none stroke-2 transition-colors ${selectedTarget === 'US' ? 'stroke-red-500 fill-red-950/10' : 'stroke-slate-800 hover:stroke-slate-500'}`} />
              <text x="45" y="72" className={`text-[9.5px] font-bold ${selectedTarget === 'US' ? 'fill-red-400' : 'fill-slate-600'}`}>UNITED STATES</text>
            </g>

            <g transform="translate(400, 90)">
              <polygon points="20,10 90,5 110,60 80,95 25,85" className={`fill-none stroke-2 transition-colors ${selectedTarget === 'EU' ? 'stroke-red-500 fill-red-950/10' : 'stroke-slate-800 hover:stroke-slate-500'}`} />
              <text x="30" y="55" className={`text-[9.5px] font-bold ${selectedTarget === 'EU' ? 'fill-red-400' : 'fill-slate-600'}`}>EUROPEAN UNION</text>
            </g>

            <g transform="translate(540, 120)">
              <polygon points="30,10 120,5 140,50 110,90 60,110 15,65" className={`fill-none stroke-2 transition-colors ${selectedTarget === 'CN' ? 'stroke-red-500 fill-red-950/10' : 'stroke-slate-800 hover:stroke-slate-500'}`} />
              <text x="40" y="62" className={`text-[9.5px] font-bold ${selectedTarget === 'CN' ? 'fill-red-400' : 'fill-slate-600'}`}>CHINA</text>
            </g>

            <g transform="translate(425, 175)">
              <polygon points="5,5 35,5 35,25 5,25" className={`fill-none stroke-2 transition-colors ${selectedTarget === 'CH' ? 'stroke-red-500 fill-red-950/10' : 'stroke-slate-800 hover:stroke-slate-500'}`} />
              <text x="6" y="19" className="text-[7.5px] font-bold fill-slate-600">SWITZERLAND</text>
            </g>
          </svg>

          {/* Active Flight Tracker Log */}
          <div className="bg-[#0b0e14] border-t border-[#1e2535] p-2 select-none h-24 overflow-y-auto">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold mb-1">// TELEMETRY INTERCEPT LOGS</span>
            {(!state.activeStrikes || state.activeStrikes.length === 0) ? (
              <span className="text-[9px] text-[#00ff88]/50 block">NO DETECTED TRAJECTORIES IN AIRSPACE SENSORS. ALL CORRIDORS SECURE.</span>
            ) : (
              state.activeStrikes.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-[9px] font-mono border-b border-slate-900/40 py-0.5">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3 h-3 text-red-500 animate-pulse rotate-90" />
                    <span className="text-red-400 font-bold">{s.weaponId.toUpperCase()}</span>
                    <span className="text-slate-400">{s.source} ➔ {s.target}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-yellow-400">ARC PROGRESS: {s.progress}%</span>
                    <span className="text-red-500 font-black">INTERCEPT SHIELD DANGER</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Strike Controller Launchpad */}
        <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col justify-between overflow-y-auto gap-3">
          <div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-2">
              <span className="text-[#ff3b5c] font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                BALLISTIC IGNITION DESK
              </span>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider">// LOCAL COMMAND STATION</span>
            </div>

            {/* Select Target */}
            <div className="space-y-1 mt-2.5">
              <label className="text-[8.5px] text-slate-400 uppercase tracking-wide">// TARGET COORDINATE SECTOR:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(state.countries).map((countryId) => (
                  <button
                    key={countryId}
                    type="button"
                    onClick={() => { setSelectedTarget(countryId); playSyntheticSound('click'); }}
                    className={`p-1.5 rounded text-[9.5px] font-bold uppercase cursor-pointer border text-center transition-all ${selectedTarget === countryId ? 'bg-red-950/40 border-red-650 text-red-400' : 'bg-[#141920] border-slate-900 text-slate-400 hover:border-slate-800'}`}
                  >
                    {countryId} - {state.countries[countryId]?.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Weapon Payroll */}
            <div className="space-y-1 mt-4">
              <label className="text-[8.5px] text-slate-400 uppercase tracking-wide">// SATELLITE APPARATUS ARMED WEAPON:</label>
              <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                {strikeWeapons.length === 0 ? (
                  <div className="text-[9px] text-slate-500 italic p-3 text-center border border-slate-900 rounded bg-[#13171e]">
                    Sovereign arsenal depleted. Maintain defense budgets to build ballistic ICBM stocks.
                  </div>
                ) : (
                  strikeWeapons.map((w: WeaponSystem) => (
                    <div
                      key={w.id}
                      onClick={() => { setSelectedWeaponId(w.id); playSyntheticSound('click'); }}
                      className={`p-2 rounded border cursor-pointer flex justify-between items-center transition-all ${selectedWeaponId === w.id ? 'bg-yellow-950/30 border-yellow-500/70 text-yellow-500' : 'bg-[#141920] border-slate-900 text-slate-400 hover:border-slate-800'}`}
                    >
                      <div className="text-left">
                        <span className="font-bold block text-[10px] uppercase">{w.name}</span>
                        <span className="text-[7.5px] text-slate-500 block uppercase">Type: {w.type} / POWER: {w.powerRating}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black block">{w.stockpile} IN STOCK</span>
                        <span className="text-[7.5px] text-slate-500 block">MC: ${(w.maintenanceCost/1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Launch Controls */}
          <div className="border-t border-slate-900 pt-3 flex flex-col gap-2.5">
            <div className="flex items-start gap-2 bg-[#1b1515] border border-red-950/60 p-2 rounded text-[9px] text-red-400 leading-normal">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="uppercase">
                WARNING: Striking high AI zones triggers aggressive retaliatory responses. Interceptors on target region may intercept arriving payloads.
              </p>
            </div>

            <button
              onClick={handleLaunchStrike}
              className="w-full bg-red-600 hover:bg-red-500 text-black font-black py-2.5 rounded-terminal uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer text-xs active:scale-[0.99] transition-transform"
            >
              <Zap className="w-4 h-4 fill-black" />
              EXECUTE BALLISTIC LAUNCH SEQUENCE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
