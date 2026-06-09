/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimState, Country } from '../types';
import { Shield, Sparkles, AlertTriangle, Globe2, Handshake } from 'lucide-react';

interface DiplomacyPanelProps {
  state: SimState;
  onModifyState: (modifier: (prev: SimState) => SimState) => void;
  onLogTerminal: (msg: string, isErr?: boolean) => void;
  playSyntheticSound: (type: 'tick' | 'order' | 'click' | 'alert' | 'success') => void;
}

export const DiplomacyPanel: React.FC<DiplomacyPanelProps> = ({
  state,
  onModifyState,
  onLogTerminal,
  playSyntheticSound
}) => {
  const playerNationality = state.player?.nationality || 'US';

  const handleLobbyAlliance = (countryId: string, alliance: 'NATO' | 'BRICS' | 'NEUTRAL') => {
    const cost = 250000000; // $250M

    if (state.player.cash < cost) {
      onLogTerminal(`LOBBY ACTION REJECTED: Diplomatic channels require $${(cost/1e6).toFixed(0)}M cash. Insufficient liquidity.`, true);
      playSyntheticSound('alert');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      const targetCountry = next.countries[countryId];
      if (targetCountry) {
        targetCountry.alliance = alliance;
        targetCountry.opinionOfPlayer = Math.min(100, targetCountry.opinionOfPlayer + 15);
        next.player.cash -= cost;
        onLogTerminal(`DIPLOMATIC COUPLING SUCCESS: Lobbying successfully pivoted ${targetCountry.name} to alliance focus [${alliance}]. opinion rating increased.`);
        playSyntheticSound('success');
      }
      return next;
    });
  };

  const handleIncreaseOpinion = (countryId: string) => {
    const cost = 75000000; // $75M

    if (state.player.cash < cost) {
      onLogTerminal(`DIPLOMACY SPREAD REJECTED: Core lobbies demand $75M cash payment.`, true);
      playSyntheticSound('alert');
      return;
    }

    onModifyState((prev) => {
      const next = { ...prev };
      const targetCountry = next.countries[countryId];
      if (targetCountry) {
        targetCountry.opinionOfPlayer = Math.min(100, targetCountry.opinionOfPlayer + 20);
        next.player.cash -= cost;
        onLogTerminal(`DIPLOMATIC ENDORSEMENT EXEC: Transferred aid blocks to ${targetCountry.name}. General opinion elevated.`);
        playSyntheticSound('success');
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
            <Globe2 className="w-5 h-5 text-blue-500 animate-spin" />
            GEOPOLITICAL ALLIANCE MATRIX
          </h2>
          <p className="text-[10px] text-slate-500 uppercase mt-0.5">// Treaty Alignments, Diplomatic Opinion Ledger, and Lobby Offices</p>
        </div>
        <div className="bg-[#11141b] border border-blue-900 px-3 py-1.5 text-blue-400 text-xs font-black flex items-center gap-1.5 rounded-terminal">
          MAJOR NATIONS: {Object.keys(state.countries || {}).length} CORES
        </div>
      </div>

      {/* Diplomatic Ledger */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
        {Object.values(state.countries).map((country) => {
          const opinionColor = country.opinionOfPlayer > 65 ? 'text-[#00ff88]' : country.opinionOfPlayer > 35 ? 'text-yellow-500' : 'text-red-500';
          const isPlayerHome = country.id === playerNationality;

          return (
            <div key={country.id} className="bg-[#0f1318] border border-slate-900/80 p-3 rounded-terminal flex flex-col justify-between gap-3 font-terminal">
              <div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-2">
                  <span className="text-white font-bold text-[10.5px] uppercase tracking-wide flex items-center gap-1.5">
                    <Handshake className="w-4 h-4 text-slate-400" />
                    {country.name} {isPlayerHome && <span className="text-blue-400 text-[8px] font-sans font-black tracking-tight">[SOVEREIGN ORIGIN]</span>}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 border rounded-terminal bg-slate-950/70 border-slate-800 ${country.alliance === 'NATO' ? 'text-blue-400' : country.alliance === 'BRICS' ? 'text-red-400' : 'text-slate-400'}`}>
                    {country.alliance} treaty
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2.5 text-[9.5px]">
                  <div className="flex justify-between border-r border-[#1a2230]/40 pr-2">
                    <span className="text-slate-500 uppercase">Opinion of Player:</span>
                    <span className={`font-bold ${opinionColor}`}>{country.opinionOfPlayer}%</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span className="text-slate-500 uppercase">Regime Type:</span>
                    <span className="text-slate-200 uppercase font-black">{country.regimeType}</span>
                  </div>
                  <div className="flex justify-between border-r border-[#1a2230]/40 pr-2 mt-1">
                    <span className="text-slate-500 uppercase">stability status:</span>
                    <span className="text-yellow-500 font-bold">{country.stability}%</span>
                  </div>
                  <div className="flex justify-between pl-2 mt-1">
                    <span className="text-slate-500 uppercase">public unrest:</span>
                    <span className="text-[#ff3b5c] font-bold">{country.unrest}%</span>
                  </div>
                </div>
              </div>

              {/* Lobby Triggers */}
              <div className="border-t border-slate-900 pt-3 flex flex-wrap gap-1.5 justify-end">
                <button
                  onClick={() => handleIncreaseOpinion(country.id)}
                  className="bg-blue-950/20 hover:bg-blue-950 border border-blue-900/60 text-blue-400 font-black text-[8px] py-1 px-2.5 uppercase rounded cursor-pointer transition-all h-6"
                >
                  Increase Opinion ($75M)
                </button>
                <button
                  onClick={() => handleLobbyAlliance(country.id, 'NATO')}
                  disabled={country.alliance === 'NATO'}
                  className="bg-slate-950/50 border border-blue-900/40 hover:bg-blue-950/70 text-blue-300 font-black text-[8px] py-1 px-2 uppercase rounded cursor-pointer transition-all h-6 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Lobby NATO
                </button>
                <button
                  onClick={() => handleLobbyAlliance(country.id, 'BRICS')}
                  disabled={country.alliance === 'BRICS'}
                  className="bg-slate-950/50 border border-red-900/40 hover:bg-red-950/70 text-red-300 font-black text-[8px] py-1 px-2 uppercase rounded cursor-pointer transition-all h-6 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Lobby BRICS
                </button>
                <button
                  onClick={() => handleLobbyAlliance(country.id, 'NEUTRAL')}
                  disabled={country.alliance === 'NEUTRAL'}
                  className="bg-slate-950/50 border border-slate-700 hover:bg-slate-900 text-slate-300 font-black text-[8px] py-1 px-2 uppercase rounded cursor-pointer transition-all h-6 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Lobby NEUTRAL
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
