/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimState, Country } from '../types';
import { Landmark, TrendingUp, Sparkles, DollarSign, Key } from 'lucide-react';

interface EconomyPanelProps {
  state: SimState;
  onModifyState: (modifier: (prev: SimState) => SimState) => void;
  onLogTerminal: (msg: string, isErr?: boolean) => void;
  playSyntheticSound: (type: 'tick' | 'order' | 'click' | 'alert' | 'success') => void;
}

export const EconomyPanel: React.FC<EconomyPanelProps> = ({
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
        NO ECONOMY OVERLAYS FOUND FOR NATIONALITY: {playerNationality}
      </div>
    );
  }

  const handleSetRate = (rate: number) => {
    onModifyState((prev) => {
      const next = { ...prev };
      const nation = next.countries[playerNationality];
      if (nation) {
        nation.centralBank.rate = rate;
        nation.interestRate = rate;
        onLogTerminal(`MONETARY SHIFT: Central Bank prime rate modified to ${(rate * 100).toFixed(2)}%.`);
        playSyntheticSound('success');
      }
      return next;
    });
  };

  const handleModifyTax = (field: 'income' | 'capitalGains' | 'corporate', val: number) => {
    onModifyState((prev) => {
      const next = { ...prev };
      const nation = next.countries[playerNationality];
      if (nation && nation.taxRates) {
        nation.taxRates[field] = val;
        onLogTerminal(`FISCAL AMENDMENT: Adjusted ${field.toUpperCase()} tax rate to ${(val * 100).toFixed(0)}%.`);
        playSyntheticSound('success');
      }
      return next;
    });
  };

  const handleTogglePrinting = () => {
    onModifyState((prev) => {
      const next = { ...prev };
      const nation = next.countries[playerNationality];
      if (nation) {
        nation.centralBank.printingPressOverride = !nation.centralBank.printingPressOverride;
        if (nation.centralBank.printingPressOverride) {
          onLogTerminal('PUPPET EMBARGO ACTIVED: Free printing press initiated. Accumulating $5.0B in dynastic reserves per weekly tick, hyperinflation triggers.');
        } else {
          onLogTerminal('PUPPET EMBARGO SHUTDOWN: Restored autonomous sovereign control limits.');
        }
        playSyntheticSound('order');
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0c0f] overflow-hidden p-3 gap-3 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#1e2535] pb-2">
        <div>
          <h2 className="text-white text-md font-black tracking-wider uppercase font-sans flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-500" />
            CENTRAL BANK INTELLIGENCE CONSOLE
          </h2>
          <p className="text-[10px] text-slate-500 uppercase mt-0.5">// Monetization Schemes, Bond Yield curves, and Fiscal Auditing for {c.name.toUpperCase()}</p>
        </div>
        <div className="bg-[#0b1219] border border-emerald-950 px-3.5 py-1 rounded-terminal text-emerald-400 text-xs font-black flex items-center gap-1.5 font-mono">
          <DollarSign className="w-3.5 h-3.5" />
          TREASURY: ${(c.treasuryCash / 1e12).toFixed(3)}T
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
        {/* Left Side: Monetary Policy */}
        <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col justify-between gap-3">
          <div>
            <div className="border-b border-slate-900 pb-1 mb-2.5">
              <span className="text-[#00c2ff] font-bold text-[9px] uppercase tracking-wide">// CENTRAL BANK OVERLAY</span>
            </div>

            <div className="space-y-4">
              {/* Interest Rate controls */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9.5px]">
                  <span className="text-stone-300 font-semibold uppercase">Discount Prime Rate:</span>
                  <span className="text-emerald-400 font-black">{(c.interestRate * 100).toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.20"
                  step="0.005"
                  value={c.interestRate}
                  onChange={(e) => handleSetRate(parseFloat(e.target.value))}
                  className="w-full hover:accent-emerald-400 accent-emerald-600"
                />
                <p className="text-[8px] text-slate-500">Raising interest premium curbs inflation but slows GDP expansion and raises local bond stress.</p>
              </div>

              {/* Printing press trigger card */}
              <div className="bg-[#141920] border border-slate-900 p-2.5 rounded flex items-center justify-between mt-3 font-terminal">
                <div>
                  <span className="block text-white font-bold text-[10.5px] uppercase">Direct Monetary Seizure</span>
                  <p className="text-[8.5px] text-slate-400 mt-0.5 leading-snug w-56 uppercase">
                    Override the central reserve system boards. Monetizes $5,000,000,000 to family assets on every single week.
                  </p>
                </div>
                <button
                  onClick={handleTogglePrinting}
                  className={`py-1.5 px-3 rounded text-[9.5px] font-black cursor-pointer uppercase transition-all ${c.centralBank.printingPressOverride ? 'bg-red-650 hover:bg-red-500 text-black shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'bg-slate-950 border border-slate-800 text-slate-400'}`}
                >
                  {c.centralBank.printingPressOverride ? 'PRINTING: ON' : 'MONETIZE'}
                </button>
              </div>
            </div>

            {/* Macro Statistics list */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[9px] font-mono">
              <div className="bg-slate-950/70 p-2 border border-slate-900 rounded font-terminal">
                <span className="text-slate-500 block uppercase">MONEY SUPPLY (M2):</span>
                <span className="text-white block font-black text-xs mt-0.5">${(c.moneySupply / 1e12).toFixed(2)}T</span>
              </div>
              <div className="bg-slate-950/70 p-2 border border-slate-900 rounded font-terminal">
                <span className="text-slate-500 block uppercase">BONDS ISSUED:</span>
                <span className="text-white block font-black text-xs mt-0.5">${(c.bondsIssued / 1e12).toFixed(2)}T</span>
              </div>
              <div className="bg-slate-950/70 p-2 border border-slate-900 rounded font-terminal">
                <span className="text-slate-500 block uppercase">INFLATION RATE:</span>
                <span className={`block font-black text-xs mt-0.5 ${(c.inflation || 0) > 0.05 ? 'text-red-400' : 'text-slate-300'}`}>
                  {((c.inflation || 0) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 border border-slate-900 rounded font-terminal">
                <span className="text-slate-500 block uppercase">UNEMPLOYMENT RA:</span>
                <span className="text-white block font-black text-xs mt-0.5">{((c.unemployment || 0) * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tax Codes */}
        <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col justify-between gap-3">
          <div>
            <div className="border-b border-slate-900 pb-1 mb-2.5">
              <span className="text-yellow-500 font-bold text-[9px] uppercase tracking-wide">// FISCAL CODES MATRIX</span>
            </div>

            <div className="space-y-4">
              {/* Income Tax */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9.5px]">
                  <span className="text-stone-300 font-semibold uppercase">Personal Income Tax:</span>
                  <span className="text-white font-bold">{((c.taxRates?.income || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.05"
                  value={c.taxRates?.income || 0.30}
                  onChange={(e) => handleModifyTax('income', parseFloat(e.target.value))}
                  className="w-full hover:accent-yellow-400 accent-yellow-600"
                />
              </div>

              {/* Corporate Tax */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9.5px]">
                  <span className="text-stone-300 font-semibold uppercase">Corporate Operations Tax:</span>
                  <span className="text-white font-bold">{((c.taxRates?.corporate || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.05"
                  value={c.taxRates?.corporate || 0.20}
                  onChange={(e) => handleModifyTax('corporate', parseFloat(e.target.value))}
                  className="w-full hover:accent-yellow-400 accent-yellow-600"
                />
              </div>

              {/* Capital Gains Tax */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9.5px]">
                  <span className="text-stone-300 font-semibold uppercase">Financing Capital Gains Tax:</span>
                  <span className="text-white font-bold">{(((c.taxRates as any)?.capitalGains || 0.20) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.40"
                  step="0.05"
                  value={(c.taxRates as any)?.capitalGains || 0.20}
                  onChange={(e) => handleModifyTax('capitalGains', parseFloat(e.target.value))}
                  className="w-full hover:accent-yellow-400 accent-yellow-600"
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#1b1f25] border border-slate-900 rounded text-[9.5px] text-[#00ff88]/80 leading-snug flex gap-2">
            <Sparkles className="w-5 h-5 text-[#00ff88] shrink-0 mt-0.5" />
            <p className="uppercase">
              SOVEREIGN SPREADS: Higher corporate tax rates generate massive immediate revenues but weaken corporate expansions and cause layoffs which spikes unrest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
