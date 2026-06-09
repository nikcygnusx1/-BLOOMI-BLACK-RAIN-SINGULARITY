import React, { useEffect, useRef, useState } from 'react';
import { SimState, Market } from '../types';
import { playSyntheticSound } from '../utils/audio';

interface TradingViewChartProps {
  state: SimState;
  activeTicker: string;
  onPlaceOrder: (side: 'buy' | 'sell', price: number, qty: number) => void;
}

type TimeRange = '1D' | '5D' | '1M' | '3M' | 'ALL';

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ state, activeTicker, onPlaceOrder }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  const [orderPrice, setOrderPrice] = useState('150');
  const [orderQty, setOrderQty] = useState('1000');
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  const market: Market | undefined = state.markets[activeTicker];

  // Monitor canvas packaging dimensions with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      // Subtract margins
      setDimensions({ width: width || 600, height: Math.max(220, height - 120) });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync pricing values when active asset ticker changes
  useEffect(() => {
    if (market) {
      setOrderPrice(market.currentPrice.toFixed(2));
    }
  }, [activeTicker, state]);

  // Handle Canvas Drawing of advanced styled graphic logs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !market) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || dimensions.width;
    const height = rect.height || dimensions.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background matching our new deep dark color theme (#0f1318)
    ctx.fillStyle = '#0f1318';
    ctx.fillRect(0, 0, width, height);

    // Filter points based on selected TimeRange
    let fullHistory = market.history || [];
    let sliceLen = 120;
    if (timeRange === '1D') sliceLen = 8;
    else if (timeRange === '5D') sliceLen = 18;
    else if (timeRange === '1M') sliceLen = 35;
    else if (timeRange === '3M') sliceLen = 70;
    
    const history = fullHistory.slice(-sliceLen);

    if (history.length === 0) {
      ctx.fillStyle = '#7a8da8';
      ctx.font = '11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CONNECTING INTER-DESK DATA FEED...', width / 2, height / 2);
      return;
    }

    const paddingLeft = 14;
    const paddingRight = 70;
    const paddingTop = 30;
    const paddingBottom = 30;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Boundaries of pricing
    let minP = Infinity;
    let maxP = -Infinity;
    let maxVol = 0;

    history.forEach((h) => {
      if (h.low < minP) minP = h.low;
      if (h.high > maxP) maxP = h.high;
      if (h.volume > maxVol) maxVol = h.volume;
    });

    const valDiff = maxP - minP || 1.0;
    const buffer = valDiff * 0.12;
    maxP += buffer;
    minP = Math.max(0.01, minP - buffer);

    // Draw horizontal grid lines and prices
    const rowsGrid = 5;
    ctx.strokeStyle = '#1e2535';
    ctx.lineWidth = 1;

    for (let i = 0; i <= rowsGrid; i++) {
      const y = paddingTop + (chartHeight * i) / rowsGrid;
      const priceVal = maxP - ((maxP - minP) * i) / rowsGrid;

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Pricing labels
      ctx.fillStyle = '#7a8da8';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`$${priceVal.toFixed(2)}`, width - paddingRight + 6, y + 3.5);
    }

    // Draw historical dataset
    const length = history.length;
    const candleW = chartWidth / length;

    // Precalculate prices coordinates
    const coords: { x: number; y: number; isBull: boolean; volume: number; idx: number }[] = [];

    history.forEach((h, idx) => {
      const x = paddingLeft + idx * candleW;
      const cX = x + candleW / 2;

      const yOpen = paddingTop + chartHeight * (1 - (h.open - minP) / (maxP - minP));
      const yClose = paddingTop + chartHeight * (1 - (h.close - minP) / (maxP - minP));
      const yHigh = paddingTop + chartHeight * (1 - (h.high - minP) / (maxP - minP));
      const yLow = paddingTop + chartHeight * (1 - (h.low - minP) / (maxP - minP));

      const isBull = h.close >= h.open;
      const themeColor = isBull ? '#00ff88' : '#ff3b5c';

      coords.push({ x: cX, y: yClose, isBull, volume: h.volume, idx });

      // Render transparent background volume columns
      const volumeBarH = (h.volume / (maxVol || 1)) * (chartHeight * 0.2);
      ctx.fillStyle = isBull ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 59, 92, 0.08)';
      ctx.fillRect(x + 1, height - paddingBottom - volumeBarH, candleW - 2, volumeBarH);

      if (chartType === 'candlestick') {
        // Draw wicks
        ctx.strokeStyle = themeColor;
        ctx.beginPath();
        ctx.moveTo(cX, yHigh);
        ctx.lineTo(cX, yLow);
        ctx.stroke();

        // Draw body core: hollow for bull, solid for bear
        const bodyW = Math.max(3, candleW * 0.72);
        const bodyH = Math.max(1.5, Math.abs(yClose - yOpen));
        if (isBull) {
          ctx.strokeStyle = themeColor;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(cX - bodyW / 2, Math.min(yOpen, yClose), bodyW, bodyH);
        } else {
          ctx.fillStyle = themeColor;
          ctx.fillRect(cX - bodyW / 2, Math.min(yOpen, yClose), bodyW, bodyH);
        }
      }
    });

    // Calculate and Draw SMA gold trend overlay
    const smaPeriod = 10;
    if (history.length >= smaPeriod) {
      const smaValues: { x: number; y: number }[] = [];
      for (let i = smaPeriod - 1; i < history.length; i++) {
        let sum = 0;
        for (let j = 0; j < smaPeriod; j++) {
          sum += history[i - j].close;
        }
        const avg = sum / smaPeriod;
        const x = paddingLeft + i * candleW + candleW / 2;
        const y = paddingTop + chartHeight * (1 - (avg - minP) / (maxP - minP));
        smaValues.push({ x, y });
      }

      if (smaValues.length > 0) {
        ctx.strokeStyle = '#ffb300';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(smaValues[0].x, smaValues[0].y);
        for (let i = 1; i < smaValues.length; i++) {
          ctx.lineTo(smaValues[i].x, smaValues[i].y);
        }
        ctx.stroke();
      }
    }

    // Drawing Line chart layout with smooth overlay gradient mapping
    if (chartType === 'line' && coords.length > 0) {
      // Create Gradient
      const lineGrad = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
      lineGrad.addColorStop(0, 'rgba(0, 194, 255, 0.3)');
      lineGrad.addColorStop(1, 'rgba(0, 102, 255, 0.001)');

      // Set line style
      ctx.strokeStyle = '#00c2ff';
      ctx.lineWidth = 1.8;
      
      // Plot pricing line map
      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x, coords[i].y);
      }
      ctx.stroke();

      // Close polygon to fill colored gradient
      ctx.lineTo(coords[coords.length - 1].x, height - paddingBottom);
      ctx.lineTo(coords[0].x, height - paddingBottom);
      ctx.closePath();
      ctx.fillStyle = lineGrad;
      ctx.fill();
    }

    // Dynamic Crosshair logic matching mouse hover overlays
    if (hoverCoord && hoverCoord.x >= paddingLeft && hoverCoord.x <= width - paddingRight) {
      // Find closest index point
      const relativeX = hoverCoord.x - paddingLeft;
      const closestIdx = Math.max(0, Math.min(length - 1, Math.floor(relativeX / candleW)));
      const closestPointX = paddingLeft + closestIdx * candleW + candleW / 2;
      const hPoint = history[closestIdx];

      if (hPoint) {
        const closestPointY = paddingTop + chartHeight * (1 - (hPoint.close - minP) / (maxP - minP));

        // Draw horizontal crosshair coordinate lines
        ctx.strokeStyle = 'rgba(0, 194, 255, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;

        // Horiz
        ctx.beginPath();
        ctx.moveTo(paddingLeft, closestPointY);
        ctx.lineTo(width - paddingRight, closestPointY);
        ctx.stroke();

        // Vert
        ctx.beginPath();
        ctx.moveTo(closestPointX, paddingTop);
        ctx.lineTo(closestPointX, height - paddingBottom);
        ctx.stroke();
        ctx.setLineDash([]); // clear dash

        // Draw pricing coordinate tag overlay box on right margin
        ctx.fillStyle = '#101726';
        ctx.strokeStyle = '#2a3550';
        ctx.lineWidth = 1;
        ctx.fillRect(width - paddingRight + 2, closestPointY - 10, paddingRight - 4, 18);
        ctx.strokeRect(width - paddingRight + 2, closestPointY - 10, paddingRight - 4, 18);

        ctx.fillStyle = '#00c2ff';
        ctx.font = 'bold 9px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`$${hPoint.close.toFixed(2)}`, width - paddingRight/2, closestPointY + 2);

        // Highlight pricing coordinate text headers
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`DATE: ${hPoint.date} // SPOT CLOSE: $${hPoint.close.toFixed(2)} // VOL: ${hPoint.volume.toLocaleString()}`, paddingLeft + 150, paddingTop - 12);
      }
    } else {
      // Default info banner
      ctx.fillStyle = '#00c2ff';
      ctx.font = 'bold 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${activeTicker} // REAL-TIME MARKET ORDER BOOK GRAPH`, paddingLeft, paddingTop - 12);
    }

  }, [dimensions, market, activeTicker, chartType, timeRange, hoverCoord]);

  const handleOrderSubmit = (side: 'buy' | 'sell') => {
    const parsedPrice = parseFloat(orderPrice);
    const parsedQty = parseFloat(orderQty);
    if (!isNaN(parsedPrice) && !isNaN(parsedQty)) {
      onPlaceOrder(side, parsedPrice, parsedQty);
      // Play synthetic order confirmation sound
      playSyntheticSound('order');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoverCoord({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1318] border border-[#1e2535] rounded-terminal overflow-hidden font-mono" ref={containerRef}>
      
      {/* Chart Headers with OHLC or Line Toggles & Range Selectors */}
      <div className="h-10 bg-[#141920] border-b border-[#1e2535] flex items-center justify-between px-3 select-none">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#00c2ff] font-bold tracking-wider font-terminal uppercase">{activeTicker} DOCKET</span>
          
          <div className="flex bg-[#0f1318] border border-[#1e2535] rounded-terminal p-0.5 ml-2.5">
            <button 
              onClick={() => { setChartType('candlestick'); playSyntheticSound('tick'); }}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-terminal uppercase cursor-pointer ${chartType === 'candlestick' ? 'bg-[#00c2ff] text-[#0a0c0f]' : 'text-slate-400 hover:text-white'}`}
            >
              Candle
            </button>
            <button 
              onClick={() => { setChartType('line'); playSyntheticSound('tick'); }}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-terminal uppercase cursor-pointer ${chartType === 'line' ? 'bg-[#00c2ff] text-[#0a0c0f]' : 'text-slate-400 hover:text-white'}`}
            >
              Line
            </button>
          </div>
        </div>

        {/* Range Selector Options */}
        <div className="flex gap-1 bg-[#0f1318] border border-[#1e2535] rounded-terminal p-0.5">
          {(['1D', '5D', '1M', '3M', 'ALL'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => { setTimeRange(r); playSyntheticSound('tick'); }}
              className={`text-[9px] px-1.5 py-0.5 rounded-terminal font-bold cursor-pointer uppercase ${timeRange === r ? 'text-[#00c2ff] border-b border-[#00c2ff]' : 'text-slate-400 hover:text-white'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#0f1318]">
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 block w-full h-full cursor-crosshair"
        />
      </div>

      {/* Structured Order Execution Terminal Docker Panel */}
      <div className="h-[120px] bg-[#141920] border-t border-[#1e2535] p-3 grid grid-cols-1 md:grid-cols-2 gap-3 select-none">
        
        {/* Ticket controls and fields */}
        <div className="flex flex-col gap-2 justify-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400 font-terminal">PRICE USD</span>
              <input 
                type="text" 
                value={orderPrice} 
                onChange={e => setOrderPrice(e.target.value)}
                className="bg-[#0f1318] border border-[#1e2535] px-2 py-0.5 rounded-terminal outline-none text-[11px] text-[#00c2ff] font-terminal w-24 focus:border-[#00c2ff]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400 font-terminal">CONTRACTS</span>
              <input 
                type="text" 
                value={orderQty} 
                onChange={e => setOrderQty(e.target.value)}
                className="bg-[#0f1318] border border-[#1e2535] px-2 py-0.5 rounded-terminal outline-none text-[11px] text-[#00c2ff] font-terminal w-20 focus:border-[#00c2ff]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleOrderSubmit('buy')}
              className="flex-1 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 hover:to-emerald-600/20 text-[#00ff88] border border-emerald-500/40 text-[10px] font-bold py-1 px-3 rounded-terminal cursor-pointer tracking-wider font-terminal uppercase"
            >
              LONG BUY (ACQUIRE / COVER)
            </button>
            <button 
              onClick={() => handleOrderSubmit('sell')}
              className="flex-1 bg-gradient-to-r from-rose-500/20 to-rose-600/10 hover:from-rose-500/30 hover:to-rose-600/20 text-[#ff3b5c] border border-rose-500/40 text-[10px] font-bold py-1 px-3 rounded-terminal cursor-pointer tracking-wider font-terminal uppercase"
            >
              SHORT SELL (DUMP / CONTRACT)
            </button>
          </div>
        </div>

        {/* Selected Asset specifications indicator */}
        {market && (
          <div className="text-[9.5px] font-terminal text-slate-300 flex flex-col justify-center gap-1 border-l border-[#1e2535] pl-4">
            <div className="flex justify-between border-b border-[#1e2535] pb-0.5">
              <span className="text-slate-500">ASSET CODE:</span>
              <span className="text-white font-bold">{market.ticker} // {market.type.toUpperCase()}</span>
            </div>
            <div className="flex justify-between border-b border-[#1e2535] pb-0.5">
              <span className="text-slate-500">SPOT PRICE:</span>
              <span className="text-[#00ff88] font-bold">${market.currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DEP TH LIMIT:</span>
              <span>BIDS: {market.orderBook.bids.length} contracts | ASKS: {market.orderBook.asks.length} contracts</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
