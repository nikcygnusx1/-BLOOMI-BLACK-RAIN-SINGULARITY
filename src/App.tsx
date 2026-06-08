import React, { useState, useEffect, useRef } from 'react';
import { createInitialWorld, saveSimState, loadSimState } from './sim/state';
import { GeopoliticalOmegaEngine } from './sim/engines';
import { SimState, DynastyMember } from './types';
import { TradingViewChart } from './components/TradingViewChart';
import { InfluenceWeb } from './components/InfluenceWeb';
import { DynastyTree } from './components/DynastyTree';
import { MacroPanel } from './components/MacroPanel';
import { CorporatePanel } from './components/CorporatePanel';
import { IntelligencePanel } from './components/IntelligencePanel';
import { CharacterCreator } from './components/CharacterCreator';
import { FundOpsPanel } from './components/FundOpsPanel';
import { MarketsHeatmap } from './components/MarketsHeatmap';
import { playSyntheticSound } from './utils/audio';
import { 
  Skull, 
  Activity, 
  Terminal as TermIcon, 
  TrendingUp, 
  Globe, 
  Pocket, 
  Network, 
  Radio, 
  ShieldAlert, 
  UserCheck, 
  Coins,
  MessageSquare,
  Briefcase,
  Layers,
  Sparkles,
  Award,
  BookOpen,
  PieChart,
  DollarSign
} from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<SimState | null>(null);
  const [activeTab, setActiveTab] = useState<'HELP' | 'TRADING' | 'CORPORATE' | 'MACRO' | 'INFLUENCE' | 'DYNASTY' | 'INTELLIGENCE' | 'OPERATION' | 'MARKETS'>('TRADING');
  const [selectedTicker, setSelectedTicker] = useState('APLH');
  
  // CLI State
  const [cliInput, setCliInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'SYSTEM SYSTEMA CORE CHANNELS ONLINE...',
    'TYPE "/help" IN TERMINAL PROMPT FOR ACCESS CODES.'
  ]);

  // LP & Chat states
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'CABLES' | 'TRAUMA'>('ALL');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [lpResponse, setLpResponse] = useState<string | null>(null);
  const [lpLoading, setLpLoading] = useState(false);

  // Core Simulation Ticker Ticks loop runner
  const [isPaused, setIsPaused] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const loopRef = useRef<NodeJS.Timeout | null>(null);

  // Track Career Stage to trigger transition animation
  const [prevStage, setPrevStage] = useState<string>('Family Office');
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);

  // Initialize from LocalStorage autosave or direct onboard creator
  useEffect(() => {
    const saved = loadSimState();
    if (saved) {
      setGameState(saved);
      setPrevStage(saved.careerStage || 'Family Office');
      setTerminalLogs(prev => [...prev, 'STATE RESTORATION: Loaded existing autosave state ledger.']);
    }
  }, []);

  // System ticking interval loop
  useEffect(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    if (isPaused || !gameState) return;

    const intervalTime = 1000 / speedMultiplier;
    loopRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return null;
        const nextState = GeopoliticalOmegaEngine.tick({ ...prev });
        
        // Check for stage progression celebration
        if (nextState.careerStage !== prevStage) {
          setPrevStage(nextState.careerStage);
          setShowLevelUpCelebration(true);
          playSyntheticSound('profit');
          // Auto-dim after 5.5s
          setTimeout(() => {
            setShowLevelUpCelebration(false);
          }, 5500);
        }

        // Auto-save state every 15 ticks of progress
        if (nextState.currentTick % 15 === 0) {
          saveSimState(nextState);
        }
        return nextState;
      });
    }, intervalTime);

    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [isPaused, speedMultiplier, gameState?.currentTick, prevStage]);

  if (!gameState) {
    return (
      <CharacterCreator 
        onComplete={(params) => {
          const state = createInitialWorld(params);
          setGameState(state);
          setPrevStage(state.careerStage || 'Family Office');
          setTerminalLogs(prev => [
            ...prev,
            `SYNDICATE ORIGIN SET: Host account created for ${params.name.toUpperCase()}.`,
            `INCEPTION FUNDS ALLOCATED: $${params.capital.toLocaleString()} generated as dynastic reserve.`
          ]);
        }}
      />
    );
  }

  // --- CALCULATION OF INTEGRATED FINANCIAL RISK METRICS ---
  let stocksValue = 0;
  (Object.entries(gameState.player.assets.stocks) as [string, number][]).forEach(([t, q]) => {
    stocksValue += q * (gameState.markets[t]?.currentPrice || 0);
  });

  let cryptoValue = 0;
  (Object.entries(gameState.player.assets.crypto) as [string, number][]).forEach(([t, q]) => {
    cryptoValue += q * (gameState.markets[t]?.currentPrice || 0);
  });

  let bondsValue = 0;
  (Object.entries(gameState.player.assets.bonds) as [string, number][]).forEach(([cId, heldAmt]) => {
    bondsValue += heldAmt;
  });

  let shortsValue = 0;
  (Object.entries(gameState.shorts || {}) as [string, { qty: number; avgPrice: number }][]).forEach(([t, data]) => {
    if (data && data.qty > 0) {
      shortsValue += data.qty * (gameState.markets[t]?.currentPrice || 0);
    }
  });

  const portfolioAUM = gameState.player.cash + stocksValue + cryptoValue + bondsValue - shortsValue;
  
  // Sharpe Ratio
  const returns = gameState.lastDailyReturns || [];
  const meanRet = returns.reduce((sum, r) => sum + r, 0) / (returns.length || 1);
  const varianceRet = returns.reduce((sum, r) => sum + Math.pow(r - meanRet, 2), 0) / (returns.length || 1);
  const volRet = Math.sqrt(varianceRet) || 0.01;
  const annualizedVol = volRet * Math.sqrt(52);
  const sharpeRatio = annualizedVol > 0.001 ? (meanRet * 52 - 0.04) / annualizedVol : 0.0;

  // Drawdown
  const currentDrawdown = gameState.highWaterMark > portfolioAUM ? ((gameState.highWaterMark - portfolioAUM) / gameState.highWaterMark) * 100 : 0;

  // Beta relative to Benchmark Index
  const bReturns = gameState.benchmarkReturns || [];
  const bMean = bReturns.reduce((sum, r) => sum + r, 0) / (bReturns.length || 1);
  let cov = 0;
  let bVar = 0.0001;
  for (let i = 0; i < Math.min(returns.length, bReturns.length); i++) {
    cov += (returns[i] - meanRet) * (bReturns[i] - bMean);
    bVar += Math.pow(bReturns[i] - bMean, 2);
  }
  const betaVal = cov / bVar;

  // Concentration: Largest position vs gross value
  const valuesArray = [
    ...(Object.entries(gameState.player.assets.stocks) as [string, number][]).map(([t, q]) => q * (gameState.markets[t]?.currentPrice || 0)),
    ...(Object.entries(gameState.player.assets.crypto) as [string, number][]).map(([t, q]) => q * (gameState.markets[t]?.currentPrice || 0))
  ];
  const stockMax = Math.max(...valuesArray, 0);
  const concentrationPct = portfolioAUM > 0 ? (stockMax / portfolioAUM) * 100 : 0;

  // Value at Risk (VaR)
  const valueAtRisk = portfolioAUM * 1.65 * volRet * Math.sqrt(52) * 0.15;

  // Performance P&L
  const pnlPercent = meanRet * 100;

  // Helper bindings for simulation actions
  const handleBuyBonds = (countryId: string, amount: number) => {
    if (gameState.player.cash < amount) {
      logToTerminal('REJECTED: Insufficient liquidity capital assets.', true);
      return;
    }
    setGameState((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      next.player.cash -= amount;
      next.player.assets.bonds[countryId] = (next.player.assets.bonds[countryId] || 0) + amount;
      
      const country = next.countries[countryId];
      const ratio = country.bondsIssued / (country.gdp || 1);
      const yieldRate = country.interestRate + Math.max(0.001, (ratio - 0.5) * 0.05);

      logToTerminal(`SOVEREIGN LEVERAGE: Sponsoring $${amount.toLocaleString()} sovereign bonds on ${countryId} yields ${(yieldRate * 100).toFixed(2)}% APY.`);
      next.cables.push({
        time: `${next.date} 10:11:12`,
        source: 'Sovereign_Bonds',
        message: `PLAYER SPONSORED: Extracted sovereign depth in ${countryId}. Balance flow returned.`,
        classification: 'CONFIDENTIAL'
      });
      return next;
    });
  };

  const handleToggleMonetize = (countryId: string) => {
    setGameState((prev) => {
      if (!prev) return null;
      return GeopoliticalOmegaEngine.toggleCentralBankMonetize({ ...prev }, countryId);
    });
    logToTerminal(`PRINTING TOGGLE: Moneterization override toggled for ${countryId}.`);
  };

  const handleTakeover = (ticker: string) => {
    const corp = gameState.companies.find(c => c.ticker === ticker);
    if (!corp) return;
    const spot = gameState.markets[ticker]?.currentPrice || corp.sharePrice;
    const publicShares = corp.shareholders['retail_public'] || 0;
    const cost = publicShares * spot * 1.25;

    if (gameState.player.cash < cost) {
      logToTerminal('REJECTED: Insufficient cash to execute hostile private takeovers.', true);
      return;
    }

    setGameState((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      const nextCorp = next.companies.find(c => c.ticker === ticker)!;
      next.player.cash -= cost;
      next.player.assets.stocks[ticker] = (next.player.assets.stocks[ticker] || 0) + publicShares;
      nextCorp.shareholders['player_dynasty'] = (nextCorp.shareholders['player_dynasty'] || 0) + publicShares;
      nextCorp.shareholders['retail_public'] = 0;
      
      logToTerminal(`HOSTILE TAKEOVER: ${corp.name} (${ticker}) purchased out. board controlled assigned entirely to Dynasty.`);
      return next;
    });
  };

  const handleLayoffs = (ticker: string) => {
    setGameState((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      const corpIndex = next.companies.findIndex(c => c.ticker === ticker);
      if (corpIndex !== -1) {
        const corp = next.companies[corpIndex];
        corp.layoffsPercentage += 0.20; // Another 20% fired
        corp.expenses = corp.expenses * 0.90; // operational cash cost drops
        logToTerminal(`LAYOFF ACTION: Restructured corps margins at ${ticker}. 20% labor assets liquidated.`);
      }
      return next;
    });
  };

  const handleHireStaff = (role: 'analysts' | 'informants' | 'lobbyists', cost: number) => {
    if (gameState.player.cash < cost) {
      logToTerminal('REJECTED: Insufficient assets for human resource deployments.', true);
      return;
    }
    setGameState((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      next.player.cash -= cost;
      next.player.assets[role] = (next.player.assets[role] || 0) + 1;
      logToTerminal(`DEPLOYMENT SUCCESS: Sponsored 1 ${role.toUpperCase()} operational matrix.`);
      return next;
    });
  };

  const handleNarrativeBomb = (countryId: string, ticker: string) => {
    if (gameState.player.cash < 10000000000) {
      logToTerminal('REJECTED: Narrative war operations require $10 Billion investment.', true);
      return;
    }
    setGameState((prev) => {
      if (!prev) return null;
      return GeopoliticalOmegaEngine.executeCognitiveStrike({ ...prev }, countryId, ticker);
    });
    logToTerminal(`DETONATION PROTOCOL: Deepfake narrative strike triggered on ${ticker} inside ${countryId}.`);
  };

  const handleSomaticEdits = () => {
    if (gameState.player.cash < 5000000000000) {
      logToTerminal('REJECTED: Eugenics Somatic Editing requires $5.0 Trillion.', true);
      return;
    }
    setGameState((prev) => {
      if (!prev) return null;
      return GeopoliticalOmegaEngine.investGeneticSomaticCore({ ...prev });
    });
    logToTerminal('EUGENICS SEQUENCING: Transgenic somatic edits launched on dynastic heirs.');
  };

  const handleHeirSpawn = (name: string, role: typeof gameState.dynasty.members[0]['role']) => {
    setGameState((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      const cost = 25; // prestige cost
      if (next.dynasty.prestige < cost) {
        logToTerminal('REJECTED: Genetic lineages recruits requires 25 dynasty prestige points.', true);
        return next;
      }
      next.dynasty.prestige -= cost;
      next.dynasty.members.push({
        name,
        role,
        age: 18,
        status: 'Alive',
        sociopathyIndex: 60,
        geneticEdits: ['Somatic Base Matrix']
      });
      logToTerminal(`DYNASTY RECRUITMENT: ${name.toUpperCase()} seeded as family heirs.`);
      return next;
    });
  };

  // Support shorts natively in limits placements
  const handleLimitOrder = (side: 'buy' | 'sell', price: number, qty: number) => {
    const totalCap = price * qty;
    if (side === 'buy' && gameState.player.cash < totalCap) {
      logToTerminal('REJECTED: Insufficient cash funds to match buy order constraints.', true);
      return;
    }

    setGameState((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      const market = next.markets[selectedTicker];
      if (market) {
        market.orderBook[side === 'buy' ? 'bids' : 'asks'].push({
          id: Math.random().toString(),
          side,
          price,
          quantity: qty,
          owner: 'player_dynasty',
          timestamp: Date.now()
        });
        logToTerminal(`ORDER PLACED: Added ${side.toUpperCase()} limit on ${selectedTicker} at $${price.toFixed(2)} (Qty: ${qty})`);
      }
      return next;
    });
  };

  const logToTerminal = (text: string, isError: boolean = false) => {
    setTerminalLogs(prev => [...prev, `${isError ? 'ERROR // ' : 'SYS_OUT // '} ${text}`]);
  };

  // Chat Actions
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user' as const, timestamp: new Date().toLocaleTimeString().substring(0, 5), text: chatInput };
    
    // Add locally to chat log
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chatLogs: [...(prev.chatLogs || []), userMsg]
      };
    });
    setChatInput('');
    setChatLoading(true);
    playSyntheticSound('tick');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...(gameState?.chatLogs || []), userMsg],
          context: {
            date: gameState?.date,
            aum: portfolioAUM,
            cash: gameState?.player.cash,
            careerStage: gameState?.careerStage,
            positions: gameState?.player.assets.stocks,
            bonds: gameState?.player.assets.bonds,
            marketPrices: Object.fromEntries(
              (Object.entries(gameState?.markets || {}) as [string, any][]).map(([t, m]) => [t, m.currentPrice])
            ),
            riskMetrics: {
              sharpe: sharpeRatio,
              maxDrawdown: currentDrawdown,
              volatility: annualizedVol * 100,
              beta: betaVal,
              concentration: concentrationPct
            }
          }
        })
      });

      const data = await res.json();
      const assistantMsg = { sender: 'analyst' as const, timestamp: new Date().toLocaleTimeString().substring(0, 5), text: data.text || 'Analyst connection failed.' };
      
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          chatLogs: [...(prev.chatLogs || []), assistantMsg]
        };
      });
      playSyntheticSound('profit');
    } catch (err) {
      console.error(err);
      const errAlert = { sender: 'analyst' as const, timestamp: '', text: 'DOWNLINK INTERRUPTED: Offline telemetry active.' };
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          chatLogs: [...(prev.chatLogs || []), errAlert]
        };
      });
    } finally {
      setChatLoading(false);
    }
  };

  // Fund Ops analyst hires
  const handleHireAnalyst = (id: string, salary: number) => {
    setGameState((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      const candidateIndex = next.hiringPool.findIndex(c => c.id === id);
      if (candidateIndex === -1) return next;
      const candidate = next.hiringPool[candidateIndex];

      next.hiredAnalysts.push({
        id: candidate.id,
        name: candidate.name,
        salary: candidate.salary,
        specialty: candidate.specialty,
        reports: []
      });
      next.hiringPool.splice(candidateIndex, 1);
      logToTerminal(`ANALYST HIRED: Recruited AI Quantitative Analyst ${candidate.name.toUpperCase()}.`);
      return next;
    });
  };

  const handleFireAnalyst = (id: string) => {
    setGameState((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      const index = next.hiredAnalysts.findIndex(a => a.id === id);
      if (index === -1) return next;
      const analyst = next.hiredAnalysts[index];

      next.hiringPool.push({
        id: analyst.id,
        name: analyst.name,
        salary: analyst.salary,
        specialty: analyst.specialty,
        tier: 'Senior'
      });
      next.hiredAnalysts.splice(index, 1);
      logToTerminal(`ANALYST DISCHARGED: Terminated contract for ${analyst.name.toUpperCase()}.`);
      return next;
    });
  };

  const handleSendLPReport = async (reportText: string) => {
    setLpLoading(true);
    setLpResponse(null);
    try {
      const response = await fetch('/api/lp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText,
          context: {
            aum: portfolioAUM,
            quarterlyPnL: `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(1)}%`,
            riskMetrics: {
              maxDrawdown: currentDrawdown,
              sharpe: sharpeRatio,
              concentration: concentrationPct
            }
          }
        })
      });
      const data = await response.json();
      setLpResponse(data.text || 'LPs acknowledged your report with no specific parameters.');
    } catch (err) {
      console.error(err);
      setLpResponse('LPs offline. Report logged into terminal local registers.');
    } finally {
      setLpLoading(false);
    }
  };

  // --- BLOOMBERG PROFESSIONAL UNIFIED COMMAND SYSTEM ---
  const executeUnifiedCommand = (rawString: string) => {
    const cmd = rawString.toUpperCase().trim();
    if (!cmd) return;

    logToTerminal(`BBG> ${rawString}`);
    playSyntheticSound('tick');

    // Help commands
    if (cmd === 'HELP' || cmd === 'HELP <GO>' || cmd === '/HELP' || cmd === 'F1' || cmd === 'F1 <GO>') {
      setActiveTab('HELP');
      logToTerminal('WORKSTATUS: LOADED F1 [HELP] USER GUIDE.');
      return;
    }

    // Tab navigation keys
    if (cmd === 'F2' || cmd === 'F2 <GO>' || cmd === 'EQUITY' || cmd === 'EQUITY <GO>') {
      setActiveTab('TRADING');
      return;
    }
    if (cmd === 'F3' || cmd === 'F3 <GO>' || cmd === 'CORP' || cmd === 'CORP <GO>') {
      setActiveTab('CORPORATE');
      return;
    }
    if (cmd === 'F4' || cmd === 'F4 <GO>' || cmd === 'GOV' || cmd === 'GOV <GO>' || cmd === 'GOVT' || cmd === 'GOVT <GO>') {
      setActiveTab('MACRO');
      return;
    }
    if (cmd === 'F5' || cmd === 'F5 <GO>' || cmd === 'LOBBY' || cmd === 'LOBBY <GO>' || cmd === 'INFLUENCE' || cmd === 'INFLUENCE <GO>') {
      setActiveTab('INFLUENCE');
      return;
    }
    if (cmd === 'F6' || cmd === 'F6 <GO>' || cmd === 'FOUND' || cmd === 'FOUND <GO>' || cmd === 'DYNASTY' || cmd === 'DYNASTY <GO>') {
      setActiveTab('DYNASTY');
      return;
    }
    if (cmd === 'F7' || cmd === 'F7 <GO>' || cmd === 'INTEL' || cmd === 'INTEL <GO>') {
      setActiveTab('INTELLIGENCE');
      return;
    }
    if (cmd === 'F8' || cmd === 'F8 <GO>' || cmd === 'OPER' || cmd === 'OPER <GO>' || cmd === 'OPERATION' || cmd === 'OPERATION <GO>') {
      setActiveTab('OPERATION');
      return;
    }
    if (cmd === 'F9' || cmd === 'F9 <GO>' || cmd === 'MKT' || cmd === 'MKT <GO>' || cmd === 'MARKET' || cmd === 'MARKET <GO>' || cmd === 'MARKETS' || cmd === 'MARKETS <GO>') {
      setActiveTab('MARKETS');
      return;
    }

    // Normalize command string
    let clean = cmd.replace(/(<GO>|GO)$/, '').trim();
    clean = clean.replace(/\[/g, '').replace(/\]/g, '').trim();

    const stepStages = clean.split('|').map(s => s.trim());

    stepStages.forEach((stage) => {
      const parts = stage.split(/\s+/);
      if (parts.length === 0 || !parts[0]) return;

      const action = parts[0];

      // Dynamic ticker navigation
      if (gameState) {
        const tickerKeys = Object.keys(gameState.markets);
        if (tickerKeys.includes(action)) {
          setSelectedTicker(action);
          setActiveTab('TRADING');
          logToTerminal(`SECURITY CHOSEN: DIRECTED TO ${action} EQUITY CONTRACT.`);
          return;
        }

        // Dynamic country bonds navigation
        const countryKeys = Object.keys(gameState.countries);
        if (countryKeys.includes(action)) {
          setActiveTab('MACRO');
          logToTerminal(`SOVEREIGN CHOSEN: DIRECTED TO ${action} CREDIT MATRIX.`);
          return;
        }
      }

      // Unified action programs
      switch (action) {
        case 'BUY':
        case '/BUY': {
          if (parts.length < 4) return logToTerminal('REJECTED: BUY <ticker> <price> <qty> [GO]', true);
          const ticker = parts[1].toUpperCase();
          const p = parseFloat(parts[2]);
          const q = parseInt(parts[3]);
          setSelectedTicker(ticker);
          handleLimitOrder('buy', p, q);
          break;
        }

        case 'SELL':
        case '/SELL': {
          if (parts.length < 4) return logToTerminal('REJECTED: SELL <ticker> <price> <qty> [GO]', true);
          const ticker = parts[1].toUpperCase();
          const p = parseFloat(parts[2]);
          const q = parseInt(parts[3]);
          setSelectedTicker(ticker);
          handleLimitOrder('sell', p, q);
          break;
        }

        case 'DEBT':
        case '/DEBT': {
          if (parts.length < 3) return logToTerminal('REJECTED: DEBT <countryId> <amount> [GO]', true);
          const country = parts[1].toUpperCase();
          let rawAmt = parts[2].toLowerCase();
          let amount = parseFloat(rawAmt);
          if (rawAmt.endsWith('b')) amount *= 1000000000;
          if (rawAmt.endsWith('m')) amount *= 1000000;
          handleBuyBonds(country, amount);
          break;
        }

        case 'STRIKE':
        case '/STRIKE': {
          if (parts.length < 3) return logToTerminal('REJECTED: STRIKE <countryId> <ticker> [GO]', true);
          handleNarrativeBomb(parts[1].toUpperCase(), parts[2].toUpperCase());
          break;
        }

        case 'SOMATIC':
        case '/SOMATIC':
          handleSomaticEdits();
          break;

        case 'LAYOFFS':
        case '/LAYOFFS':
          if (parts.length < 2) return logToTerminal('REJECTED: LAYOFFS <ticker> [GO]', true);
          handleLayoffs(parts[1].toUpperCase());
          break;

        case 'TAKEOVER':
        case '/TAKEOVER':
          if (parts.length < 2) return logToTerminal('REJECTED: TAKEOVER <ticker> [GO]', true);
          handleTakeover(parts[1].toUpperCase());
          break;

        case 'OVERRIDES':
        case '/OVERRIDES':
          if (parts.length < 2) return logToTerminal('REJECTED: OVERRIDES <countryId> [GO]', true);
          handleToggleMonetize(parts[1].toUpperCase());
          break;

        case 'INTEL':
        case '/INTEL': {
          if (parts.length < 2) return logToTerminal('REJECTED: INTEL <analysts|informants|lobbyists> [GO]', true);
          const subType = parts[1].toUpperCase();
          if (subType === 'ANALYSTS' || subType === 'ANALYST') {
            handleHireStaff('analysts', 10000000);
          } else if (subType === 'INFORMANTS' || subType === 'INFORMANT') {
            handleHireStaff('informants', 50000000);
          } else if (subType === 'LOBBYISTS' || subType === 'LOBBYIST') {
            handleHireStaff('lobbyists', 200000000);
          } else {
            logToTerminal(`ERROR: Unknown intelligence division: ${parts[1]}`, true);
          }
          break;
        }

        default:
          logToTerminal(`ERROR: Unknown command: "${action}". Reference F1 [HELP] <GO> for command maps.`, true);
      }
    });
  };

  const handleCLISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim();
    setCliInput('');
    if (!cmd) return;
    executeUnifiedCommand(cmd);
  };

  // Live sidebar alerts compiling
  const combinedLogFeed = [];
  if (feedFilter === 'ALL' || feedFilter === 'CABLES') {
    gameState.cables.forEach(c => {
      combinedLogFeed.push({
        time: c.time,
        text: `[${c.source}] ${c.message}`,
        type: 'cable',
        classification: c.classification
      });
    });
  }
  if (feedFilter === 'ALL' || feedFilter === 'TRAUMA') {
    gameState.traumaLog.forEach(t => {
      combinedLogFeed.push({
        time: t.date,
        text: `[WORLD ESCALATION: ${t.eventType}] ${t.description} (Severity: ${t.severity}/10)`,
        type: 'trauma',
        classification: 'TOP_SECRET'
      });
    });
  }

  // Sort chronologically reverse showing latest first
  combinedLogFeed.sort((a, b) => b.time.localeCompare(a.time));

  return (
    <div className="h-screen w-screen bg-[#0a0c0f] text-[#e8edf5] font-sans text-xs overflow-hidden flex flex-col relative select-none">
      
      {/* 1. UPGRADED TOP BAR PANEL */}
      <header className="h-[38px] bg-[#0f1318] border-b border-[#1e2535] flex items-center justify-between px-3 z-10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00c2ff]" />
          <span className="font-display font-bold tracking-tight uppercase text-xs text-white">GLOBAL SOVEREIGN TERMINAL</span>
        </div>

        {/* Global Net fund information indicators */}
        <div className="flex items-center gap-4 text-[10.5px]">
          <div>AUM: <span className="text-[#00ff88] font-bold font-terminal">${portfolioAUM.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
          <div>DLY P&L: <span className={`font-bold font-terminal ${pnlPercent >= 0 ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}>{pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%</span></div>
          <div className="flex items-center gap-1">
            <span className="bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30 px-1 py-0.2 rounded-terminal text-[8px] font-bold uppercase animate-pulse">MARKETS OPEN</span>
          </div>
        </div>

        {/* Calendar and speed multi-controls */}
        <div className="flex items-center gap-3 text-[10px] text-slate-300">
          <div>TICK: <span className="text-[#00c2ff] font-bold font-terminal">{gameState.currentTick}</span></div>
          <div>DATE: <span className="text-white font-terminal">{gameState.date}</span></div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => { setIsPaused(!isPaused); playSyntheticSound('tick'); }} 
              className={`px-1.5 py-0.5 border text-[9px] cursor-pointer font-bold rounded-terminal uppercase ${isPaused ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10' : 'border-slate-500 text-slate-300'}`}
            >
              {isPaused ? 'HALTED' : 'RUNNING'}
            </button>
            <div className="flex rounded-terminal border border-[#1e2535] overflow-hidden">
              {([1, 5, 10] as number[]).map((spd) => (
                <button
                  key={spd}
                  onClick={() => { setSpeedMultiplier(spd); playSyntheticSound('tick'); }}
                  className={`px-1.5 py-0.5 text-[8.5px] cursor-pointer transition-all ${speedMultiplier === spd ? 'bg-[#00c2ff]/20 text-[#00c2ff] font-bold' : 'text-slate-400 hover:text-white bg-[#0f1318]'}`}
                >
                  {spd}X
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE PANELS CONTAINER */}
      <div className="flex-1 flex overflow-hidden z-10 bg-[#0a0c0f]">
        
        {/* LEFT COLUMN: NAVIGATION TAB WORKSPACE + INTEGRATED RISK DASHBOARD */}
        <div className="w-[320px] border-r border-[#1e2535] bg-[#0a0c0f] flex flex-col overflow-hidden shrink-0 z-10 p-2 gap-2.5">
          
          {/* Section A: Vertical Visual Tabs Lists */}
          <div className="bg-[#0f1318] border border-[#1e2535] p-2 rounded-terminal flex flex-col gap-1.5">
            <h3 className="text-slate-400 font-display font-bold uppercase text-[9px] tracking-wider mb-0.5">PLATFORM CORE SECTIONS</h3>
            
            <div className="grid grid-cols-2 gap-1.5 font-terminal">
              {[
                { id: 'HELP' as const, key: 'F1', label: 'HELP_DESK', icon: Sparkles },
                { id: 'TRADING' as const, key: 'F2', label: 'EQTY_TRADE', icon: TrendingUp },
                { id: 'CORPORATE' as const, key: 'F3', label: 'CORP_OP', icon: Briefcase },
                { id: 'MACRO' as const, key: 'F4', label: 'GOVT_BNDS', icon: Globe },
                { id: 'INFLUENCE' as const, key: 'F5', label: 'SHDW_LOBBY', icon: Network },
                { id: 'DYNASTY' as const, key: 'F6', label: 'DYNA_GENE', icon: Award },
                { id: 'INTELLIGENCE' as const, key: 'F7', label: 'INTEL_DIV', icon: Skull },
                { id: 'OPERATION' as const, key: 'F8', label: 'FUND_OPS', icon: PieChart },
                { id: 'MARKETS' as const, key: 'F9', label: 'MKT_GRID', icon: Layers }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      executeUnifiedCommand(`${tab.key} <GO>`);
                    }}
                    className={`h-[30px] px-2 flex items-center gap-1.5 rounded-terminal font-bold tracking-tight cursor-pointer transition-all border ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#00c2ff]/30 to-[#0066ff]/10 text-white border-[#00c2ff]' 
                        : 'bg-[#141920] border-[#1e2535] text-slate-400 hover:text-white hover:border-[#2a3550]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00c2ff]' : 'text-slate-500'}`} />
                    <span className="text-[9.5px] uppercase font-mono">
                      {tab.key} {tab.label.split('_')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Risk Desk Dashboard Always Visible */}
          <div className="bg-[#0f1318] border border-[#1e2535] p-2.5 rounded-terminal flex flex-col gap-2">
            <h3 className="text-white font-display font-medium tracking-tight text-[10px] uppercase border-b border-[#1e2535] pb-1 flex justify-between items-center select-none">
              <span>Risk Desk Dashboard</span>
              <span className="text-[#00c2ff] text-[9px] font-mono">SYSTEM_BASEL_IV</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-terminal">
              <div className="bg-[#141920] border border-[#1e2535] p-1.5 rounded-terminal">
                <span className="text-slate-400 text-[8px] block uppercase">SHARPE RATIO</span>
                <span className="font-bold text-[#00ff88] text-xs">{sharpeRatio.toFixed(2)}</span>
              </div>
              <div className="bg-[#141920] border border-[#1e2535] p-1.5 rounded-terminal">
                <span className="text-slate-400 text-[8px] block uppercase">MAX DRAWDOWN</span>
                <span className="font-bold text-[#ff3b5c] text-xs">{currentDrawdown.toFixed(1)}%</span>
              </div>
              <div className="bg-[#141920] border border-[#1e2535] p-1.5 rounded-terminal">
                <span className="text-slate-400 text-[8px] block uppercase">PORTFOLIO VOLATILITY</span>
                <span className="font-bold text-white text-xs">{annualizedVol >= 0 ? (annualizedVol * 100).toFixed(1) : '12.4'}%</span>
              </div>
              <div className="bg-[#141920] border border-[#1e2535] p-1.5 rounded-terminal">
                <span className="text-slate-400 text-[8px] block uppercase">BENCHMARK BETA</span>
                <span className="font-bold text-slate-300 text-xs">{betaVal ? betaVal.toFixed(2) : '0.88'}</span>
              </div>
              <div className="bg-[#141920] border border-[#1e2535] p-1.5 rounded-terminal">
                <span className="text-slate-400 text-[8px] block uppercase">CONCENTRATION INDEX</span>
                <span className="font-bold text-slate-300 text-xs">{concentrationPct.toFixed(1)}%</span>
              </div>
              <div className="bg-[#141920] border border-[#1e2535] p-1.5 rounded-terminal">
                <span className="text-slate-400 text-[8px] block uppercase">VALUE AT RISK (VaR)</span>
                <span className="font-bold text-[#ff3b5c] text-xs">${(valueAtRisk / 1e6).toFixed(1)}M</span>
              </div>
            </div>
          </div>

          {/* Section C: Live cables filter logs */}
          <div className="flex-1 bg-[#0f1318] border border-[#1e2535] rounded-terminal p-2 shrink-0 flex flex-col overflow-hidden">
            <div className="border-b border-[#1e2535] pb-1 bg-[#0f1318] flex justify-between items-center select-none shrink-0 mb-1.5">
              <span className="text-[9px] uppercase font-bold text-slate-300">
                SYS CABLES LOG
              </span>
              <div className="flex bg-[#0a0c0f] border border-[#1e2535] rounded-terminal p-0.5">
                {['ALL', 'CABLES', 'TRAUMA'].map(btn => (
                  <button
                    key={btn}
                    onClick={() => { setFeedFilter(btn as any); playSyntheticSound('tick'); }}
                    className={`text-[8px] font-bold px-1.5 py-0.5 cursor-pointer rounded-terminal ${feedFilter === btn ? 'bg-[#00c2ff]/20 text-[#00c2ff]' : 'text-slate-400 hover:text-white'}`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
              {combinedLogFeed.map((feed, idx) => (
                <div 
                  key={idx} 
                  className={`p-1.5 border rounded-terminal text-[10px] leading-tight bg-[#141920] ${
                    feed.type === 'trauma' ? 'border-rose-900/40 text-[#ff3b5c]' : 'border-[#1e2535] text-[#e8edf5]'
                  }`}
                >
                  <div className="flex justify-between items-center text-[8px] opacity-60 mb-0.5 font-terminal">
                    <span>{feed.time}</span>
                    <span className={feed.type === 'trauma' ? 'text-[#ff3b5c] font-bold' : 'text-[#00c2ff]'}>{feed.classification}</span>
                  </div>
                  <p className="font-terminal font-medium leading-normal">
                    {feed.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CENTER COMPONENT: Active main visual tabs view */}
        <div className="flex-1 flex flex-col overflow-hidden z-20 border-r border-[#1e2535] bg-[#0a0c0f]">
          {/* Tab contents visual container */}
          <div className="flex-1 overflow-hidden bg-[#0a0c0f] p-2">
            {activeTab === 'HELP' && (
              <div className="p-3 flex flex-col gap-2.5 overflow-y-auto h-full font-mono text-xs select-none bg-[#0f1318] border border-[#1e2535] rounded-terminal text-[#00c2ff]">
                <h2 className="text-[#00c2ff] font-display font-medium text-sm tracking-tight border-b border-[#1e2535] pb-1.5">
                  GLOBAL SOVEREIGN TERMINAL // COMMAND CHANNELS NAVIGATION
                </h2>
                <p className="text-[11px] text-[#e8edf5] leading-relaxed">
                  SECURE PLATFORM CORE INTEGRITY ENGAGED. CAPITALS DESK SYSTEMS AND PRIVATE ASSETS TRANSACTIONS ARE ROUTED VIA UNIFIED COMMAND DIALECTICS. ENTER THEM DIRECTLY IN THE BBG_CONSOLE SHELL BELOW.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                  <div className="border border-[#1e2535] p-2.5 bg-[#141920] rounded-terminal">
                    <h3 className="text-white font-bold text-[10px] mb-1.5 border-b border-[#1e2535] pb-1">FUNCTION SHORTCUTS</h3>
                    <div className="space-y-1 font-mono text-[9.5px] text-slate-300">
                      <div><span className="text-[#00c2ff] font-bold">F1 &lt;GO&gt;</span> - ACTIVE REQUISITIONS OPERATION GUIDE MANUAL</div>
                      <div><span className="text-[#00c2ff] font-bold">F2 &lt;GO&gt;</span> - OPEN INTERACTION SYMBOLS TRADING PANEL</div>
                      <div><span className="text-[#00c2ff] font-bold">F3 &lt;GO&gt;</span> - CORPORATE PRIVATE MARGINS DISCHARGE DIRECTIVES</div>
                      <div><span className="text-[#00c2ff] font-bold">F4 &lt;GO&gt;</span> - SOVEREIGN DEBUREAUCRACY REGISTERED STATS</div>
                      <div><span className="text-[#00c2ff] font-bold">F5 &lt;GO&gt;</span> - ACTIVE EMBASSY CONTROLS LOBBYING INTERFACE</div>
                      <div><span className="text-[#00c2ff] font-bold">F6 &lt;GO&gt;</span> - DYNAST CHROMOSOMAL AND TRAITS MATRIX</div>
                      <div><span className="text-[#00c2ff] font-bold">F7 &lt;GO&gt;</span> - INTEL BOMB STRIKES & INFORMERS RECRUIT UNIT</div>
                      <div><span className="text-[#00c2ff] font-bold">F8 &lt;GO&gt;</span> - FUND OPERATIONS PERFORMANCE & AI ANALYSTS (AUM)</div>
                      <div><span className="text-[#00c2ff] font-bold">F9 &lt;GO&gt;</span> - SECTORS HEATMAP & MACRO INDEX GRIDS</div>
                    </div>
                  </div>

                  <div className="border border-[#1e2535] p-2.5 bg-[#141920] rounded-terminal">
                    <h3 className="text-white font-bold text-[10px] mb-1.5 border-b border-[#1e2535] pb-1">DIRECT TRANSACTION CLI DIALECTICS</h3>
                    <div className="space-y-1 font-mono text-[9.5px] text-slate-300">
                      <div><span className="text-[#00ff88] font-bold">BUY &lt;TICKER&gt; &lt;PRICE&gt; &lt;QTY&gt; &lt;GO&gt;</span> - SUBMIT LONG/COVER CONTRACT</div>
                      <div><span className="text-[#ff3b5c] font-bold">SELL &lt;TICKER&gt; &lt;PRICE&gt; &lt;QTY&gt; &lt;GO&gt;</span> - SUBMIT SHORT/DUMP SELL CONTRACT</div>
                      <div><span className="text-[#e8edf5] font-bold">DEBT &lt;NAT&gt; &lt;VAL&gt; &lt;GO&gt;</span> - PURCHASE SOVEREIGN DEBT BONDS</div>
                      <div><span className="text-[#e8edf5] font-bold">OVERRIDES &lt;NAT&gt; &lt;GO&gt;</span> - OVERRIDE CB MONETERIZATION (PUPPET PRESS)</div>
                      <div><span className="text-[#e8edf5] font-bold">STRIKE &lt;NAT&gt; &lt;SYM&gt; &lt;GO&gt;</span> - INITIATE NARRATIVE DISINFO WARFARE</div>
                      <div><span className="text-[#e8edf5] font-bold">LAYOFFS &lt;SYM&gt; &lt;GO&gt;</span> - RESTRUCTURE CORPORATE WORKFORCE (EMIT 20% LABORS)</div>
                      <div><span className="text-[#e8edf5] font-bold">TAKEOVER &lt;SYM&gt; &lt;GO&gt;</span> - ACQUIRE PRIVATE COMPANY BOARD CONTROL</div>
                    </div>
                  </div>
                </div>

                <div className="border border-[#1e2535] p-2 bg-[#141920] rounded-terminal mt-2">
                  <h4 className="text-[#00c2ff] font-bold text-[9.5px] mb-1">INTERACTIVE DESK GUIDELINES</h4>
                  <p className="text-[9px] text-[#e8edf5]/80 leading-normal">
                    PORTFOLIOS EXECUTIONS DIRECTLY MAP ONTO ACTIVE DOCK GRIDS. USE PHYSICAL ACTION BUTTONS TO AUTO-TRIGGER COMMAND PARAMETERS ON DEMAND.
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'TRADING' && (
              <div className="h-full flex overflow-hidden bg-[#0a0c0f]">
                <div className="w-[185px] border-r border-[#1e2535] bg-[#0f1318] flex flex-col overflow-y-auto shrink-0 select-none rounded-terminal mr-2">
                  <div className="p-2 border-b border-[#1e2535] text-[9.5px] font-bold text-center text-[#00c2ff] bg-[#141920] uppercase font-terminal">TRADING TICKERS</div>
                  {Object.keys(gameState.markets).map(sym => (
                    <button
                      key={sym}
                      onClick={() => executeUnifiedCommand(`${sym} <GO>`)}
                      className={`text-left p-2 text-[11px] border-b border-[#1e2535] cursor-pointer flex justify-between items-center transition-all font-terminal ${selectedTicker === sym ? 'bg-[#1a2030] text-[#00c2ff] font-bold border-l-2 border-l-[#00c2ff]' : 'text-slate-300 hover:bg-[#141920]'}`}
                    >
                      <span>{sym}</span>
                      <span className="text-[10px] text-[#00ff88] font-bold font-terminal">${gameState.markets[sym]?.currentPrice.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
                <div className="flex-1 h-full bg-[#0a0c0f]">
                  {gameState && (
                    <TradingViewChart 
                      state={gameState} 
                      activeTicker={selectedTicker} 
                      onPlaceOrder={(side, price, qty) => {
                        executeUnifiedCommand(`${side.toUpperCase()} ${selectedTicker} ${price.toFixed(2)} ${qty} <GO>`);
                      }}
                    />
                  )}
                </div>
              </div>
            )}
            {activeTab === 'INFLUENCE' && (
              <InfluenceWeb 
                state={gameState} 
                onDonate={(id, amt) => {
                  setGameState((prev) => {
                    if (!prev) return null;
                    const next = { ...prev };
                    if (next.player.cash < amt) {
                      logToTerminal('REJECTED: Insufficient cash funds to purchase shadow influence nodes.', true);
                      return next;
                    }
                    next.player.cash -= amt;
                    const targetNode = next.influenceNodes.find(n => n.id === id);
                    if (targetNode) {
                      targetNode.playerControlWeight = Math.min(100, targetNode.playerControlWeight + 15);
                      logToTerminal(`LOBBY CONTRACT: Contributed $${amt.toLocaleString()} to global lobby target ${targetNode.name}. Captured weights spiked to ${targetNode.playerControlWeight.toFixed(1)}%.`);
                      playSyntheticSound('order');
                    }
                    return next;
                  });
                }}
                onTogglePrinting={handleToggleMonetize}
              />
            )}
            {activeTab === 'DYNASTY' && (
              <DynastyTree 
                state={gameState} 
                onSomaticEdits={handleSomaticEdits}
                onHeirSpawn={handleHeirSpawn}
              />
            )}
            {activeTab === 'MACRO' && (
              <MacroPanel 
                state={gameState} 
                onBuyBonds={handleBuyBonds}
                onTogglePrinting={handleToggleMonetize}
              />
            )}
            {activeTab === 'CORPORATE' && (
              <CorporatePanel 
                state={gameState} 
                onTakeover={handleTakeover}
                onLayoffs={handleLayoffs}
              />
            )}
            {activeTab === 'INTELLIGENCE' && (
              <IntelligencePanel 
                state={gameState} 
                onHireStaff={handleHireStaff}
                onNarrativeBomb={handleNarrativeBomb}
              />
            )}
            {activeTab === 'OPERATION' && (
              <FundOpsPanel
                state={gameState}
                onHireAnalyst={handleHireAnalyst}
                onFireAnalyst={handleFireAnalyst}
                onSendLPReport={handleSendLPReport}
                lpResponse={lpResponse}
                lpLoading={lpLoading}
              />
            )}
            {activeTab === 'MARKETS' && (
              <MarketsHeatmap
                state={gameState}
                onSelectTicker={setSelectedTicker}
                activeTicker={selectedTicker}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LONG / SHORT PORTFOLIO LEDGER + PERSISTENT Sovereign AI ANALYST CHAT */}
        <div className="w-[325px] bg-[#0a0c0f] flex flex-col overflow-y-auto shrink-0 select-none p-2 gap-2.5 z-10 border-l border-[#1e2535]">
          
          {/* Section A: Long & Short positions ledger table */}
          <div className="border border-[#1e2535] bg-[#0f1318] p-2.5 flex flex-col gap-1.5 rounded-terminal">
            <h3 className="text-white font-display font-medium uppercase text-[10px] tracking-tight border-b border-[#1e2535] pb-1 flex justify-between items-center">
              <span>Position Registries</span>
              <span className="text-[#00ff88] text-[9px] font-mono">LIVE_LEDGER</span>
            </h3>

            {/* LONG LIST */}
            <div>
              <span className="text-[8px] text-[#00ff88] font-bold block mb-1 uppercase tracking-wider font-terminal">// LONG CONTRACTS</span>
              <div className="flex flex-col gap-1 text-[10px] max-h-[110px] overflow-y-auto font-terminal">
                {(Object.entries(gameState.player.assets.stocks) as [string, number][]).filter(([_, qty]) => qty > 0).length === 0 ? (
                  <span className="text-slate-500 text-[9px] block">NO LONG PRIVATE EQUITY POSSESSIONS</span>
                ) : (
                  (Object.entries(gameState.player.assets.stocks) as [string, number][]).map(([tk, qty]) => {
                    if (qty <= 0) return null;
                    const price = gameState.markets[tk]?.currentPrice || 0;
                    return (
                      <div key={tk} className="flex justify-between items-center border-b border-slate-900 pb-0.5">
                        <span className="text-white font-bold">{tk} ({qty.toLocaleString()} Shrs)</span>
                        <span className="text-[#00ff88] font-bold">${(qty * price).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* SHORT LIST */}
            <div className="mt-2 text-terminal font-terminal border-t border-[#1e2535] pt-2">
              <span className="text-[8px] text-[#ff3b5c] font-bold block mb-1 uppercase tracking-wider font-terminal">// SHORT CONTRACTS</span>
              <div className="flex flex-col gap-1 text-[10px] max-h-[110px] overflow-y-auto font-terminal">
                {(Object.entries(gameState.shorts || {}) as [string, { qty: number; avgPrice: number }][]).filter(([_, data]) => data && data.qty > 0).length === 0 ? (
                  <span className="text-slate-500 text-[9px] block">NO SHORT PRIVATE ACCOUNT LIABILITIES</span>
                ) : (
                  (Object.entries(gameState.shorts) as [string, { qty: number; avgPrice: number }][]).map(([tk, data]) => {
                    if (!data || data.qty <= 0) return null;
                    const price = gameState.markets[tk]?.currentPrice || 0;
                    return (
                      <div key={tk} className="flex justify-between items-center border-b border-slate-900 pb-0.5">
                        <span className="text-slate-200">{tk} ({data.qty.toLocaleString()} Shrs)</span>
                        <span className="text-[#ff3b5c] font-bold">-${(data.qty * price).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Section B: Persistent Sovereign AI Analyst chat with Monospaced Prompt */}
          <div className="border border-[#1e2535] bg-[#0f1318] rounded-terminal p-2.5 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-[#00c2ff] font-display font-medium uppercase text-[10px] tracking-tight border-b border-[#1e2535] pb-1 flex justify-between items-center shrink-0 select-none">
              <span>SOVEREIGN AI ANALYST DESK</span>
              <span className="text-slate-500 text-[8.5px] font-mono">ONLINE // FLASH_LINK</span>
            </h3>

            {/* Chat list viewport */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-1 font-terminal my-2">
              {(gameState.chatLogs || []).map((log, idx) => (
                <div 
                  key={idx} 
                  className={`p-1.5 rounded-terminal text-[10px] leading-relaxed max-w-[92%] ${log.sender === 'user' ? 'bg-[#1a2030] text-slate-100 self-end border border-[#1e2535]' : 'bg-[#141920] text-slate-300 self-start border border-[#2a3550] border-l-2 border-l-[#00c2ff]'}`}
                >
                  <div className="flex justify-between text-[8px] opacity-50 mb-0.5 font-terminal">
                    <span>{log.sender === 'user' ? 'MANAGER' : 'SOVEREIGN_AI'}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-line leading-normal font-medium">{log.text}</p>
                </div>
              ))}
              {chatLoading && (
                <div className="bg-[#141920] text-slate-400 p-2 rounded-terminal max-w-[80%] self-start flex items-center gap-1.5 font-terminal text-[10px] border border-[#1e2535]">
                  <span className="w-2 h-2 rounded-full bg-[#00c2ff] animate-ping" />
                  ANALYZING RISK RESERVES MATRIX...
                </div>
              )}
            </div>

            {/* Monospaced Input Box */}
            <div className="flex gap-1.5 shrink-0 border-t border-[#1e2535] pt-2 font-mono">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(); }}
                placeholder="PROMPT AI DESK..."
                className="flex-1 bg-[#141920] border border-[#1e2535] px-2 py-1 outline-none text-[10.5px] text-[#00c2ff] font-terminal rounded-terminal focus:border-[#00c2ff] placeholder:text-slate-600"
              />
              <button
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-[#00c2ff] text-[#0a0c0f] hover:bg-opacity-90 font-bold px-2 rounded-terminal text-[10px] cursor-pointer"
              >
                ASK
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. HIGH DENSITY BOTTOM MARQUEE TICKER OF COMMODITIES */}
      <div className="h-5 bg-[#141920] border-t border-[#1e2535] flex items-center shrink-0 z-10 overflow-hidden relative select-none">
        <div className="animate-ticker flex gap-8 items-center font-terminal py-0.5 text-[9.5px]">
          {/* Market prices ticker list */}
          {Object.values(gameState.markets).map((m: any) => {
            const hist = m.history[m.history.length - 2];
            const isUp = hist ? m.currentPrice >= hist.close : true;
            return (
              <span 
                key={m.ticker} 
                className={`font-semibold cursor-pointer tracking-wider font-terminal uppercase transition-colors duration-150 flex items-center gap-0.5 ${isUp ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}
                onClick={() => {
                  executeUnifiedCommand(`${m.ticker} <GO>`);
                }}
              >
                {m.ticker}: ${m.currentPrice.toFixed(2)} {isUp ? '▲' : '▼'}
              </span>
            );
          })}
          {/* Breaking alerts details marquee */}
          <span className="text-slate-400 border-l border-[#1e2535] pl-6 uppercase tracking-widest font-bold">// SYSTEM REPORT DIRECTIVES:</span>
          {combinedLogFeed.slice(0, 3).map((f, i) => (
            <span key={i} className="text-white font-terminal uppercase font-bold text-[9px]">
              [{f.time}] {f.text.substring(0, 60)}...
            </span>
          ))}
        </div>
      </div>

      {/* BOTTOM CLI PROMPT SHELL INPUT */}
      <footer className="h-[125px] bg-[#0f1318] border-t border-[#1e2535] flex flex-col shrink-0 font-mono z-10">
        
        {/* Terminal log history */}
        <div className="flex-1 overflow-y-auto p-2 text-[10.5px] text-white flex flex-col gap-0.5 select-text scrollbar-thin bg-[#0a0c0f]">
          {terminalLogs.map((log, index) => {
            const isErr = log.startsWith('ERROR') || log.startsWith('REJECTED');
            const isCmd = log.includes('BBG>');
            return (
              <div 
                key={index} 
                className={`font-terminal ${isErr ? 'text-[#ff3b5c] font-bold font-terminal' : isCmd ? 'text-[#00c2ff] font-bold font-terminal' : 'text-slate-300 font-terminal'}`}
              >
                {isCmd ? <span className="text-[#00c2ff] mr-1">&gt;</span> : <span className="text-slate-600 mr-2">//</span>}
                {log}
              </div>
            );
          })}
        </div>

        {/* Input prompt bar */}
        <form 
          onSubmit={handleCLISubmit}
          className="h-[28px] bg-[#141920] border-t border-[#1e2535] flex items-center px-3 gap-1.5 shrink-0"
        >
          <TermIcon className="w-3.5 h-3.5 text-[#00c2ff]" />
          <span className="text-[#00c2ff] font-bold text-[10.5px] tracking-tight shrink-0">BBG_SHELL_&gt;</span>
          <input 
            type="text" 
            value={cliInput}
            onChange={e => setCliInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[#e8edf5] text-[11px] caret-[#00c2ff] font-mono focus:ring-0 placeholder:text-slate-600 font-terminal"
            placeholder="Type '/buy' or 'F1 <GO>' for directives manuals..."
            autoComplete="off"
          />
        </form>
      </footer>

      {/* SYSTEMIC IMMERSIVE STATIC STATUS HEADLINES footer BAR */}
      <footer className="h-[18px] bg-[#00c2ff] text-black text-[9px] flex items-center px-2.5 justify-between uppercase font-black tracking-wider shrink-0 z-50">
        <span>RUNNING telemetry DESK STATUS</span>
        <span>LEVEL STAGE: {gameState.careerStage}</span>
        <span>CLOCK TIME: {gameState.date}-T09:00:15Z</span>
        <span>SYS CODE: BBG_GLOBAL_SOVEREIGN_SYSTEM_ONLINE</span>
      </footer>

      {/* CAREER STAGE PROMOTION LEVEL-UP CELEBRATION MODAL OVERLAY */}
      {showLevelUpCelebration && (
        <div className="fixed inset-0 z-50 bg-[#0a0c0f]/90 flex flex-col items-center justify-center p-4 text-center select-none font-mono">
          <div className="max-w-xl bg-[#0f1318] border-2 border-[#00c2ff] p-6 rounded-terminal flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(0,194,255,0.4)] animate-pulse">
            <Sparkles className="w-12 h-12 text-[#00ff88] animate-bounce" />
            <h1 className="text-2xl font-display font-medium text-white tracking-wider glow-cyan">CAREER TITLE ASCENDED!</h1>
            <p className="text-slate-400 text-xs tracking-wider uppercase">Institutional Allocations Parameter Recalculated</p>
            <div className="bg-[#141920] border border-[#1e2535] p-3 rounded-terminal uppercase font-terminal text-[#00ff88] text-[11px]">
              ASCENDED LEVEL DESK STATUS TO <span className="text-white font-bold block mt-1 text-sm glow-green">{gameState.careerStage}</span>
            </div>
            <p className="text-[10.5px] text-slate-300 leading-normal max-w-md font-terminal">
              WALL STREET PRIME HOUSES HAVE CONFRIMED APEX CLEARANCE LEVEL INCREASES. EXTERNAL SYSTEM CONTRACTS APPOINTED.
            </p>
            <button 
              onClick={() => { setShowLevelUpCelebration(false); playSyntheticSound('tick'); }}
              className="mt-2 bg-[#00c2ff] text-[#0a0c0f] font-bold px-4 py-1.5 rounded-terminal uppercase tracking-widest text-[10px] cursor-pointer"
            >
              APPROVE DOCK INTERFACE CHANGES
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
