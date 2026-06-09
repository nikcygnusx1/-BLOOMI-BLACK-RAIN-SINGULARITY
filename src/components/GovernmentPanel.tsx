/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimState, Country, SovereignSpending } from '../types';
import { Shield, Sparkles, AlertTriangle, Vote, Scale } from 'lucide-react';

interface GovernmentPanelProps {
  state: SimState;
  onModifyState: (modifier: (prev: SimState) => SimState) => void;
  onLogTerminal: (msg: string, isErr?: boolean) => void;
  playSyntheticSound: (type: 'tick' | 'order' | 'click' | 'alert' | 'success') => void;
}

export const GovernmentPanel: React.FC<GovernmentPanelProps> = ({
  state,
  onModifyState,
  onLogTerminal,
  playSyntheticSound
}) => {
  const playerNationality = state.player?.nationality || 'US';
  const c = state.countries[playerNationality];

  if (!c) {
    return (
      <div className="p-4 text-slate-500 italic text-xs font-mono">
        NO SOVEREIGN REGISTRATION FOUND FOR NATIONALITY: {playerNationality}
      </div>
    );
  }

  const handleSpendAllocation = (field: keyof SovereignSpending, val: number) => {
    onModifyState((prev) => {
      const next = { ...prev };
      const nation = next.countries[playerNationality];
      if (!nation || !nation.spending) return next;

      // Ensure the change maintains total spending at 100%
      const currentVal = nation.spending[field];
      const delta = val - currentVal;
      
      const otherFields = (Object.keys(nation.spending) as (keyof SovereignSpending)[]).filter(f => f !== field);
      const adjustmentPerField = delta / otherFields.length;

      // Apply adjustment to other fields
      let possible = true;
      otherFields.forEach(f => {
        if (nation.spending![f] - adjustmentPerField < 0) possible = false;
      });

      if (possible) {
        nation.spending[field] = val;
        otherFields.forEach(f => {
          nation.spending![f] = Math.max(0, nation.spending![f] - adjustmentPerField);
        });

        // Normalize to exactly 100
        const total = nation.spending.healthcare + nation.spending.infrastructure + nation.spending.military + nation.spending.research;
        if (total !== 100) {
          const normDelta = 100 - total;
          nation.spending[otherFields[0]] += normDelta;
        }

        onLogTerminal(`FISCAL REALLOCATION: Modified sovereign spending budget for ${field.toUpperCase()} to ${val}%.`);
        playSyntheticSound('success');
      } else {
        onLogTerminal('REALLOCATION BLOCKED: Desired fiscal adjustment would cannibalize adjacent budgets below 0%.', true);
        playSyntheticSound('alert');
      }

      return next;
    });
  };

  const handleToggleMartialLaw = () => {
    onModifyState((prev) => {
      const next = { ...prev };
      const nation = next.countries[playerNationality];
      if (!nation) return next;

      nation.martialLaw = !nation.martialLaw;
      if (nation.martialLaw) {
        nation.stability = Math.min(100, nation.stability + 20);
        nation.unrest = Math.max(0, nation.unrest - 10);
        nation.approvalRating = Math.max(0, nation.approvalRating - 20);
        onLogTerminal('MARTIAL LAW ACTIVATED: Armed sovereign forces garrison administrative corridors. Stability locked.');
      } else {
        nation.unrest = Math.min(100, nation.unrest + 12);
        nation.approvalRating = Math.min(100, nation.approvalRating + 10);
        onLogTerminal('MARTIAL LAW SUSPENDED: Regulates administration back to normal constitutional oversight.');
      }
      playSyntheticSound('order');
      return next;
    });
  };

  const handleToggleRegime = () => {
    onModifyState((prev) => {
      const next = { ...prev };
      const nation = next.countries[playerNationality];
      if (!nation) return next;

      const oldType = nation.regimeType;
      nation.regimeType = oldType === 'DEMOCRACY' ? 'DICTATORSHIP' : 'DEMOCRACY';
      nation.stability = oldType === 'DEMOCRACY' ? 30 : 60;
      nation.unrest = oldType === 'DEMOCRACY' ? 45 : 15;
      nation.approvalRating = 50;
      if (nation.regimeType === 'DEMOCRACY') {
        nation.electionCountdown = 52;
      } else {
        nation.electionCountdown = 0;
      }

      onLogTerminal(`CONSTITUTIONAL OVERWRITE: Override successful. ${nation.name} state converted from ${oldType} to ${nation.regimeType}.`);
      playSyntheticSound('success');
      return next;
    });
  };

  const spending = c.spending || { healthcare: 25, infrastructure: 25, military: 25, research: 25 };

  return (
    <div className="h-full flex flex-col bg-[#0a0c0f] overflow-hidden p-3 gap-3 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#1e2535] pb-2">
        <div>
          <h2 className="text-white text-md font-black tracking-wider uppercase font-sans flex items-center gap-2">
            <Scale className="w-5 h-5 text-yellow-500" />
            SOVEREIGN CABINET WORKSPACE
          </h2>
          <p className="text-[10px] text-slate-500 uppercase mt-0.5">// ADMIN STATUTES / CONSTITUTIONAL LAWS FOR {c.name.toUpperCase()}</p>
        </div>
        <div className="bg-[#11141b] border border-yellow-700/50 px-3 py-1 text-yellow-500 rounded-terminal text-xs font-bold leading-none uppercase">
          {c.regimeType} STATE
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
        {/* Left Card: National Integrity Oversight */}
        <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-900 pb-1 mb-2">
              <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">// ADMINISTRATIVE TELEMETRY</span>
            </div>

            <div className="space-y-2 mt-3">
              {/* Approval Rating progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9.5px]">
                  <span className="text-stone-300 font-semibold uppercase">Approval Rating:</span>
                  <span className={`font-black ${c.approvalRating < 40 ? 'text-red-500' : 'text-[#00ff88]'}`}>{c.approvalRating.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded border border-slate-900 overflow-hidden">
                  <div
                    className={`h-full transition-all ${c.approvalRating < 40 ? 'bg-red-650' : 'bg-[#00ff88]'}`}
                    style={{ width: `${c.approvalRating}%` }}
                  />
                </div>
                <p className="text-[8px] text-slate-500 leading-tight">Must reside above 40% in Democracy to avoid systemic coups or re-election defeats.</p>
              </div>

              {/* Stability rating */}
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-[9.5px]">
                  <span className="text-stone-300 font-semibold uppercase">Sovereign Stability Index:</span>
                  <span className="text-yellow-500 font-black">{c.stability}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded border border-slate-900 overflow-hidden">
                  <div className="h-full bg-yellow-500 transition-all" style={{ width: `${c.stability}%` }} />
                </div>
              </div>

              {/* Unrest level */}
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-[9.5px]">
                  <span className="text-stone-300 font-semibold uppercase">Public Dissidence (Unrest):</span>
                  <span className={`font-black ${c.unrest > 80 ? 'text-red-500' : 'text-slate-350'}`}>{c.unrest}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded border border-slate-900 overflow-hidden">
                  <div
                    className={`h-full transition-all ${c.unrest > 80 ? 'bg-red-600' : 'bg-red-800/40'}`}
                    style={{ width: `${c.unrest}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cabinet Stats */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[9.5px] bg-[#141920] p-2 rounded border border-slate-900">
              <div className="text-left font-terminal">
                <span className="block text-slate-500">// TREASURY SPREAD</span>
                <span className="block font-bold text-white text-xs mt-0.5">${(c.treasuryCash / 1e12).toFixed(2)}T</span>
              </div>
              <div className="text-left font-terminal">
                <span className="block text-slate-500">// ELECTION RUN</span>
                <span className="block font-bold text-white text-xs mt-0.5">
                  {c.regimeType === 'DEMOCRACY' ? `${c.electionCountdown} WEEKS` : 'DISABLED'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-900 pt-2.5 flex flex-col gap-1.5 font-terminal">
            <button
              onClick={handleToggleMartialLaw}
              className={`w-full py-2 px-3 rounded text-[9.5px] font-black cursor-pointer uppercase transition-all flex items-center justify-center gap-1.5 border ${c.martialLaw ? 'bg-red-950/40 border-red-500 text-red-400' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
            >
              <Shield className="w-3.5 h-3.5" />
              {c.martialLaw ? 'SUSPEND MARTIAL COUPLING (CURRENTLY ACTIVE)' : 'ENFORCE MARTIAL LAW CRACKDOWN'}
            </button>
            <button
              onClick={handleToggleRegime}
              className="w-full py-2 px-3 rounded text-[9.5px] font-black bg-[#151c27] hover:bg-[#1a2536] text-blue-400 cursor-pointer border border-[#1e2535] uppercase text-center"
            >
              MUTATE CONSTITUTION (CONVERT TO {c.regimeType === 'DEMOCRACY' ? 'DICTATORSHIP' : 'DEMOCRACY'})
            </button>
          </div>
        </div>

        {/* Right Card: Budget Allocations */}
        <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-900 pb-1 mb-2 flex justify-between items-center">
              <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">// BUDGET REALLOCATION ARRAYS</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider">TOTAL MUST SUM TO 100%</span>
            </div>

            <div className="space-y-3 mt-3">
              {/* Healthcare */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-400">HEALTHCARE & MED CLEARINGS:</span>
                  <span className="text-[#00ff88] font-bold">{spending.healthcare}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={spending.healthcare}
                  onChange={(e) => handleSpendAllocation('healthcare', parseInt(e.target.value))}
                  className="w-full hover:accent-[#00ff88] accent-emerald-500"
                />
              </div>

              {/* Infrastructure */}
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-400">INFRASTRUCTURE & POWER GRID:</span>
                  <span className="text-[#00c2ff] font-bold">{spending.infrastructure}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={spending.infrastructure}
                  onChange={(e) => handleSpendAllocation('infrastructure', parseInt(e.target.value))}
                  className="w-full hover:accent-[#00c2ff] accent-blue-500"
                />
              </div>

              {/* Military */}
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-400">MILITARY PROCUREMENT & WEAPONS:</span>
                  <span className="text-red-500 font-bold">{spending.military}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={spending.military}
                  onChange={(e) => handleSpendAllocation('military', parseInt(e.target.value))}
                  className="w-full hover:accent-red-500 accent-red-700"
                />
              </div>

              {/* Research */}
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-400">R&D AND TECH INFILTRATION:</span>
                  <span className="text-yellow-400 font-bold">{spending.research}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={spending.research}
                  onChange={(e) => handleSpendAllocation('research', parseInt(e.target.value))}
                  className="w-full hover:accent-yellow-400 accent-yellow-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-2 bg-[#1b1e25] border border-slate-900 rounded text-[9.5px] leading-relaxed text-[#00ff88]/80 flex gap-2">
            <Sparkles className="w-5 h-5 text-[#00ff88] shrink-0 mt-0.5 animate-pulse" />
            <p className="uppercase font-mono">
              FISCAL STRATEGY METRIC: Ensure military alloc overrides total maintenance needs to avoid ammunition degradation and defense gaps. Higher R&D accelerates research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
