import React, { useState } from 'react';
import { SimState } from '../types';
import { playSyntheticSound } from '../utils/audio';

interface FundOpsPanelProps {
  state: SimState;
  onHireAnalyst: (id: string, salary: number) => void;
  onFireAnalyst: (id: string) => void;
  onSendLPReport: (reportText: string) => void;
  lpResponse: string | null;
  lpLoading: boolean;
}

export const FundOpsPanel: React.FC<FundOpsPanelProps> = ({
  state,
  onHireAnalyst,
  onFireAnalyst,
  onSendLPReport,
  lpResponse,
  lpLoading
}) => {
  const [reportInput, setReportInput] = useState('');

  // Calculate Asset breakdown values
  let stocksValue = 0;
  (Object.entries(state.player?.assets?.stocks || {}) as [string, number][]).forEach(([ticker, qty]) => {
    const price = state.markets[ticker]?.currentPrice || 0;
    stocksValue += qty * price;
  });

  let cryptoValue = 0;
  (Object.entries(state.player?.assets?.crypto || {}) as [string, number][]).forEach(([ticker, qty]) => {
    const price = state.markets[ticker]?.currentPrice || 0;
    cryptoValue += qty * price;
  });

  let bondsValue = 0;
  (Object.entries(state.player?.assets?.bonds || {}) as [string, number][]).forEach(([countryId, amt]) => {
    bondsValue += amt;
  });

  let shortLiabilities = 0;
  (Object.entries(state.shorts || {}) as [string, { qty: number; avgPrice: number }][]).forEach(([ticker, data]) => {
    if (data && data.qty > 0) {
      const price = state.markets[ticker]?.currentPrice || 0;
      shortLiabilities += data.qty * price;
    }
  });

  const netEquity = state.player.cash + stocksValue + cryptoValue + bondsValue - shortLiabilities;
  const grossPositions = stocksValue + cryptoValue + shortLiabilities;
  const leverageRatio = netEquity > 0 ? (grossPositions / netEquity) : 0;

  const handleReportSubmit = () => {
    if (reportInput.trim()) {
      onSendLPReport(reportInput);
      setReportInput('');
      playSyntheticSound('order');
    }
  };

  return (
    <div className="p-3 flex flex-col gap-3 overflow-y-auto h-full text-xs bg-[#0b0c10] text-[#e8edf5]">
      
      {/* Top Banner: Fund Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-[#141920] border border-[#1e2535] p-2.5 rounded-terminal">
        <div>
          <span className="text-[9px] text-slate-400 block tracking-wider uppercase">GROSS POSITION VALUE</span>
          <span className="text-sm font-terminal font-bold text-[#00c2ff]">${grossPositions.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block tracking-wider uppercase">PORTFOLIO NET EQUITY</span>
          <span className="text-sm font-terminal font-bold text-[#00ff88]">${netEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block tracking-wider uppercase">ACTIVE LEVERAGE INDEX</span>
          <span className="text-sm font-terminal font-bold text-[#ffaa00]">{leverageRatio.toFixed(2)}x (SPOT 3X MAX)</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block tracking-wider uppercase">CAREER DESIGNATION</span>
          <span className="text-sm font-display font-bold text-white uppercase">{state.careerStage}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* Module 1: Capital Breakdown */}
        <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col gap-2">
          <h3 className="text-white font-display font-medium tracking-tight text-xs uppercase border-b border-[#1e2535] pb-1 flex justify-between">
            <span>Capital Allocation Ledger</span>
            <span className="text-[#00c2ff]">NAV DEPLOYMENT</span>
          </h3>

          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between items-center text-slate-300 font-terminal">
              <span>LIQUID CASH ACCOUNT:</span>
              <span className="font-bold text-[#00ff88]">${state.player.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 font-terminal">
              <span>STOCK MARKET ASSETS (LONG):</span>
              <span className="font-bold text-white">${stocksValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 font-terminal">
              <span>CRYPTO LEDGERS (LONG):</span>
              <span className="font-bold text-[#00c2ff]">${cryptoValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 font-terminal">
              <span>SOVEREIGN DEBT REGISTRY:</span>
              <span className="font-bold text-white">${bondsValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 font-terminal border-b border-[#1e2535] pb-1.5">
              <span>SHORT CONSTITUENTS LIABILITIES:</span>
              <span className="font-bold text-[#ff3b5c]">-${shortLiabilities.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>

            <div className="mt-1 flex flex-col gap-1 text-[10px] bg-[#141920] p-2 border border-[#1e2535] rounded-terminal">
              <span className="text-[9px] text-slate-400">STAGE PROGRESSION CRITERIA:</span>
              {state.careerStage === 'Family Office' && (
                <div className="text-slate-300">
                  Escape Level 1 requirements: Accumulate <span className="text-[#00ff88] font-bold font-terminal">$100,000,000</span> Net Equity and maintain a Sharpe ratio above <span className="text-[#00c2ff] font-bold font-terminal">1.0</span>.
                </div>
              )}
              {state.careerStage === 'Emerging Manager' && (
                <div className="text-slate-300">
                  Ascend to Level 3 Titan: Accumulate <span className="text-[#00ff88] font-bold font-terminal">$1,000,000,000</span> Net Equity and keep Max Drawdown below <span className="text-[#ff3b5c] font-bold font-terminal">20%</span>.
                </div>
              )}
              {state.careerStage === 'Institutional Titan' && (
                <div className="text-slate-300">
                  Global Hegemony active. Outperform baseline indexes and manipulate Central Bank print overrides at nodes.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Module 2: LP Advisory & Quarterly Update */}
        <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col gap-2">
          <h3 className="text-white font-display font-medium tracking-tight text-xs uppercase border-b border-[#1e2535] pb-1">
            LP Relations & Report Desk
          </h3>
          <p className="text-[10px] text-slate-400 leading-snug">
            Sovereign LPs demand rigorous oversight on returns stability. File periodic updates explaining tactical capital overlays or risk mitigation strategies.
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <textarea
              value={reportInput}
              onChange={(e) => setReportInput(e.target.value)}
              placeholder="e.g., De-leveraging equities and shorting high-unrest sovereign sectors to preserve drawdowns..."
              className="bg-[#0a0c0f] border border-[#1e2535] p-2.5 rounded-terminal outline-none text-[#e8edf5] text-[11px] font-terminal h-[65px] focus:border-[#00c2ff] resize-none"
            />
            
            <button
              onClick={handleReportSubmit}
              disabled={lpLoading || !reportInput.trim()}
              className={`font-semibold text-[10px] tracking-wider py-1.5 px-3 rounded-terminal uppercase cursor-pointer ${lpLoading ? 'bg-[#141920] text-slate-500 border border-[#1e2535]' : 'bg-[#00c2ff] text-[#0a0c0f] hover:opacity-90 font-bold'}`}
            >
              {lpLoading ? 'COMMITTEE REVIEW IN PROGRESS...' : 'TRANSMIT UPDATE TO LPS'}
            </button>

            {/* Response Box */}
            {lpResponse && (
              <div className="bg-[#141920] border border-[#2a3550] p-2 rounded-terminal font-terminal text-[10.5px] leading-relaxed text-slate-300 max-h-[110px] overflow-y-auto">
                <span className="text-[#00c2ff] font-bold block mb-1 uppercase tracking-wider">[LP MEMORANDUM DISPATCH]</span>
                {lpResponse}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module 3: Analyst Talent Desk */}
      <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col gap-2.5">
        <h3 className="text-white font-display font-medium tracking-tight text-xs uppercase border-b border-[#1e2535] pb-1">
          AI Quantitative Analyst Division
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Active Hires */}
          <div className="flex flex-col gap-2">
            <span className="text-[10.5px] text-[#00c2ff] font-bold uppercase tracking-wider">ACTIVE DESK STRENGTH</span>
            {(state.hiredAnalysts || []).length === 0 ? (
              <div className="text-slate-500 text-[10.5px] p-3 border border-dashed border-[#1e2535] text-center rounded-terminal">
                NO ANALYSTS CONVICTS ACTIVE. VISIT TALENT MATRIX TO ACQUIRE ALPHA GENERATORS.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                {(state.hiredAnalysts || []).map((analyst) => (
                  <div key={analyst.id} className="bg-[#141920] border border-[#1e2535] p-2.5 rounded-terminal flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white text-[11.5px]">{analyst.name}</span>
                        <span className="text-[9px] text-[#00c2ff] block uppercase">{analyst.specialty}</span>
                      </div>
                      <button
                        onClick={() => { onFireAnalyst(analyst.id); playSyntheticSound('warning'); }}
                        className="text-[9px] text-rose-400 border border-rose-900/40 hover:bg-rose-950/20 px-1.5 py-0.5 rounded-terminal cursor-pointer"
                      >
                        DISCHARGE
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-[#1e2535] mt-1 pt-1 font-terminal">
                      <span>SALARY DEBIT: <span className="text-[#ff3b5c] font-bold">${analyst.salary.toLocaleString()}/MO</span></span>
                      <span className="text-slate-300">REPORTS ARCHIVED: {analyst.reports?.length || 0}</span>
                    </div>

                    {/* Show latest report brief */}
                    {analyst.reports && analyst.reports.length > 0 && (
                      <div className="text-[9.5px] text-slate-300 leading-snug bg-[#0f1318] p-1.5 border border-[#1e2535] rounded-terminal mt-1 font-terminal">
                        <span className="text-[#ffaa00] font-bold block mb-1 uppercase tracking-wider">LATEST BRIEF ({analyst.reports[0].date})</span>
                        {analyst.reports[0].text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hiring Pool recruitment options */}
          <div className="flex flex-col gap-2">
            <span className="text-[10.5px] text-[#00ff88] font-bold uppercase tracking-wider">RECRUITMENT MATRIX</span>
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
              {(state.hiringPool || []).map((candidate) => {
                const isAlreadyHired = (state.hiredAnalysts || []).some(a => a.id === candidate.id);
                return (
                  <div key={candidate.id} className="bg-[#141920] border border-[#1e2535] p-2 rounded-terminal flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white uppercase">{candidate.name} ({candidate.tier})</span>
                        <span className="text-[9px] text-[#7a8da8] block uppercase font-terminal">{candidate.specialty}</span>
                      </div>
                      <button
                        onClick={() => { onHireAnalyst(candidate.id, candidate.salary); playSyntheticSound('order'); }}
                        disabled={isAlreadyHired || state.player.cash < Math.floor(candidate.salary / 4)}
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-terminal uppercase cursor-pointer ${isAlreadyHired ? 'bg-[#0f1318] text-slate-500 border border-[#1e2535] cursor-not-allowed' : 'bg-[#00ff88] text-[#0a0c0f] hover:opacity-90'}`}
                      >
                        {isAlreadyHired ? 'SECURED' : 'HIRE'}
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-[#1e2535] mt-1 pt-1 font-terminal">
                      <span>MONTHLY DRAWS: <span className="text-white font-bold">${candidate.salary.toLocaleString()}</span></span>
                      <span>SPECIALTY DEPLOYMENT ENABLED</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
