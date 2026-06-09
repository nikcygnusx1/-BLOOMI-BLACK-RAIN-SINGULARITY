/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimState, Country, WeaponSystem } from '../types';
import { Shield, Sparkles, Plus, AlertCircle, ShoppingCart } from 'lucide-react';

interface ArsenalPanelProps {
  state: SimState;
  onModifyState: (modifier: (prev: SimState) => SimState) => void;
  onLogTerminal: (msg: string, isErr?: boolean) => void;
  playSyntheticSound: (type: 'tick' | 'order' | 'click' | 'alert' | 'success') => void;
}

export const ArsenalPanel: React.FC<ArsenalPanelProps> = ({
  state,
  onModifyState,
  onLogTerminal,
  playSyntheticSound
}) => {
  const [procureCount, setProcureCount] = useState<number>(10);
  const playerNationality = state.player?.nationality || 'US';
  const c = state.countries[playerNationality];

  if (!c) {
    return (
      <div className="p-4 text-slate-500 italic text-xs font-mono">
        NO ARSENAL SPREADS UNLOCKED FOR NATIONALITY: {playerNationality}
      </div>
    );
  }

  const calculateUnitCost = (type: string) => {
    switch (type) {
      case 'ICBM': return 350000000; // $350M
      case 'JET': return 120000000;   // $120M
      case 'TANK': return 8200000;     // $8.2M
      case 'CARRIER': return 8500000000; // $8.5B
      case 'SUB': return 1800000000;     // $1.8B
      case 'CYBER': return 150000000;     // $150M
      case 'CLIMATE': return 950000000;   // $950M
      default: return 50000000;
    }
  };

  const handleProcureWeapon = (weaponId: string) => {
    const weaponSystem = c.weapons?.find(w => w.id === weaponId);
    if (!weaponSystem) return;

    const unitCost = calculateUnitCost(weaponSystem.type);
    const totalCost = unitCost * procureCount;

    if (state.player.cash < totalCost) {
      onLogTerminal(`PROCUREMENT BLOCKED: Insufficient financial reserves. Total cost is $${(totalCost / 1e6).toFixed(1)}M but family pool only contains $${(state.player.cash / 1e6).toFixed(1)}M.`, true);
      playSyntheticSound('alert');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      const nation = next.countries[playerNationality];
      if (!nation) return next;

      const targetWeapon = nation.weapons?.find(w => w.id === weaponId);
      if (targetWeapon) {
        targetWeapon.stockpile += procureCount;
        next.player.cash -= totalCost;
        onLogTerminal(`PROCUREMENT AGREEMENT EXEC: Ordered ${procureCount} units of ${targetWeapon.name}. Deducted $${(totalCost/1e6).toFixed(1)}M from family pool assets.`);
        playSyntheticSound('success');
      }
      return next;
    });
  };

  // Maintenance cost sum
  let totalWeeklyMaintenance = 0;
  if (c.weapons) {
    c.weapons.forEach(w => {
      totalWeeklyMaintenance += w.stockpile * w.maintenanceCost;
    });
  }

  // Military budget allocation from national budget
  const weeklyExpense = c.budget / 52;
  const militarySpendingPct = c.spending?.military || 25;
  const activeMilitaryBudgetWeekly = weeklyExpense * (militarySpendingPct / 100);

  const budgetHealthy = activeMilitaryBudgetWeekly >= totalWeeklyMaintenance;

  return (
    <div className="h-full flex flex-col bg-[#0a0c0f] overflow-hidden p-3 gap-3 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#1e2535] pb-2">
        <div>
          <h2 className="text-white text-md font-black tracking-wider uppercase font-sans flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500 animate-pulse" />
            ARSENAL & PROCUREMENT INTERACTIVE BOARD
          </h2>
          <p className="text-[10px] text-slate-500 uppercase mt-0.5">// Weapons systems catalogs and active procurement contracts for {c.name.toUpperCase()}</p>
        </div>
        <div className="bg-[#10141a] border border-red-950 px-3 py-1 text-red-400 text-xs font-black flex items-center gap-1.5 font-mono rounded-terminal">
          MAINTENANCE DRAIN: ${(totalWeeklyMaintenance / 1e6).toFixed(1)}M/WK
        </div>
      </div>

      {/* Grid: Procure Desk & Stock List */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
        {/* Left: Weapons list and build desk */}
        <div className="md:col-span-2 bg-[#080b0f] border border-[#1e2535] rounded-terminal p-3 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2.5">
            <span className="text-[#00c2ff] font-bold text-[9px] uppercase tracking-wide">// REVENUE SYSTEM PROCUREMENT LISTING</span>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-slate-500">BATCH QUANTITY:</span>
              <select
                value={procureCount}
                onChange={(e) => setProcureCount(parseInt(e.target.value))}
                className="bg-[#121620] border border-slate-800 text-white font-bold p-0.5 rounded text-[9.5px]"
              >
                <option value={1}>1 UNIT</option>
                <option value={5}>5 BATCH</option>
                <option value={10}>10 BATCH</option>
                <option value={50}>50 FLEET</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {c.weapons && c.weapons.map((w) => {
              const unitCost = calculateUnitCost(w.type);
              const batchCost = unitCost * procureCount;
              const canAfford = state.player.cash >= batchCost;

              return (
                <div key={w.id} className="bg-[#0f1318] border border-slate-900/60 p-2.5 rounded flex justify-between items-center">
                  <div className="text-left">
                    <span className="block font-black text-white text-[11px] uppercase tracking-wide">{w.name}</span>
                    <span className="block text-[8px] text-slate-500 uppercase mt-0.5 font-terminal">
                      Type: {w.type} | Power Rating: {w.powerRating} GW | Unit Cost: ${(unitCost/1e6).toFixed(1)}M
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="block text-slate-400 font-bold text-[10px]">{w.stockpile} DEPLOYED</span>
                      <span className="block text-[7.5px] text-slate-500">MC: ${(w.maintenanceCost/1000).toFixed(0)}K/unit/wk</span>
                    </div>
                    <button
                      onClick={() => handleProcureWeapon(w.id)}
                      disabled={!canAfford}
                      className={`py-1.5 px-3 rounded text-[9.5px] font-black cursor-pointer uppercase transition-all flex items-center gap-1 ${canAfford ? 'bg-red-650 hover:bg-red-500 text-black' : 'bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed'}`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      Procure (${(batchCost/1e6).toFixed(1)}M)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Info card and logistics health */}
        <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="border-b border-slate-900 pb-1 mb-2.5">
              <span className="text-red-500 font-bold text-[9px] uppercase tracking-wide">// LOGISTICS HEALTH SUMMARY</span>
            </div>

            <div className="space-y-4 text-[10px]">
              <div className="bg-[#141920] p-2.5 rounded border border-slate-900 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Military Spending %:</span>
                  <span className="text-white font-bold">{militarySpendingPct}% of budget</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Weekly Military Budget:</span>
                  <span className="text-white font-bold">${(activeMilitaryBudgetWeekly / 1e6).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-1.5 mt-1.5">
                  <span className="text-slate-500 uppercase">Weapons maintenance cost:</span>
                  <span className="text-white font-bold">${(totalWeeklyMaintenance / 1e6).toFixed(1)}M</span>
                </div>
              </div>

              {budgetHealthy ? (
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-900 text-[#00ff88] rounded leading-relaxed text-[9px]">
                  <span className="font-bold uppercase tracking-wider block mb-0.5">// STANDING ORDNANCE STABLE</span>
                  National defense allocation is entirely sufficient to pay weapons maintenance premiums. Stockpiles are fully static and secured.
                </div>
              ) : (
                <div className="p-2.5 bg-red-950/30 border border-red-900 text-red-400 rounded leading-relaxed text-[9px]">
                  <span className="font-bold uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 animate-bounce" />
                    BUDGET DEFICIT WARNING
                  </span>
                  National military allocation falls short of matching maintenance costs. Weapons stockpile decay sequence will execute on next weekly cycle.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-2 bg-[#1b1f25] border border-slate-900 rounded text-[9.5px] text-[#00ff88]/80 leading-snug flex gap-2">
            <Sparkles className="w-5 h-5 text-[#00ff88] shrink-0 mt-0.5 animate-spin" />
            <p className="uppercase">
              TACTICAL INTEL: Building high stockpiles spikes structural maintenance cost. Balance allocations to avoid losing assets in military logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
