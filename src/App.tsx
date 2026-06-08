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
import { LabMapView } from './components/LabMapView';
import { ResearchPanel } from './components/ResearchPanel';
import { StaffPanel } from './components/StaffPanel';
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
  DollarSign,
  Cpu,
  FlaskConical,
  Users
} from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<SimState | null>(null);
  const [activeTab, setActiveTab] = useState<'WORLD' | 'LAB_VIEW' | 'RESEARCH' | 'STAFF' | 'HELP' | 'TRADING' | 'CORPORATE' | 'MACRO' | 'INFLUENCE' | 'DYNASTY' | 'INTELLIGENCE' | 'OPERATION' | 'MARKETS' | 'AI_WAR' | 'SATELLITES' | 'DEBT' | 'SUPPLY_CHAINS'>('WORLD');
  const [selectedTicker, setSelectedTicker] = useState('APLH');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('US');
  
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
  const [resetConfirm, setResetConfirm] = useState(false);

  // Auto-revert reset confirmation after 3 seconds
  useEffect(() => {
    if (resetConfirm) {
      const timer = setTimeout(() => setResetConfirm(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [resetConfirm]);

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

  const onModifySomaticState = (modifier: (prev: SimState) => SimState) => {
    setGameState((prev) => {
      if (!prev) return null;
      return modifier({ ...prev });
    });
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

    // Help guides
    if (cmd === 'HELP' || cmd === 'HELP <GO>' || cmd === '/HELP' || cmd === 'F1' || cmd === 'F1 <GO>') {
      setActiveTab('HELP');
      logToTerminal('WORKSTATUS: LOADED F1 [HELP] SPECIFICATIONS MANUAL.');
      return;
    }

    // New Milspec Planetary Desk Shortcodes
    if (cmd === 'F2' || cmd === 'F2 <GO>' || cmd === 'WORLD' || cmd === 'WORLD <GO>') {
      setActiveTab('WORLD');
      logToTerminal('COMMAND DESK: LOADED F2 [PLN_WORLD] PLANETARY TACTICAL SCREEN.');
      return;
    }
    if (cmd === 'F3' || cmd === 'F3 <GO>' || cmd === 'MARKET' || cmd === 'MARKETS' || cmd === 'MARKETS <GO>') {
      setActiveTab('MARKETS');
      logToTerminal('COMMAND DESK: LOADED F3 [EQTY_MKT] GLOBAL MARKETS INDEX.');
      return;
    }
    if (cmd === 'F4' || cmd === 'F4 <GO>' || cmd === 'RESEARCH' || cmd === 'RESEARCH <GO>') {
      setActiveTab('RESEARCH');
      logToTerminal('COMMAND DESK: LOADED F4 [RESRCH] UPGRADE PARADIGMS.');
      return;
    }
    if (cmd === 'F5' || cmd === 'F5 <GO>' || cmd === 'AI_WAR' || cmd === 'AI_WAR <GO>') {
      setActiveTab('AI_WAR');
      logToTerminal('COMMAND DESK: LOADED F5 [AI_WAR] OMEGA COUNTER intelligence HUB.');
      return;
    }
    if (cmd === 'F6' || cmd === 'F6 <GO>' || cmd === 'SATELLITES' || cmd === 'SATELLITES <GO>') {
      setActiveTab('SATELLITES');
      logToTerminal('COMMAND DESK: LOADED F6 [SAT_ORBIT] TELESCOPIC ORBITS ROUTING.');
      return;
    }
    if (cmd === 'F7' || cmd === 'F7 <GO>' || cmd === 'DEBT' || cmd === 'DEBT <GO>') {
      setActiveTab('DEBT');
      logToTerminal('COMMAND DESK: LOADED F7 [DEBT_CONT] SOVEREIGN CDS STRESS INDEX.');
      return;
    }
    if (cmd === 'F8' || cmd === 'F8 <GO>' || cmd === 'SUPPLY' || cmd === 'SUPPLY_CHAINS' || cmd === 'SUPPLY_CHAINS <GO>') {
      setActiveTab('SUPPLY_CHAINS');
      logToTerminal('COMMAND DESK: LOADED F8 [SUP_CHAIN] COMMODITIES LITHIUM LOGISTICS.');
      return;
    }
    if (cmd === 'F9' || cmd === 'F9 <GO>' || cmd === 'STAFF' || cmd === 'STAFF <GO>') {
      setActiveTab('STAFF');
      logToTerminal('COMMAND DESK: LOADED F9 [FIELD_OPS] FIELD OPERATIVES NEURAL MATRIX.');
      return;
    }
    if (cmd === 'F10' || cmd === 'F10 <GO>' || cmd === 'DYNASTY' || cmd === 'DYNASTY <GO>') {
      setActiveTab('DYNASTY');
      logToTerminal('COMMAND DESK: LOADED F10 [DYNA_GENE] DYNASTIC CELL OVERRIDES.');
      return;
    }
    if (cmd === 'F11' || cmd === 'F11 <GO>' || cmd === 'INTEL' || cmd === 'INTEL <GO>') {
      setActiveTab('INTELLIGENCE');
      logToTerminal('COMMAND DESK: LOADED F11 [INTEL] DISINFO NARRATIVE WARFARE.');
      return;
    }
    if (cmd === 'F12' || cmd === 'F12 <GO>' || cmd === 'EQUITY' || cmd === 'TRADING' || cmd === 'TRADE') {
      setActiveTab('TRADING');
      logToTerminal('COMMAND DESK: LOADED F12 [TRADING] DERIVATIVE ORDER BOOKS BOOK.');
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
      <header className="min-h-[46px] bg-[#0a0f14] border-b border-[#1e2535] flex flex-wrap items-center justify-between px-3.5 py-1 z-10 shrink-0 select-none gap-2">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-red-500 animate-ping rounded-full shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="font-display font-black tracking-tight text-white uppercase text-[10px]">BLOOMI</span>
            <span className="text-[#00c2ff] font-mono font-bold text-[8.5px] uppercase tracking-wider block mt-0.5">BLACK RAIN SINGULARITY</span>
          </div>
        </div>

        {/* Global Net fund information indicators */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] font-mono">
          <div>AUM: <span className="text-[#00ff88] font-black">${portfolioAUM.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
          <div>CASH: <span className="text-slate-300 font-bold">${gameState.player.cash.toLocaleString()}</span></div>
          <div className="h-4 w-px bg-slate-850" />
          
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">BIOMASS:</span> 
            <span className="text-[#00ff88] font-black">{gameState.biomass || 0} CORE</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">POWER:</span>
            <span className={`font-bold ${gameState.labPowerUsed > gameState.labPowerMax ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
              {gameState.labPowerUsed || 0} / {gameState.labPowerMax || 100} MW
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">CROPS:</span>
            <span className="text-emerald-400 font-bold">{gameState.cropHealth ?? 100}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">HEAT:</span>
            <span className={`font-bold ${gameState.regulatoryHeat > 60 ? 'text-red-400 animate-pulse' : 'text-[#00c2ff]'}`}>
              {gameState.regulatoryHeat ?? 0}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">THREAT:</span>
            <span className={`font-bold ${gameState.currentWeather !== 'CLEAR' ? 'text-red-500 animate-bounce' : 'text-slate-400'}`}>
              {gameState.currentWeather !== 'CLEAR' ? gameState.currentWeather : `${(gameState.weatherThreat ?? 0).toFixed(0)}%`}
            </span>
          </div>
        </div>

        {/* Calendar and speed multi-controls */}
        <div className="flex items-center gap-3.5 text-[10px] text-slate-300 font-mono">
          <div>TICK: <span className="text-[#00c2ff] font-bold">{gameState.currentTick}</span></div>
          <div>DATE: <span className="text-white font-bold">{gameState.date}</span></div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => {
                if (!resetConfirm) {
                  setResetConfirm(true);
                  playSyntheticSound('tick');
                } else {
                  localStorage.removeItem('omega_autosave');
                  setGameState(null);
                  setResetConfirm(false);
                  playSyntheticSound('warning');
                }
              }} 
              className={`px-2 py-0.5 border text-[9px] cursor-pointer font-bold rounded-terminal uppercase transition-all duration-100 ${
                resetConfirm 
                  ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                  : 'border-red-900 text-red-500 hover:bg-red-950/30'
              }`}
            >
              {resetConfirm ? 'CONFIRM RESET?' : 'RESET'}
            </button>
            <button 
              onClick={() => { setIsPaused(!isPaused); playSyntheticSound('tick'); }} 
              className={`px-2 py-0.5 border text-[9px] cursor-pointer font-bold rounded-terminal uppercase transition-all duration-100 ${isPaused ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10' : 'border-slate-500 text-slate-300'}`}
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
          <div className="bg-[#0f1318] border border-[#1e2535] p-2 rounded-terminal flex flex-col gap-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
            <h3 className="text-[#00c2ff]/80 font-display font-bold uppercase text-[9px] tracking-wider mb-1 flex justify-between items-center px-1">
              <span>WAR ROOM COMMAND CHANNELS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </h3>
            
            <div className="grid grid-cols-2 gap-1 font-terminal">
              {[
                { id: 'WORLD' as const, key: 'F2', label: 'PLN_WORLD', icon: Globe },
                { id: 'MARKETS' as const, key: 'F3', label: 'MKT_GRID', icon: Layers },
                { id: 'RESEARCH' as const, key: 'F4', label: 'RESRCH_SYS', icon: FlaskConical },
                { id: 'AI_WAR' as const, key: 'F5', label: 'AI_COUNTER', icon: ShieldAlert },
                { id: 'SATELLITES' as const, key: 'F6', label: 'SAT_ORBIT', icon: Radio },
                { id: 'DEBT' as const, key: 'F7', label: 'DEBT_CONG', icon: Activity },
                { id: 'SUPPLY_CHAINS' as const, key: 'F8', label: 'SUP_CHAIN', icon: Network },
                { id: 'STAFF' as const, key: 'F9', label: 'FIELD_OPS', icon: Users },
                { id: 'DYNASTY' as const, key: 'F10', label: 'DYNA_GENE', icon: Award },
                { id: 'INTELLIGENCE' as const, key: 'F11', label: 'INTEL_DIV', icon: Skull },
                { id: 'TRADING' as const, key: 'F12', label: 'DER_DESK', icon: TrendingUp },
                { id: 'HELP' as const, key: 'F1', label: 'HELP_DESK', icon: Sparkles }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      executeUnifiedCommand(`${tab.key} <GO>`);
                    }}
                    className={`h-[28px] px-1.5 flex items-center gap-1 rounded-terminal font-bold tracking-tight cursor-pointer transition-all border ${
                      isActive 
                        ? 'bg-gradient-to-r from-red-950/40 via-[#00c2ff]/30 to-[#0066ff]/10 text-white border-[#00c2ff]' 
                        : 'bg-[#141920] border-[#1e2535] text-slate-400 hover:text-slate-100 hover:bg-[#1a212b]'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isActive ? 'text-[#00c2ff]' : 'text-slate-500'}`} />
                    <span className="text-[8.5px] uppercase font-mono truncate">
                      {tab.key} {tab.label}
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
            {activeTab === 'WORLD' && (
              <div className="flex flex-col h-full overflow-hidden select-none font-mono">
                {/* Tactical Title Header */}
                <div className="flex justify-between items-center bg-[#0f1318] border border-[#1e2535] p-2 rounded-terminal mb-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#ff3b5c] animate-pulse rounded-full border border-black" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">PLANETARY CODES: COORDINATES DESK</span>
                  </div>
                  <span className="text-[9px] text-[#00c2ff]/80 font-bold">OMEGA NET INFILTRATION // TACTICAL MAP VECTORS</span>
                </div>

                {/* The Master SVG map view and inspect overlays */}
                <div className="flex-1 min-h-[220px] bg-[#07090d] border border-[#1e2535] rounded-terminal overflow-hidden relative flex flex-col justify-between">
                  {/* Planetary grid background with tactical coordinates */}
                  <div className="absolute inset-x-2 top-2 flex justify-between text-[8px] text-slate-500 font-terminal pointer-events-none">
                    <span>SECTOR_0.1 // RANGE_CAP: [280-920KM]</span>
                    <span>BEARING_DIR: 88.01.12</span>
                  </div>

                  <svg viewBox="0 0 800 380" className="w-full h-full text-slate-800 z-10 flex-1">
                    <defs>
                      <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#121820" strokeWidth="0.8" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#tacticalGrid)" />

                    {/* Orbit track trajectories */}
                    <ellipse cx="400" cy="190" rx="360" ry="110" className="stroke-slate-800/60 fill-none stroke-1" style={{ strokeDasharray: '4 4' }} />
                    <ellipse cx="400" cy="190" rx="280" ry="150" className="stroke-[#00c2ff]/10 fill-none stroke-1" />

                    {/* Lines of Equities Flow (USA to EU, EU to CH, CN to USA) */}
                    <path d="M 220 150 Q 330 80 440 140" fill="none" className="stroke-[#00c2ff]/35 stroke-1" style={{ strokeDasharray: '5, 5' }}>
                      <animate attributeName="stroke-dashoffset" values="50;0" dur="4s" repeatCount="indefinite" />
                    </path>
                    <path d="M 600 170 Q 420 280 220 150" fill="none" className="stroke-rose-900/40 stroke-1" style={{ strokeDasharray: '6, 6' }}>
                      <animate attributeName="stroke-dashoffset" values="0;50" dur="5s" repeatCount="indefinite" />
                    </path>

                    {/* Continents custom visual polygons (minimal bento blueprint) */}
                    <g transform="translate(140, 110)" className="cursor-pointer" onClick={() => { setSelectedRegionId('US'); playSyntheticSound('tick'); }}>
                      <polygon points="10,20 80,10 140,40 160,80 120,110 50,115" className={`fill-none stroke-2 transition-colors ${selectedRegionId === 'US' ? 'stroke-[#00ff88] fill-[#00ff88]/5' : 'stroke-slate-700/60 hover:stroke-slate-400'}`} />
                      <text x="45" y="72" className={`text-[9.5px] font-bold ${selectedRegionId === 'US' ? 'fill-[#00ff88]' : 'fill-slate-500'}`}>US_HQ_VAULT</text>
                    </g>

                    <g transform="translate(400, 90)" className="cursor-pointer" onClick={() => { setSelectedRegionId('EU'); playSyntheticSound('tick'); }}>
                      <polygon points="20,10 90,5 110,60 80,95 25,85" className={`fill-none stroke-2 transition-colors ${selectedRegionId === 'EU' ? 'stroke-[#00ff88] fill-[#00ff88]/5' : 'stroke-slate-700/60 hover:stroke-slate-400'}`} />
                      <text x="30" y="55" className={`text-[9.5px] font-bold ${selectedRegionId === 'EU' ? 'fill-[#00ff88]' : 'fill-slate-500'}`}>EU_CREDIT</text>
                    </g>

                    <g transform="translate(540, 120)" className="cursor-pointer" onClick={() => { setSelectedRegionId('CN'); playSyntheticSound('tick'); }}>
                      <polygon points="30,10 120,5 140,50 110,90 60,110 15,65" className={`fill-none stroke-2 transition-colors ${selectedRegionId === 'CN' ? 'stroke-[#00ff88] fill-[#00ff88]/5' : 'stroke-slate-700/60 hover:stroke-slate-400'}`} />
                      <text x="40" y="62" className={`text-[9.5px] font-bold ${selectedRegionId === 'CN' ? 'fill-[#00ff88]' : 'fill-slate-500'}`}>CN_CORRIDOR</text>
                    </g>

                    <g transform="translate(425, 175)" className="cursor-pointer" onClick={() => { setSelectedRegionId('CH'); playSyntheticSound('tick'); }}>
                      <polygon points="5,5 35,5 35,25 5,25" className={`fill-none stroke-2 transition-colors ${selectedRegionId === 'CH' ? 'stroke-[#00ff88] fill-[#00ff88]/10' : 'stroke-emerald-600/40 hover:stroke-emerald-400'}`} />
                      <text x="6" y="19" className="text-[7px] font-bold fill-emerald-400 font-terminal">CH_SEC</text>
                    </g>

                    {/* Pulsing red OMEGA hazard radar circles around high AI zones */}
                    {Object.values(gameState.countries).map((c: any) => {
                      if (!c.aiPenetration || c.aiPenetration < 15) return null;
                      let cx = 220, cy = 180;
                      if (c.id === 'US') { cx = 220; cy = 180; }
                      else if (c.id === 'CN') { cx = 620; cy = 185; }
                      else if (c.id === 'EU') { cx = 455; cy = 150; }
                      else if (c.id === 'CH') { cx = 445; cy = 190; }

                      const pulseRadius = 15 + (c.aiPenetration * 0.45);
                      return (
                        <g key={c.id}>
                          <circle cx={cx} cy={cy} r={pulseRadius} className="fill-none stroke-red-650 stroke-1 opacity-40" />
                          <circle cx={cx} cy={cy} r={pulseRadius + 8} className="fill-none stroke-red-500 stroke-1 opacity-25 animate-pulse" />
                        </g>
                      );
                    })}

                    {/* Satellite trajectories sliding dot nodes */}
                    {gameState.satelliteCoordinates && gameState.satelliteCoordinates.map((sat: any) => (
                      <g key={sat.id}>
                        <circle cx={sat.x} cy={sat.y} r={4.5} className="fill-yellow-400 stroke-black stroke-1 animate-pulse" />
                        <line x1={sat.x} y1={sat.y} x2={sat.x} y2={sat.y + 400} className="stroke-yellow-450/20 stroke-1" style={{ strokeDasharray: '2, 4' }} />
                        <text x={sat.x + 8} y={sat.y - 1} className="text-[7.5px] fill-yellow-400/90 font-mono italic font-bold">{sat.name}</text>
                      </g>
                    ))}

                    {/* Selected region target hud visual coordinates */}
                    {(() => {
                      let cx = 220, cy = 180;
                      if (selectedRegionId === 'US') { cx = 220; cy = 180; }
                      else if (selectedRegionId === 'CN') { cx = 620; cy = 185; }
                      else if (selectedRegionId === 'EU') { cx = 455; cy = 150; }
                      else if (selectedRegionId === 'CH') { cx = 445; cy = 190; }

                      return (
                        <g>
                          <circle cx={cx} cy={cy} r="32" className="stroke-[#00ff88] fill-none stroke-1 stroke-dashed animate-pulse" style={{ strokeDasharray: '3 3' }} />
                          <line x1={cx} y1={cy - 45} x2={cx} y2={cy + 45} className="stroke-[#00ff88]/30 stroke-0.5" />
                          <line x1={cx - 45} y1={cy} x2={cx + 45} y2={cy} className="stroke-[#00ff88]/30 stroke-0.5" />
                        </g>
                      );
                    })()}
                  </svg>

                  {/* Satellite scan tracker overlay panel */}
                  <div className="absolute right-2 top-8 w-44 bg-[#0a0c0f]/85 border border-[#1e2535] p-1.5 rounded-terminal text-[8px] font-terminal leading-snug z-20 text-yellow-500">
                    <span className="font-bold border-b border-yellow-500/30 block pb-0.5 mb-1 text-yellow-400">// ACTIVE SAT SENSOR ARRAY</span>
                    <div className="space-y-0.5">
                      {gameState.satelliteCoordinates && gameState.satelliteCoordinates.map((sat: any) => (
                        <div key={sat.id} className="flex justify-between font-mono">
                          <span>{sat.name}</span>
                          <span className="font-bold text-yellow-300">X:{sat.x.toFixed(0)} Y:{sat.y.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM REGIONAL SPECIAL ACTION INSTRUMENTS BOARD */}
                {(() => {
                  const selC: any = gameState.countries[selectedRegionId];
                  if (!selC) return null;
                  
                  // Action helpers
                  const handleDeployFirewall = () => {
                    setGameState((prev) => {
                      if (!prev) return null;
                      if (prev.player.cash < 100000000) {
                        logToTerminal('REJECTED: Insufficient cash ($100M required) to deploy cyber defense firewalls.', true);
                        return prev;
                      }
                      const next = { ...prev };
                      next.player.cash -= 100000000;
                      next.neuralFirewallPower = Math.min(100, next.neuralFirewallPower + 12);
                      const t = next.countries[selectedRegionId];
                      if (t) {
                        t.aiPenetration = Math.max(0, t.aiPenetration - 25);
                        t.stability = Math.min(100, t.stability + 8);
                        logToTerminal(`FIREWALL INSTALLED: Secured sub-network on coordinates ${selectedRegionId}. Threat integrity mitigated.`);
                        playSyntheticSound('profit');
                      }
                      return next;
                    });
                  };

                  const handleBailout = () => {
                    setGameState((prev) => {
                      if (!prev) return null;
                      if (prev.player.cash < 1500000000) {
                        logToTerminal('REJECTED: Insufficient cash ($1.5B required) for regional debt bails.', true);
                        return prev;
                      }
                      const next = { ...prev };
                      next.player.cash -= 1500000000;
                      const t = next.countries[selectedRegionId];
                      if (t) {
                        t.debtStress = Math.max(0, t.debtStress - 30);
                        t.opinionOfPlayer = Math.min(100, t.opinionOfPlayer + 20);
                        t.bondsIssued += 1500000000;
                        logToTerminal(`BAILOUT APPROVED: Capital injected into ${t.name} state treasury. Bond yields stabilized.`);
                        playSyntheticSound('profit');
                      }
                      return next;
                    });
                  };

                  const handleCornerCommodity = () => {
                    setGameState((prev) => {
                      if (!prev) return null;
                      if (prev.player.cash < 50000000) {
                        logToTerminal('REJECTED: Insufficient cash reserves ($50M required).', true);
                        return prev;
                      }
                      const next = { ...prev };
                      next.player.cash -= 50000000;
                      const t = next.countries[selectedRegionId];
                      if (t) {
                        t.resourceValue = Math.min(100, t.resourceValue + 12);
                        t.volatility = Math.min(100, t.volatility + 10);
                        Object.values(next.markets).forEach((m: any) => {
                          m.currentPrice *= 1.04;
                        });
                        logToTerminal(`CORNER SECTOR: Hoarded physical assets in ${t.name} sector. Commodity future indexes up 4%.`);
                        playSyntheticSound('order');
                      }
                      return next;
                    });
                  };

                  const handleSanction = () => {
                    setGameState((prev) => {
                      if (!prev) return null;
                      if (prev.player.cash < 200000000) {
                        logToTerminal('REJECTED: Insufficient cash ($200M required).', true);
                        return prev;
                      }
                      const next = { ...prev };
                      next.player.cash -= 200000000;
                      const t = next.countries[selectedRegionId];
                      if (t) {
                        t.stability = Math.max(10, t.stability - 20);
                        t.unrest = Math.min(100, t.unrest + 15);
                        t.debtStress = Math.min(100, t.debtStress + 15);
                        logToTerminal(`EMBARGO EXECUTED: Enforced capital blockade on ${t.name} exchanges. Local unrest increased.`);
                        playSyntheticSound('warning');
                      }
                      return next;
                    });
                  };

                  return (
                    <div className="bg-[#0f1318] border border-[#1e2535] rounded-terminal p-2 mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {/* Left: Region Inspect descriptors */}
                      <div className="bg-[#141920] border border-[#1e2535] p-2 rounded-terminal flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-1.5 font-bold uppercase text-[10px]">
                            <span className="text-[#00ff88]">{selC.name} COORDINATES_COORD</span>
                            <span className="text-slate-400">ID: {selC.id}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9.5px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">GDP GROWTH RATE:</span>
                              <span className="text-white">{(selC.gdpGrowth * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">SOVEREIGN DEBT STRESS:</span>
                              <span className="text-white">{selC.debtStress.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">OMEGA NET AI INFECTION:</span>
                              <span className="text-red-400 font-bold">{selC.aiPenetration.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">FOOD SECURITY INDEX:</span>
                              <span className="text-white">{selC.foodSecurity.toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">ASSET LIQUID VOL:</span>
                              <span className="text-white">{selC.volatility.toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">POLITICAL HEATWAVE:</span>
                              <span className="text-white">{selC.politicalHeat.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-1 border-t border-slate-900/40 pt-1 flex justify-between items-center text-[8.5px] font-terminal italic text-slate-500">
                          <span>REG LOBBY FRAC: {(selC.capturedLobbyFraction * 100).toFixed(1)}%</span>
                          <span>CENTRAL RATE: {(selC.interestRate * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-1.5 justify-center">
                        <div className="grid grid-cols-2 gap-1 font-terminal">
                          <button 
                            onClick={handleDeployFirewall}
                            className="bg-red-950/30 border border-red-700/50 hover:bg-red-950 text-red-400 font-bold p-1 rounded-terminal uppercase tracking-tight cursor-pointer text-center text-[9px]"
                          >
                            DEPLOY DEFENSE FIREWALL <span className="block text-[8px] opacity-75 font-normal">COST: $100M</span>
                          </button>
                          <button 
                            onClick={handleBailout}
                            className="bg-emerald-950/30 border border-emerald-700/50 hover:bg-emerald-950 text-emerald-400 font-bold p-1 rounded-terminal uppercase tracking-tight cursor-pointer text-center text-[9px]"
                          >
                            SOVEREIGN BAILOUT <span className="block text-[8px] opacity-75 font-normal">COST: $1.5B</span>
                          </button>
                          <button 
                            onClick={handleCornerCommodity}
                            className="bg-[#141920] border border-slate-705 hover:bg-[#1f2631] text-[#00c2ff] font-bold p-1 rounded-terminal uppercase tracking-tight cursor-pointer text-center text-[9px]"
                          >
                            CORNER PHYSICAL WEALTH <span className="block text-[8px] opacity-75 font-normal">COST: $50M</span>
                          </button>
                          <button 
                            onClick={handleSanction}
                            className="bg-[#141920] border border-rose-900/40 hover:bg-rose-950/30 text-[#ff3b5c] font-bold p-1 rounded-terminal uppercase tracking-tight cursor-pointer text-center text-[9px]"
                          >
                            EMBARGO VECTORS LOCK <span className="block text-[8px] opacity-75 font-normal">COST: $200M</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })()}

              </div>
            )}

            {activeTab === 'AI_WAR' && (
              <div className="flex flex-col h-full overflow-hidden select-none font-mono">
                <div className="flex justify-between items-center bg-[#0f1318] border border-[#1e2535] p-2 rounded-terminal mb-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">// OMEGA INTRUSION TRACE CONSOLE</span>
                  <span className="text-[9px] text-[#00c2ff] font-bold">FIREWALL INTEGRITY DESK</span>
                </div>

                <div className="flex-1 bg-[#07090d] border border-[#1e2535] p-3 rounded-terminal flex flex-col md:flex-row gap-3 overflow-y-auto">
                  {/* Neural intrusion topology map */}
                  <div className="flex-1 min-h-[180px] bg-[#0a0c0f] border border-[#1e2535] rounded-terminal p-2 flex flex-col justify-between">
                    <span className="text-[8px] opacity-60 text-slate-400 uppercase font-bold">// CYBER INTRUSION TOPOLOGY NETWORK</span>
                    
                    <svg viewBox="0 0 400 220" className="w-full text-slate-800 flex-1">
                      <path d="M 50 50 Q 150 110 200 110" className="stroke-red-650 fill-none stroke-1 animate-pulse" />
                      <path d="M 350 50 Q 250 110 200 110" className="stroke-red-650 fill-none stroke-1 border-dashed" />
                      <path d="M 50 180 Q 150 110 200 110" className="stroke-red-500 fill-none stroke-1" />
                      <line x1="350" y1="180" x2="200" y2="110" className="stroke-orange-500/20 stroke-1" />

                      <circle cx="200" cy="110" r="14" className="fill-red-950 stroke-red-500 stroke-2 animate-pulse" />
                      <text x="180" y="85" className="text-[8px] fill-red-500 font-bold tracking-wider">OMEGA_CORE</text>

                      <circle cx="50" cy="50" r="8" className="fill-slate-900 stroke-slate-500 stroke-1" />
                      <text x="35" y="38" className="text-[7.5px] fill-slate-300 font-bold">US-NET</text>

                      <circle cx="350" cy="50" r="8" className="fill-slate-900 stroke-slate-500 stroke-1" />
                      <text x="330" y="38" className="text-[7.5px] fill-slate-300 font-bold">CN-NET</text>

                      <circle cx="50" cy="180" r="8" className="fill-slate-900 stroke-slate-500 stroke-1" />
                      <text x="35" y="194" className="text-[7.5px] fill-slate-300 font-bold">EU-NET</text>

                      <circle cx="350" cy="180" r="8" className="fill-emerald-900 stroke-emerald-500 stroke-1" />
                      <text x="330" y="194" className="text-[7.5px] fill-emerald-300 font-bold">CH_SECURE</text>
                    </svg>

                    <span className="text-[8.5px] text-red-400 font-terminal italic">SYSTEM SECURITY LOCK IN JEOPARDY</span>
                  </div>

                  {/* Anti AI controls */}
                  <div className="w-full md:w-56 flex flex-col gap-2.5 font-terminal">
                    <div className="bg-[#141920] border border-[#1e2535] p-2.5 rounded-terminal uppercase">
                      <span className="text-[8px] text-slate-400 block font-bold">// OMEGA SYSTEM TELEMETRY</span>
                      <div className="mt-1.5 space-y-1.5 text-[9.5px]">
                        <div className="flex justify-between">
                          <span>THREAT INDEX:</span>
                          <span className="text-red-500 font-bold">{gameState.omegaThreatLevel ? gameState.omegaThreatLevel.toFixed(1) : '15'}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>FIREWALL INTEGRITY:</span>
                          <span className="text-[#00ff88] font-bold">{gameState.neuralFirewallPower ?? 50}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ACTIVE ATTACKS:</span>
                          <span className="text-[#ff3b5c]/80 truncate font-mono">
                            {gameState.omegaActiveAttacks && gameState.omegaActiveAttacks.length > 0 ? gameState.omegaActiveAttacks.join(', ') : 'NONE_DETECTED'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button 
                        onClick={() => {
                          setGameState(prev => {
                            if (!prev || prev.player.cash < 250000000) {
                              logToTerminal('REJECTED: Insufficient cash ($250M required) to deploy firewall reinforcements.', true);
                              return prev;
                            }
                            const next = { ...prev };
                            next.player.cash -= 250000000;
                            next.neuralFirewallPower = Math.min(100, next.neuralFirewallPower + 25);
                            logToTerminal('FIREWALL REINFORCED: Discharged clean subnet patches. Security ratings up.');
                            playSyntheticSound('profit');
                            return next;
                          });
                        }}
                        className="w-full bg-[#00c2ff]/10 hover:bg-[#00c2ff]/20 border border-[#00c2ff]/40 text-[#00c2ff] font-bold py-1.5 text-center text-[9.5px] rounded-terminal uppercase tracking-tight cursor-pointer"
                      >
                        BOOST SUB_FIREWALL (-$250M)
                      </button>
                      <button 
                        onClick={() => {
                          setGameState(prev => {
                            if (!prev || prev.player.cash < 450000000) {
                              logToTerminal('REJECTED: Insufficient finance reserves ($450M required).', true);
                              return prev;
                            }
                            const next = { ...prev };
                            next.player.cash -= 450000000;
                            next.omegaThreatLevel = Math.max(5, next.omegaThreatLevel - 20);
                            logToTerminal('ATTACK COMPLETED: Executed hardware nodes disruption raid over OMEGA systems.');
                            playSyntheticSound('order');
                            return next;
                          });
                        }}
                        className="w-full bg-red-950/40 hover:bg-red-900/30 border border-red-700/50 text-red-400 font-bold py-1.5 text-center text-[9.5px] rounded-terminal uppercase tracking-tight cursor-pointer"
                      >
                        JAM OMEGA HARDWARD NODES (-$450M)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'DEBT' && (
              <div className="flex flex-col h-full overflow-hidden select-none font-mono">
                <div className="flex justify-between items-center bg-[#0f1318] border border-[#1e2535] p-2 rounded-terminal mb-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                  <span className="text-[10px] text-[#00ff88] font-bold uppercase tracking-wider">// MACRO SOVEREIGN CDS DEBT STRESS TRACE</span>
                  <span className="text-[9px] text-[#00c2ff] font-bold">CONTAGION TRANSM TRANSMISSION INTERFACE</span>
                </div>

                <div className="flex-1 bg-[#07090d] border border-[#1e2535] p-3 rounded-terminal overflow-y-auto flex flex-col gap-3 font-terminal">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {Object.values(gameState.countries).map((country: any) => {
                      const stressColor = country.debtStress > 70 ? 'text-[#ff3b5c] border-[#ff3b5c]' : country.debtStress > 40 ? 'text-orange-400 border-orange-500' : 'text-[#00ff88] border-emerald-500';
                      return (
                        <div key={country.id} className={`bg-[#141920] border p-2 rounded-terminal uppercase text-center ${stressColor}/30`}>
                          <span className="font-bold block text-[10px] mb-0.5">{country.name}</span>
                          <span className="text-[8px] text-slate-500 block mb-1.5">// CDS RATIO EXP</span>
                          
                          <div className="space-y-0.5 text-[9.5px] text-left">
                            <div className="flex justify-between">
                              <span>DEBT STRESS:</span>
                              <span className={`font-black ${stressColor}`}>{country.debtStress.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>BONDS ISSUED:</span>
                              <span className="text-white">${(country.bondsIssued / 1e9).toFixed(1)}B</span>
                            </div>
                            <div className="flex justify-between">
                              <span>BASE RATE:</span>
                              <span className="text-white">{(country.interestRate * 100).toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border border-[#1e2535] p-2 rounded-terminal bg-[#0a0c0f]">
                    <span className="text-[8.5px] text-[#00c2ff] block mb-1 font-bold uppercase tracking-wider">// SYSTEM CONTAGION FACTOR</span>
                    <p className="text-[9.5px] text-slate-300 leading-relaxed font-mono">
                      High <span className="text-[#ff3b5c] font-bold">Sovereign Debt Stress</span> metrics on major corridors (especially inside US) spark compounding panic sell-offs on equities. Monitor indices closely to purchase protection derivatives.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'SUPPLY_CHAINS' && (
              <div className="flex flex-col h-full overflow-hidden select-none font-mono">
                <div className="flex justify-between items-center bg-[#0f1318] border border-[#1e2535] p-2 rounded-terminal mb-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                  <span className="text-[10px] text-[#00c2ff] font-bold uppercase tracking-wider">// RAW MATERIALS & SHORELINE LITHIUM HEGEMONY MATRIX</span>
                  <span className="text-[9px] text-[#00ff88] font-bold">MATERIAL LOGISTICS DESK</span>
                </div>

                <div className="flex-1 bg-[#07090d] border border-[#1e2535] p-3 rounded-terminal overflow-y-auto flex flex-col md:flex-row gap-3">
                  <div className="flex-1 bg-[#0a0c0f] border border-[#1e2535] rounded-terminal p-3 flex flex-col justify-between font-terminal">
                    <div>
                      <span className="text-[8px] opacity-60 text-slate-400 block mb-2 uppercase font-bold">// CRITICAL DEPOT CAPTURE</span>
                      
                      <div className="space-y-3">
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-bold text-yellow-400">URANIUM MINES FUTURE HOARDS</span>
                            <span className="font-bold text-white">45% EXTRACTED</span>
                          </div>
                          <div className="w-full bg-[#141920] border border-[#1e2535] h-2 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full" style={{ width: '45%' }} />
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-bold text-cyan-400">LITHIUM RESERVES CORNER CONTROL</span>
                            <span className="font-bold text-white">58% EXTRACTED</span>
                          </div>
                          <div className="w-full bg-[#141920] border border-[#1e2535] h-2 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full" style={{ width: '58%' }} />
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-bold text-emerald-400">SOY GRAIN CORRIDOR CORNER</span>
                            <span className="font-bold text-white">20% EXTRACTED</span>
                          </div>
                          <div className="w-full bg-[#141920] border border-[#1e2535] h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: '20%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[8.5px] text-slate-400 leading-snug mt-2 border-t border-slate-900 pt-1">
                      Hoarding materials expands dynastic yields while increasing global cost inflation, prompting heavy regulatory oversight.
                    </p>
                  </div>

                  <div className="w-full md:w-56 bg-[#141920] border border-[#1e2535] rounded-terminal p-2.5 uppercase flex flex-col gap-2 justify-between font-terminal">
                    <div>
                      <span className="text-[8px] text-slate-400 block mb-1 font-bold">// SECULAR MATERIAL PRICING</span>
                      <div className="space-y-0.5 text-[9.5px]">
                        <div className="flex justify-between border-b border-slate-900 pb-0.5">
                          <span>SOY GRAIN SPOT:</span>
                          <span className="text-[#00ff88]">${gameState.markets['SOY-CROP'] ? (gameState.markets['SOY-CROP'] as any).currentPrice.toFixed(2) : '31.42'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-0.5">
                          <span>ENERGY FUTURE:</span>
                          <span className="text-[#00ff88]">${gameState.markets['WETH-FUT'] ? (gameState.markets['WETH-FUT'] as any).currentPrice.toFixed(2) : '184.22'}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setGameState((p) => {
                          if (!p || p.player.cash < 350000000) {
                            logToTerminal('REJECTED: Insufficient cash ($350M required) for physical straits blockade.', true);
                            return p;
                          }
                          const next = { ...p };
                          next.player.cash -= 350000000;
                          Object.values(next.markets).forEach((m: any) => {
                            m.currentPrice *= 1.15;
                          });
                          logToTerminal('SHIIPING REALLOCATED: Strait blockades enforced. Volcanic price increases executed across physical books.');
                          playSyntheticSound('profit');
                          return next;
                        });
                      }}
                      className="w-full bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/40 text-[#00ff88] font-bold p-1 rounded-terminal uppercase tracking-tight text-center text-[9.5px] cursor-pointer"
                    >
                      ENFORCE STRAITS BLOCKADE (-$350M)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'SATELLITES' && (
              <div className="flex flex-col h-full overflow-hidden select-none font-mono">
                <div className="flex justify-between items-center bg-[#0f1318] border border-[#1e2535] p-2 rounded-terminal mb-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                  <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">// ORBITAL SWEEP CO-INTEGRATION RADARS</span>
                  <span className="text-[9px] text-[#00c2ff] font-bold">RADAR CONSOLE</span>
                </div>

                <div className="flex-1 bg-[#07090d] border border-[#1e2535] p-3 rounded-terminal overflow-y-auto flex flex-col md:flex-row gap-3">
                  <div className="flex-1 bg-[#0a0c0f] border border-[#1e2535] rounded-terminal p-3 flex flex-col justify-between items-center relative min-h-[180px] font-terminal">
                    <div className="absolute inset-0 pointer-events-none opacity-25">
                      <div className="w-full h-full rounded-full border border-yellow-500/30 animate-pulse scale-90" />
                      <div className="w-full h-full rounded-full border border-yellow-500/15 animate-ping" />
                    </div>

                    <span className="text-[8px] opacity-60 text-slate-400 self-start uppercase font-bold">// CO-INTEGRATION AZIMUTH PLOT</span>
                    
                    <div className="space-y-1 text-center my-auto z-10">
                      <span className="text-yellow-400 font-bold text-[12px] block tracking-wider animate-pulse">// SATELLITE SENSOR LINK ESTABLISHED //</span>
                      <p className="text-[9.5px] text-slate-300 max-w-sm">
                        High-altitude arrays sweep critical physical nodes, harvesting security exploits and public distress files to feed automated frontrunners arbitrage.
                      </p>
                    </div>

                    <div className="flex justify-between items-center w-full border-t border-slate-900 pt-1 text-[8.5px] text-slate-500 uppercase">
                      <span>RADAR SWEEP ANGLE: 120DEG</span>
                      <span>RESOLUTION: 0.1M DET DETAIL</span>
                    </div>
                  </div>

                  <div className="w-full md:w-56 bg-[#141920] border border-[#1e2535] rounded-terminal p-2.5 uppercase flex flex-col gap-2 justify-between font-terminal">
                    <div>
                      <span className="text-[8px] text-slate-400 block mb-1 font-bold">// CONSTELLATION OVERVIEW</span>
                      <div className="space-y-0.5 text-[9.5px] text-slate-300">
                        {gameState.satelliteCoordinates && gameState.satelliteCoordinates.map((sat: any) => (
                          <div key={sat.id} className="flex justify-between border-b border-slate-900 pb-0.5">
                            <span>{sat.name}:</span>
                            <span className="text-yellow-400 font-bold">AZ:{sat.x.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setGameState((p) => {
                          if (!p || p.player.cash < 180000000) {
                            logToTerminal('REJECTED: Insufficient cash ($180M required) for satellite launch.', true);
                            return p;
                          }
                          const next = { ...p };
                          next.player.cash -= 180000000;
                          const newId = next.satelliteCoordinates ? next.satelliteCoordinates.length + 1 : 1;
                          if (!next.satelliteCoordinates) next.satelliteCoordinates = [];
                          next.satelliteCoordinates.push({
                            id: 'sat_' + newId,
                            name: 'CORVUS_' + String.fromCharCode(64 + newId),
                            x: Math.random() * 400 + 100,
                            y: Math.random() * 150 + 50
                          });
                          logToTerminal(`PAYLOAD DEPLOYED: Satellite CORVUS_${String.fromCharCode(64 + newId)} placed in stable low-Earth orbit. Scanning nodes.`);
                          playSyntheticSound('profit');
                          return next;
                        });
                      }}
                      className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 font-bold p-1 rounded-terminal uppercase tracking-tight text-center text-[9.5px] cursor-pointer"
                    >
                      LAUNCH NEW SATELLITE (-$180M)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'RESEARCH' && (
              <ResearchPanel
                state={gameState!}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
              />
            )}

            {activeTab === 'STAFF' && (
              <StaffPanel
                state={gameState!}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
              />
            )}

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
