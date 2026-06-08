import React from 'react';
import { SimState, Market } from '../types';
import { playSyntheticSound } from '../utils/audio';

interface MarketsHeatmapProps {
  state: SimState;
  onSelectTicker: (ticker: string) => void;
  activeTicker: string;
}

export const MarketsHeatmap: React.FC<MarketsHeatmapProps> = ({ state, onSelectTicker, activeTicker }) => {
  const sectors = [
    { name: 'AI & SEMICONDUCTORS', symbols: ['APLH', 'DRAG'] },
    { name: 'DEFENSE & HEAVY INDUSTRIAL', symbols: ['VANC', 'GLOB'] },
    { name: 'MACRO REVENUE & ENERGY', symbols: ['HELI', 'SINO'] },
    { name: 'SYSTEMIC BANKS & CORES', symbols: ['NORD', 'MEDI'] },
    { name: 'GENOMIC ENGINEERING', symbols: ['GENE'] },
    { name: 'DEFI LAYER-1 NETWORKS', symbols: ['ETHP', 'SOLV'] }
  ];

  const getHeatmapColor = (sym: string) => {
    const market = state.markets[sym];
    if (!market) return 'bg-[#141920] border-[#1e2535]';
    const hist = market.history[market.history.length - 2];
    const prevClose = hist ? hist.close : market.currentPrice;
    const change = ((market.currentPrice - prevClose) / prevClose) * 100;

    if (change > 3) return 'bg-emerald-950/40 text-[#00ff88] border-emerald-500/50 hover:bg-emerald-900/40 cursor-pointer';
    if (change > 0.1) return 'bg-emerald-900/20 text-[#00ff88] border-emerald-950 hover:bg-emerald-900/30 cursor-pointer';
    if (change < -3) return 'bg-rose-950/40 text-[#ff3b5c] border-rose-500/50 hover:bg-rose-900/40 cursor-pointer';
    if (change < -0.1) return 'bg-rose-900/20 text-[#ff3b5c] border-rose-950 hover:bg-rose-900/30 cursor-pointer';
    return 'bg-[#141920] text-slate-300 border-[#1e2535] hover:bg-[#1a2030] cursor-pointer';
  };

  const getPriceChange = (sym: string) => {
    const market = state.markets[sym];
    if (!market) return '0.00%';
    const hist = market.history[market.history.length - 2];
    const prevClose = hist ? hist.close : market.currentPrice;
    const change = ((market.currentPrice - prevClose) / prevClose) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  const handleSectorClick = (sym: string) => {
    onSelectTicker(sym);
    playSyntheticSound('tick');
  };

  const selectedMarket = state.markets[activeTicker];

  return (
    <div className="p-3 flex flex-col gap-3 overflow-y-auto h-full text-xs font-mono bg-[#0b0c10] text-[#e8edf5]">
      
      {/* Sector Heatmap Grid */}
      <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal select-none">
        <h3 className="text-white font-display font-medium tracking-tight text-xs uppercase border-b border-[#1e2535] pb-1.5 mb-2.5 flex justify-between">
          <span>Global Sector Heatmap Grid</span>
          <span className="text-[#00c2ff]">ALPHA CONCENTRATION</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {sectors.map((sector) => (
            <div key={sector.name} className="bg-[#141920] border border-[#1e2535] p-2 rounded-terminal flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider">{sector.name}</span>
              <div className="grid grid-cols-2 gap-2">
                {sector.symbols.map((sym) => (
                  <div
                    key={sym}
                    onClick={() => handleSectorClick(sym)}
                    className={`p-2 border rounded-terminal flex flex-col gap-0.5 transition-all text-center select-none ${getHeatmapColor(sym)} ${activeTicker === sym ? 'ring-1 ring-[#00c2ff]' : ''}`}
                  >
                    <span className="font-bold text-[12px]">{sym}</span>
                    <span className="text-[10px]">${(state.markets[sym]?.currentPrice || 0).toFixed(2)}</span>
                    <span className="text-[9px] font-bold opacity-80">{getPriceChange(sym)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
        
        {/* Macro Sovereign Indexes */}
        <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col gap-2">
          <h3 className="text-white font-display font-medium tracking-tight text-xs uppercase border-b border-[#1e2535] pb-1.5 mb-1.5 flex justify-between">
            <span>Sovereign Geopolitics & Debt Matrix</span>
            <span className="text-[#ffaa00]">MACRO</span>
          </h3>
          
          <div className="flex flex-col gap-1.5">
            {Object.values(state.countries).map((country: any) => (
              <div key={country.id} className="bg-[#141920] border border-[#1e2535] p-2 rounded-terminal flex justify-between items-center text-[11px] font-terminal">
                <div>
                  <span className="font-bold text-white uppercase text-xs">{country.name} ({country.id})</span>
                  <div className="flex gap-2 text-[9px] text-slate-400 mt-0.5">
                    <span>GDP SPREAD: {country.gdpGrowth >= 0 ? '+' : ''}{(country.gdpGrowth*100).toFixed(1)}%</span>
                    <span>INFLATION: {(country.inflation*100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#e8edf5] block">YIELD: {(country.bondYield*100).toFixed(2)}%</span>
                  <span className={`text-[9.5px] font-bold uppercase ${country.centralBank.printingPressOverride ? 'text-[#00ff88]' : 'text-slate-500'}`}>
                    {country.centralBank.printingPressOverride ? 'SYSTEM_OVERRIDE_ACTIVE' : 'STANDBY_CENTRAL'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Asset Detail Pane / Order Box */}
        {selectedMarket && (
          <div className="bg-[#0f1318] border border-[#1e2535] p-3 rounded-terminal flex flex-col gap-2.5 select-none">
            <h3 className="text-white font-display font-medium tracking-tight text-xs uppercase border-b border-[#1e2535] pb-1.5 flex justify-between">
              <span>Selected Asset Specifications</span>
              <span className="text-[#00c2ff]">{selectedMarket.ticker} DETAILS</span>
            </h3>

            <div className="flex-1 flex flex-col gap-1 text-[11px] pt-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>SECURITY TICKER:</span>
                <span className="font-bold text-white font-terminal">{selectedMarket.ticker}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>SECURITY TYPE:</span>
                <span className="font-bold text-slate-400 uppercase">{selectedMarket.type}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 border-b border-[#1e2535] pb-1.5 mt-1">
                <span>CURRENT SPOT VALUATION:</span>
                <span className="font-bold text-[#00ff88] font-terminal">${selectedMarket.currentPrice.toFixed(2)}</span>
              </div>

              {/* Order Book Liquidity depths representation */}
              <div className="mt-2.5">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider block mb-1">REAL-TIME ORDER DEPTH</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-terminal text-center">
                  <div className="bg-[#141920] border border-emerald-900/30 p-1.5 rounded-terminal">
                    <span className="text-[#00ff88] font-bold block">BUY BIDS VOLUME</span>
                    <span className="text-slate-200 mt-1 block">
                      {selectedMarket.orderBook.bids.reduce((sum, b) => sum + b.quantity, 0).toLocaleString()} CONTRACTS
                    </span>
                  </div>
                  <div className="bg-[#141920] border border-rose-900/30 p-1.5 rounded-terminal">
                    <span className="text-[#ff3b5c] font-bold block">SELL ASKS VOLUME</span>
                    <span className="text-slate-200 mt-1 block">
                      {selectedMarket.orderBook.asks.reduce((sum, a) => sum + a.quantity, 0).toLocaleString()} CONTRACTS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
