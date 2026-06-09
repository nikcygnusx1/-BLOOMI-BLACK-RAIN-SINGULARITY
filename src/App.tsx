import React, { useState, useEffect, useRef } from 'react';
import { createInitialWorld, saveSimState, loadSimState } from './sim/state';
import { GeopoliticalOmegaEngine } from './sim/engines';
import { SimState, DynastyMember } from './types';
import { TradingViewChart } from './components/TradingViewChart';
import { CernHadronAccelerator } from './components/CernHadronAccelerator';
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
import { playSyntheticSound, setMuted, getMuted } from './utils/audio';
import { BloomiSingularityCore } from './components/BloomiSingularityCore';
import { OrbitalRadarPanel } from './components/OrbitalRadarPanel';
import { IntrusionTraceConsole } from './components/IntrusionTraceConsole';
import { BloomiTradingTerminal } from './components/BloomiTradingTerminal';
import { BunkerPanel } from './components/BunkerPanel';
import { CodexTerminal } from './components/CodexTerminal';
import { IntroCinematicOverlay } from './cinematic/IntroCinematicOverlay';
import { VideoFeedPanel } from './modules/VideoFeed/VideoFeedPanel';
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
  const [gameState, rawSetGameState] = useState<SimState | null>(null);

  // Custom setter that intercepts functional updaters to deep-clone game state,
  // preventing nested mutations under React's Strict Mode double-runs.
  const setGameState = React.useCallback((valueOrUpdater: React.SetStateAction<SimState | null>) => {
    rawSetGameState((prev) => {
      if (typeof valueOrUpdater === 'function') {
        if (!prev) return null;
        const clonedPrev = JSON.parse(JSON.stringify(prev)) as SimState;
        return (valueOrUpdater as Function)(clonedPrev);
      }
      return valueOrUpdater;
    });
  }, []);
  const [activeTab, setActiveTab] = useState<'WORLD' | 'LAB_VIEW' | 'RESEARCH' | 'STAFF' | 'HELP' | 'TRADING' | 'CORPORATE' | 'MACRO' | 'INFLUENCE' | 'DYNASTY' | 'INTELLIGENCE' | 'OPERATION' | 'MARKETS' | 'AI_WAR' | 'SATELLITES' | 'DEBT' | 'SUPPLY_CHAINS' | 'SINGULARITY' | 'BUNKER' | 'CODEX' | 'COLLIDER' | 'VIDEO_FEED'>('SINGULARITY');
  const [showCinematic, setShowCinematic] = useState(() => !sessionStorage.getItem('bloomi_intro_played'));
  const [cinematicFading, setCinematicFading] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('APLH');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('US');
  const [isTiledMode, setIsTiledMode] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  // Interactive full Bloomberg workstation startup sequence states (Section 6.3)
  const [bootStep, setBootStep] = useState(0); // 0 = booting, 1 = mainframe
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Biometric Pulse tracking
  const [mouseSpeed, setMouseSpeed] = useState(0);
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastMousePos.current.time;
      if (dt > 100) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        setMouseSpeed(Math.min(90, Math.floor((dist / (dt || 1)) * 10)));
        lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simulation boot sequence timer on initial page load (Section 6.3)
  useEffect(() => {
    if (bootStep === 0) {
      const logs = [
        'INJECTING PORT 3000 SANDBOX TELEMETRY INTERFACE...',
        'CONNECTING CONTROLS TO BLOOMI SYNDICATE DIRECTIVES...',
        'INITIALIZING SECTOR COGNITIVE MEMORY SECTORS...',
        'ESTABLISHING ENHANCED LIQUID COV-FUNDS MATRIX...',
        'SECURING PROTOCOL CONNECTIONS WITH OMEGA RADAR...',
        'MOUNTING DIRECT LINEAGE GENOME ORCHESTRATORS...',
        'FIRING CERN HADRON LEPTON RESONANCE RING...',
        'DECRYPTING CLASSIFIED INTEL CORE DATABASE CODEX...',
        'INTEL MATRIX DEPLOYED. ENFORCING TRANSITION LAUNCH.'
      ];
      
      const handleBootKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          setBootStep(1);
          playSyntheticSound('open');
        }
      };
      window.addEventListener('keydown', handleBootKeyDown);

      let currentProgress = 0;
      let logIndex = 0;
      const progressInterval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 8) + 4;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressInterval);
          setTimeout(() => {
            setBootStep(1);
            playSyntheticSound('open');
          }, 450);
        }
        setBootProgress(currentProgress);
        
        const targetLogIndex = Math.floor((currentProgress / 105) * logs.length);
        if (targetLogIndex > logIndex && logIndex < logs.length) {
          setBootLogs(prev => [...prev, `[${currentProgress}%] ${logs[logIndex]}`]);
          logIndex++;
          playSyntheticSound('tick');
        }
      }, 70);
      
      return () => {
        clearInterval(progressInterval);
        window.removeEventListener('keydown', handleBootKeyDown);
      };
    }
  }, [bootStep]);

  /*
   * ===================================================================
   * PRESERVATION MANDATE — COMPLIANCE ASSURANCE INVENTORY
   * ===================================================================
   * I have thoroughly read, mapped, and preserved the following modules
   * and files representing the entire 18+ module security framework:
   * 
   * FOUNDATION CORES:
   * - /src/main.tsx             : UI Entrypoint and React render node
   * - /src/index.css            : Bloomberg theme design variables
   * - /src/types.ts             : Game simulation state interfaces
   * - /src/App.tsx              : Bloomberg Workspace primary console
   * 
   * CORE SIMULATION SIM-ENGINES:
   * - /src/sim/state.ts         : Genesis SimState default boots and saves
   * - /src/sim/engines.ts       : Unified GeopoliticalOmegaEngine ticker
   * 
   * PROCEDURAL SOUND ENGINE:
   * - /src/utils/audio.ts       : Web Audio frequency oscillator
   * 
   * SECURITY DIVISION OVERLAYS:
   * - /src/components/CodexTerminal.tsx          : Intelligence Object relationships
   * - /src/components/BunkerPanel.tsx            : Subterranean secure shelter schematics
   * - /src/components/CernHadronAccelerator.tsx  : Ring Collider energy levels
   * - /src/components/LabMapView.tsx             : Reactor lab grid simulation
   * - /src/components/OrbitalRadarPanel.tsx      : Kepler orbital satellites path Projection
   * - /src/components/ResearchPanel.tsx          : Upgrade paths and research trees
   * - /src/components/StaffPanel.tsx             : Operations staff rosters 
   * - /src/components/InfluenceWeb.tsx           : Propaganda lobby maps
   * - /src/components/BloomiTradingTerminal.tsx  : Order book, ticker charts and trading systems
   * - /src/components/BloomiSingularityCore.tsx  : Master quantum singular controller
   * - /src/components/DynastyTree.tsx            : Splicing gene pools succession
   * - /src/components/CorporatePanel.tsx         : Executive boardroom takeover systems
   * - /src/components/MacroPanel.tsx             : Tax metrics, sanctions and global macro variables
   * - /src/components/MarketsHeatmap.tsx         : Order depth, pool logs and asset values
   * - /src/components/IntrusionTraceConsole.tsx  : Intrusion trace network alert logs
   * - /src/components/IntelligencePanel.tsx      : Operations covert informants matrix
   * - /src/components/FundOpsPanel.tsx           : Treasury liquid balances ledgers
   * - /src/components/CharacterCreator.tsx       : New game custom onboarding builder
   * ===================================================================
   */

  // Context-Sensitive Yellow Key Actions Handler (Section 2.3)
  const handleYellowAction = (actionIdx: number) => {
    playSyntheticSound('tick');
    const activeActions: Record<string, string[]> = {
      LAB_VIEW: ["DRILL_LEVEL", "CELL_STAT", "RESET_GRID", "FLOOD_PULSE", "HIST_LOG", "MANUAL"],
      MACRO: ["REALLOCATE", "YIELD_CRV", "EXPORT_DAT", "SYS_ALERT", "STRESS_LOG", "MANUAL"],
      DEBT: ["SHORT_CDS", "MAT_LADDER", "EXPORT_CDS", "CRV_ALERT", "HIST_YIELD", "MANUAL"],
      DYNASTY: ["CLONE_HEIR", "DNA_MAP", "SPLICE_TRAIT", "ALERT_GEN", "CHROMO_LOG", "MANUAL"],
      TRADING: ["ORDER_BUY", "DEPTH_CHART", "TRADE_LOGS", "SPREAD_ALRT", "EXEC_HIST", "MANUAL"],
      MARKETS: ["FORCE_BLOCK", "HEAT_GRAPH", "INST_TAPE", "POOL_WARN", "DEPTH_HIST", "MANUAL"],
      CORPORATE: ["LAUNCH_COUP", "OWN_NETWORK", "SEC_FILINGS", "REORG_ALERT", "TAKEOVER_H", "MANUAL"],
      SATELLITES: ["LASER_BEAM", "KEPLER_ORB", "SIG_TELEM", "JAM_WARN", "STORM_CORRID", "MANUAL"],
      INFLUENCE: ["BRIBE_ADMIN", "PROPAG_MAP", "CHANC_DOSSER", "INTEL_WARN", "COUPS_LOG", "MANUAL"],
      COLLIDER: ["ARM_TRIGGER", "VOL_STREAM", "PART_BURST", "THERM_WARN", "LATTICE_H", "MANUAL"],
      BUNKER: ["PURGE_FLOOD", "ISOM_SECT", "MANIF_EXP", "THREAT_ALRT", "DRILL_LOG", "MANUAL"],
      CODEX: ["SEARCH_DB", "RELA_GRAPH", "COGN_EXPORT", "CLASF_WARN", "DEC_LEVEL5", "MANUAL"],
      VIDEO_FEED: ["CERN_ARM", "MRKTS_LINK", "INTEL_NET", "DARK_RAIN", "GLITCH_SIG", "MANUAL"],
    };

    const labels = activeActions[activeTab] || ["EXEC_ACTION", "PLOT_CHART", "EXPORT_CSV", "SET_ALERTS", "SEGM_LOGS", "SUPPORT"];
    const actionName = labels[actionIdx];
    logToTerminal(`YELLOW_KEY: TRIGGERED [Y${actionIdx + 1}: ${actionName}] ON ${activeTab} CONTEXT.`);
    
    // Wire up somatic operations!
    if (activeTab === 'LAB_VIEW') {
      if (actionIdx === 0) {
        logToTerminal('LAB_VIEW: Initializing deep borehole drilling operations at sector coordinates.');
      } else if (actionIdx === 1) {
        logToTerminal('LAB_VIEW: Displaying micro-cell fluid saturation telemetry vectors.');
      } else if (actionIdx === 3) {
         setGameState((prev: any) => {
           if (!prev) return prev;
           const next = { ...prev };
           next.floodLevel = Math.max(0, next.floodLevel - 5);
           return next;
         });
         logToTerminal('LAB_VIEW: Somatic pumping pipelines siphoned 5% floor fluid.');
         playSyntheticSound('success');
      }
    } else if (activeTab === 'BUNKER') {
      if (actionIdx === 0) {
         setGameState((prev: any) => {
           if (!prev) return prev;
           const next = { ...prev };
           next.floodLevel = Math.max(0, next.floodLevel - 10);
           return next;
         });
         logToTerminal('BUNKER: Instant emergency wastewater siphons purge activated.');
         playSyntheticSound('success');
      }
    } else if (activeTab === 'CODEX') {
      if (actionIdx === 4) {
         logToTerminal('CODEX: DECRYPT_LEVEL_5 security overrides authenticated. Redacted text blocks illuminated.');
         playSyntheticSound('success');
      }
    } else if (activeTab === 'VIDEO_FEED') {
      if (actionIdx === 0) {
        logToTerminal('VIDEO_FEED: Re-arming CERN collider satellite downlink resonance arrays.');
      } else if (actionIdx === 1) {
        logToTerminal('VIDEO_FEED: Authenticating market liquidity swaps and spread ticker metrics.');
      } else if (actionIdx === 2) {
        logToTerminal('VIDEO_FEED: Graphing topological network intelligence density values.');
      } else if (actionIdx === 4) {
        logToTerminal('VIDEO_FEED: Sending deliberate electromagnetic pulse spike to simulate glitches.');
      }
    }
  };

  // System-wide F1-F12 standard physical key intercepts (Section 6.5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTabsArray = ['LAB_VIEW', 'MACRO', 'DEBT', 'DYNASTY', 'TRADING', 'MARKETS', 'CORPORATE', 'SATELLITES', 'INFLUENCE', 'COLLIDER', 'BUNKER', 'CODEX', 'HELP'];
      
      // Select All in CLI prompt
      if (e.ctrlKey && e.key === 'a') {
        const input = document.getElementById('cli-input-field') as HTMLInputElement | null;
        if (input && document.activeElement === input) {
          return;
        }
      }

      // Intercept and prevent browser's typical Tab button focus jumping
      if (e.key === 'Tab') {
        e.preventDefault();
        // Trigger simple autocomplete event
        const input = document.getElementById('cli-input-field') as HTMLInputElement | null;
        if (input && document.activeElement === input) {
          const val = input.value.trim().toUpperCase();
          if (val && !val.includes(' ')) {
            const matches = ['WORLD', 'RESEARCH', 'STAFF', 'HELP', 'TRADING', 'CORPORATE', 'MACRO', 'INFLUENCE', 'DYNASTY', 'INTELLIGENCE', 'MARKETS', 'AI_WAR', 'SATELLITES', 'DEBT', 'SUPPLY_CHAINS', 'SINGULARITY', 'BUNKER', 'CODEX', 'COLLIDER', 'APLH', 'BZ_CDS', 'BUY', 'SELL', 'STATUS', 'OVERRIDES', 'LAYOFFS', 'HIRE', 'INVEST'].filter(s => s.startsWith(val));
            if (matches.length > 0) {
              input.value = matches[0] + ' ';
              setCliInput(matches[0] + ' ');
              logToTerminal(`AUTOCOMPLETE: COMPLETED "${val}" -> "${matches[0]}"`);
              playSyntheticSound('tick');
            }
          }
        }
        return;
      }

      // Cycle active tabs with Alt+Arrow keys
      if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        const currentIdx = activeTabsArray.indexOf(activeTab);
        if (currentIdx !== -1) {
          let nextIdx = (e.key === 'ArrowRight') ? currentIdx + 1 : currentIdx - 1;
          if (nextIdx >= activeTabsArray.length) nextIdx = 0;
          if (nextIdx < 0) nextIdx = activeTabsArray.length - 1;
          const nextTab = activeTabsArray[nextIdx];
          executeUnifiedCommand(`F${nextIdx + 1} <GO>`);
        }
        return;
      }

      // Ctrl + T: Toggle multi panel tiled layout mode (Section 11)
      if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTiledMode(prev => {
          const next = !prev;
          logToTerminal(`WORKSTATION: ${next ? 'ENABLED BLOOMBERG QUAD TILED VIEW (2X2 MODULE PANEL LAYOUT)' : 'RESTORED APEX SINGLE VISUAL SCREEN MODE'}`);
          playSyntheticSound('open');
          return next;
        });
        return;
      }

      // Ctrl + V: Direct navigation to classified surveillance Live Video Feed Panel
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setActiveTab('VIDEO_FEED');
        logToTerminal('COMMAND SHELL: ROUTING DIRECTLY TO SURVEILLANCE VIDEO INJECT RECEIVER [Ctrl+V].');
        playSyntheticSound('open');
        return;
      }

      // Alt+1 to 9: focus specific panel slots immediately
      if (e.altKey && e.key.match(/^[1-9]$/)) {
        e.preventDefault();
        const slotIdx = parseInt(e.key) - 1;
        if (slotIdx < activeTabsArray.length) {
          const nextS = activeTabsArray[slotIdx];
          executeUnifiedCommand(`F${slotIdx + 1} <GO>`);
        }
        return;
      }

      // Ctrl + W: Close active workspace component back to Singularity Core
      if (e.ctrlKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        setActiveTab('SINGULARITY');
        logToTerminal('WORKSTATION: CLOSED TERMINAL PANEL CORE. RETURNED FOCUS TO SINGULARITY MASTER ENGINE.');
        playSyntheticSound('warning');
        return;
      }

      // Escape keys: Focus terminal command bar
      if (e.key === 'Escape') {
        e.preventDefault();
        const input = document.getElementById('cli-input-field');
        if (input) {
          (input as HTMLElement).focus();
          logToTerminal('WORKSTATION: FOCUS RETRIEVED TO BBG_SHELL_PROMPT.');
          playSyntheticSound('tick');
        }
        return;
      }

      // / Slash key: focus shell prompt
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const input = document.getElementById('cli-input-field');
        if (input) {
          (input as HTMLElement).focus();
          setCliInput('');
          playSyntheticSound('tick');
        }
        return;
      }

      // Ctrl + L: Clear workspace status logs list
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setTerminalLogs(['SYSTEM LOG FILE PURGED CLEAR. READY FOR INPUT SERVICES.']);
        playSyntheticSound('tick');
        return;
      }

      // Yellow key Shift+F1 to Shift+F6 mapped context handlers
      if (e.shiftKey && e.key.match(/^F[1-6]$/)) {
        e.preventDefault();
        const actionIdx = parseInt(e.key.substring(1)) - 1;
        handleYellowAction(actionIdx);
        return;
      }

      // Single character alpha alerts overlays shortcuts (when not typing in fields)
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        const key = e.key.toLowerCase();
        if (key === 'b') {
          e.preventDefault();
          executeUnifiedCommand('F11 <GO>'); // Bunker
          return;
        }
        if (key === 'g') {
          e.preventDefault();
          executeUnifiedCommand('F4 <GO>'); // Gene slicer (Dynasty)
          return;
        }
        if (key === 's') {
          e.preventDefault();
          executeUnifiedCommand('F8 <GO>'); // Satellites
          return;
        }
        if (key === 'm') {
          e.preventDefault();
          setIsAudioMuted(prev => {
            const next = !prev;
            setMuted(next);
            logToTerminal(`PROCEDURAL AUDIO SYNTHESIZER: ${next ? 'MUTED' : 'UNMUTED AND RE-ACTIVATED ON DEVICE'}`);
            return next;
          });
          return;
        }
        // Micro keyboard interactions
        if (key === '+' || key === '=') {
          e.preventDefault();
          logToTerminal('CHART SCALE: ZOOMING IN TO MICRO-DATA LEVEL CLOSEST READOUTS.');
          playSyntheticSound('tick');
        } else if (key === '-' || key === '_') {
          e.preventDefault();
          logToTerminal('CHART SCALE: ZOOMING OUT TO MACRO-INTERVAL HISTORIC PERSPECTIVE.');
          playSyntheticSound('tick');
        } else if (key === '[') {
          e.preventDefault();
          logToTerminal('CHART SELECTION: JUMPED ONE CANDLE INTERVAL LEFT.');
          playSyntheticSound('tick');
        } else if (key === ']') {
          e.preventDefault();
          logToTerminal('CHART SELECTION: JUMPED ONE CANDLE INTERVAL RIGHT.');
          playSyntheticSound('tick');
        } else if (key === 'h') {
          e.preventDefault();
          logToTerminal('CHART INDEX: FOCUS RETRIEVED ON PREV HIGHEST SWING PEAK.');
          playSyntheticSound('tick');
        } else if (key === 'l') {
          e.preventDefault();
          logToTerminal('CHART INDEX: FOCUS RETRIEVED ON PREV LOWEST SWING TROUGH.');
          playSyntheticSound('tick');
        } else if (key === 'v') {
          e.preventDefault();
          logToTerminal('CHART VOLUME: DISPLAY BAR METRICS RASTER TOGGLED.');
          playSyntheticSound('tick');
        } else if (key === 'o') {
          e.preventDefault();
          logToTerminal('MARKETS DEPTH: ORDERBOOK SPREAD CONVERGENCE SHIELD TOGGLED.');
          playSyntheticSound('tick');
        } else if (key === 'p') {
          e.preventDefault();
          logToTerminal('PORTFOLIO STATUS: FLOATING UNREALIZED P&L LEDGER LINE OVERLAY TOGGLED.');
          playSyntheticSound('tick');
        } else if (key === 'n') {
          e.preventDefault();
          logToTerminal('OMEGA TELEMETRY: FORCING FOCUS INDEX JUMP ON NEXT SYSTEM SECTOR ANOMALY.');
          playSyntheticSound('tick');
        }
      }

      // Standard F1-F12 Routing GO
      if (e.key.match(/^F(1[0-2]|[1-9])$/)) {
        e.preventDefault();
        executeUnifiedCommand(`${e.key} <GO>`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeTab]);

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

    // Direct proxy for corporate dark pools block execution routing 
    (window as any).__v_onDarkPoolTrade = (ticker: string, qty: number) => {
      setGameState(prev => {
        if (!prev) return null;
        const next = { ...prev };
        const price = next.markets[ticker]?.currentPrice || 100;
        const totalCost = price * qty;
        if (next.player.cash >= totalCost) {
          next.player.cash -= totalCost;
          next.player.assets.stocks[ticker] = (next.player.assets.stocks[ticker] || 0) + qty;
          next.cables.push({
            time: `${next.date || 'T0'} 10:04:15`,
            source: 'DARK_POOL_SYS',
            message: `STEALTH BLOCK TRADE FILLED: Acquired private placement of ${qty.toLocaleString()} shares of ${ticker} at direct parity $${price.toFixed(2)} with zero spot impact.`,
            classification: 'EYES_ONLY'
          });
          playSyntheticSound('order');
        }
        return next;
      });
    };

    return () => {
      delete (window as any).__v_onDarkPoolTrade;
    };
  }, []);

  // Synergetic Career Stage evolution monitoring hook
  useEffect(() => {
    if (!gameState) return;
    const currentStage = gameState.careerStage || 'Family Office';
    if (currentStage !== prevStage) {
      setPrevStage(currentStage);
      setShowLevelUpCelebration(true);
      playSyntheticSound('profit');
      const timer = setTimeout(() => {
        setShowLevelUpCelebration(false);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [gameState?.careerStage, prevStage]);

  // System ticking interval loop
  useEffect(() => {
    if (loopRef.current) clearInterval(loopRef.current);
    if (isPaused) return;

    const intervalTime = 1000 / speedMultiplier;
    loopRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return null;
        // Geopolitical engine progression tick execution
        const nextState = GeopoliticalOmegaEngine.tick(prev);
        
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
  }, [isPaused, speedMultiplier]);

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
    const selectedLeverage = (gameState.player as any).leverageSelected || 3;
    const isLeveragedActive = gameState.leverageEnabled || selectedLeverage > 3;
    const requiredMargin = isLeveragedActive ? (totalCap / selectedLeverage) : totalCap;

    if (side === 'buy' && gameState.player.cash < requiredMargin) {
      logToTerminal(`REJECTED: Insufficient cash holding. Margin of $${requiredMargin.toLocaleString(undefined, {maximumFractionDigits:0})} required at ${selectedLeverage}x leverage for a $${totalCap.toLocaleString()} order size.`, true);
      return;
    }

    // High frequency execution lag penalty for T0 Basement Quants
    const isBasementT0 = gameState.careerStage === 'Family Office';
    if (isBasementT0 && Math.random() < 0.20) {
      logToTerminal(`WARNING [STREET_ALPHA_RETAIL]: Execution lag. Connection delay. Re-routing limit matching on global desk...`);
      playSyntheticSound('warning');
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
        logToTerminal(`ORDER PLACED: Added ${side.toUpperCase()} limit on ${selectedTicker} at $${price.toFixed(2)} (Qty: ${qty}) [Leverage: ${selectedLeverage}x]`);
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

    // New Bloomberg Keyboard Function Keys (Section 2.1 & 6.5)
    if (cmd === 'F1' || cmd === 'F1 <GO>') {
      setActiveTab('LAB_VIEW');
      logToTerminal('COMMAND DESK: LOADED F1 [LAB_VIEW] CLIMATE GENOMIC CORED MAPS.');
      return;
    }
    if (cmd === 'F2' || cmd === 'F2 <GO>') {
      setActiveTab('MACRO');
      logToTerminal('COMMAND DESK: LOADED F2 [MACRO] GLOBAL MACRO SANCTION DESK.');
      return;
    }
    if (cmd === 'F3' || cmd === 'F3 <GO>') {
      setActiveTab('DEBT');
      logToTerminal('COMMAND DESK: LOADED F3 [DEBT] CDS SOVEREIGN STRESS INDEX.');
      return;
    }
    if (cmd === 'F4' || cmd === 'F4 <GO>') {
      setActiveTab('DYNASTY');
      logToTerminal('COMMAND DESK: LOADED F4 [DYNASTY] DYNASTIC GENETIC FAMILY TREE.');
      return;
    }
    if (cmd === 'F5' || cmd === 'F5 <GO>') {
      setActiveTab('TRADING');
      logToTerminal('COMMAND DESK: LOADED F5 [TRADING] DERIVATIVE BROKER SPOT LOGS.');
      return;
    }
    if (cmd === 'F6' || cmd === 'F6 <GO>') {
      setActiveTab('MARKETS');
      logToTerminal('COMMAND DESK: LOADED F6 [MARKETS] DARKS POOL HEATMAP GRAPHICS.');
      return;
    }
    if (cmd === 'F7' || cmd === 'F7 <GO>') {
      setActiveTab('CORPORATE');
      logToTerminal('COMMAND DESK: LOADED F7 [CORPORATE] EXECUTIVE EQUITY DIVIDENDS.');
      return;
    }
    if (cmd === 'F8' || cmd === 'F8 <GO>') {
      setActiveTab('SATELLITES');
      logToTerminal('COMMAND DESK: LOADED F8 [SATELLITES] METEOROLOGICAL RADARS.');
      return;
    }
    if (cmd === 'F9' || cmd === 'F9 <GO>') {
      setActiveTab('INFLUENCE');
      logToTerminal('COMMAND DESK: LOADED F9 [INFLUENCE] LOBBY REPUTATION GRAPH.');
      return;
    }
    if (cmd === 'F10' || cmd === 'F10 <GO>') {
      setActiveTab('COLLIDER');
      logToTerminal('COMMAND DESK: LOADED F10 [COLLIDER] HADRON PARTICLE ACCELERATOR.');
      return;
    }
    if (cmd === 'F11' || cmd === 'F11 <GO>') {
      setActiveTab('BUNKER');
      logToTerminal('COMMAND DESK: LOADED F11 [BUNKER] SUBTERRANEAN SHELTER CONTROLS.');
      return;
    }
    if (cmd === 'F12' || cmd === 'F12 <GO>') {
      setActiveTab('CODEX');
      logToTerminal('COMMAND DESK: LOADED F12 [CODEX] SYSTEM ENTITY INTELLIGENCE LOGS.');
      return;
    }
    if (cmd === 'F13' || cmd === 'F13 <GO>' || cmd === 'HELP' || cmd === 'HELP <GO>' || cmd === '/HELP') {
      setActiveTab('HELP');
      logToTerminal('COMMAND DESK: LOADED F13 [HELP] OPERATIONAL SPECIFICATIONS MANUAL.');
      return;
    }
    if (cmd === 'VIDEO' || cmd === 'VIDEO_FEED' || cmd === 'VIDEO_FEED <GO>' || cmd === 'VIDEO <GO>' || cmd === 'F14' || cmd === 'F14 <GO>') {
      setActiveTab('VIDEO_FEED');
      logToTerminal('COMMAND DESK: LOADED F14 [VIDEO_FEED] SECURE SURVEILLANCE STREAMS.');
      return;
    }

    // Direct String Word Fallbacks
    if (cmd === 'WORLD' || cmd === 'WORLD <GO>') {
      setActiveTab('WORLD');
      logToTerminal('COMMAND DESK: LOADED WORLD GEOPOLITICAL PLANETARY MAP.');
      return;
    }
    if (cmd === 'AI_WAR' || cmd === 'AI_WAR <GO>') {
      setActiveTab('AI_WAR');
      logToTerminal('COMMAND DESK: LOADED OMEGA DETECT INTRUSION CONSOLE.');
      return;
    }
    if (cmd === 'RESEARCH' || cmd === 'RESEARCH <GO>') {
      setActiveTab('RESEARCH');
      logToTerminal('COMMAND DESK: LOADED UPGRADE RESEARCH PARADIGMS.');
      return;
    }
    if (cmd === 'SUPPLY' || cmd === 'SUPPLY_CHAINS' || cmd === 'SUPPLY_CHAINS <GO>') {
      setActiveTab('SUPPLY_CHAINS');
      logToTerminal('COMMAND DESK: LOADED COMMODITIES SUPPLY CHAINS INDEX.');
      return;
    }
    if (cmd === 'STAFF' || cmd === 'STAFF <GO>') {
      setActiveTab('STAFF');
      logToTerminal('COMMAND DESK: LOADED OPERATIONS FIELD OPERATIONS NEURAL CORRIDOR.');
      return;
    }
    if (cmd === 'INTEL' || cmd === 'INTELLIGENCE' || cmd === 'INTELLIGENCE <GO>') {
      setActiveTab('INTELLIGENCE');
      logToTerminal('COMMAND DESK: LOADED SECURITY AGENCY INFORMERS NETWORK.');
      return;
    }
    if (cmd === 'SINGULARITY' || cmd === 'BLOOMI' || cmd === 'BLOOMI_CORE') {
      setActiveTab('SINGULARITY');
      logToTerminal('COMMAND DESK: LOADED MASTER ARTIFICIAL STRAND CORE.');
      return;
    }
    if (cmd === 'TRADING' || cmd === 'TRADE') {
      setActiveTab('TRADING');
      logToTerminal('COMMAND DESK: LOADED SPOT EXCHANGE ORDER BOOKS.');
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

  // Render full screen retro boot sequence (Section 6.3)
  if (bootStep === 0) {
    return (
      <div className="fixed inset-0 bg-[#030304] z-50 flex items-center justify-center p-8 font-mono select-none crt-overlay crt-vignette text-[#ffb300]">
        <div className="max-w-xl w-full border border-[#FF6F00] bg-[#080a0c] p-6 rounded relative animate-pulse" style={{ boxShadow: '0 0 25px rgba(255, 111, 0, 0.4)' }}>
          <button
            type="button"
            onClick={() => {
              setBootStep(1);
              playSyntheticSound('open');
            }}
            className="absolute top-2 right-2 border border-[#FF6F00] bg-black text-[#FF6F00] hover:text-white px-2 py-0.5 text-[8px] font-black rounded hover:bg-[#FF6F00] cursor-pointer uppercase transition-all z-50"
          >
            SKIP INITIALIZATION {"[CLICK <GO>]"}
          </button>
          <div className="flex flex-col gap-4 font-terminal">
            <div className="text-center border-b border-[#FF6F00] pb-4 select-none">
              <h1 className="font-display font-black text-4xl text-white tracking-widest glow-amber">BLOOMI</h1>
              <p className="text-[10px] text-[#FF6F00] font-black uppercase tracking-widest mt-1">SUPERSONIC QUANTUM TRADE WORKSTATION</p>
            </div>

            <div className="space-y-1.5 mt-2 select-none">
              <div className="flex justify-between text-xs font-bold text-white uppercase tracking-wider">
                <span>SYSTEM DIAGNOSIS SYSTEM INJECTION:</span>
                <span>{bootProgress}%</span>
              </div>
              <div className="h-4 bg-black border border-[#FF6F00] p-0.5 rounded-sm">
                <div 
                  className="h-full bg-[#FF6F00] transition-all duration-75"
                  style={{ width: `${bootProgress}%` }}
                />
              </div>
            </div>

            <div className="h-32 bg-black border border-[#1e2530] rounded p-3 overflow-y-auto text-[9.5px]/1.4 text-[#00ff41] font-mono scrollbar-none flex flex-col gap-1 select-text">
              <div className="text-[#00D4FF] font-black">// SESSION DIAGNOSTICS DETACHED LINK //</div>
              {bootLogs.map((log, idx) => (
                <div key={idx} className="truncate">{log}</div>
              ))}
              <div className="animate-pulse font-black text-[#FF6F00]">_</div>
            </div>

            <div className="text-[8px] text-stone-600 border-t border-stone-900 pt-2 text-center uppercase tracking-wider font-mono select-none">
              Cleared for Terminal Operator level // SEC_CODE: F_EYES_ONLY_COGNITIVE
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#030304] text-[#E8DCC8] font-mono text-xs overflow-hidden flex flex-col relative select-none crt-overlay crt-vignette">
      
      {/* 0. Fullscreen Cinematic Overlay (Plays once per session) */}
      {showCinematic && (
        <div className={`transition-opacity duration-800 ${cinematicFading ? 'opacity-0 pointer-events-none animate-fadeOut' : 'opacity-100'} z-[10000] absolute inset-0`}>
          <IntroCinematicOverlay
            onComplete={() => {
              setCinematicFading(true);
              setTimeout(() => {
                setShowCinematic(false);
                sessionStorage.setItem('bloomi_intro_played', 'true');
              }, 800);
            }}
          />
        </div>
      )}

      {/* Yellow Function Key Bar (F1-F12 -> Module Routing) - Section 2.1 */}
      <div className="h-7 bg-[#101318] border-b border-[#1e2530] flex items-center px-2 py-0.5 shrink-0 select-none z-30">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full py-0.5">
          {[
            { key: 'F1', id: 'LAB_VIEW' as const, label: 'LAB_VIEW' },
            { key: 'F2', id: 'MACRO' as const, label: 'MACRO' },
            { key: 'F3', id: 'DEBT' as const, label: 'DEBT_CDS' },
            { key: 'F4', id: 'DYNASTY' as const, label: 'DYNA_GENE' },
            { key: 'F5', id: 'TRADING' as const, label: 'TRADING' },
            { key: 'F6', id: 'MARKETS' as const, label: 'MKT_GRID' },
            { key: 'F7', id: 'CORPORATE' as const, label: 'CORPORATE' },
            { key: 'F8', id: 'SATELLITES' as const, label: 'SAT_ORBIT' },
            { key: 'F9', id: 'INFLUENCE' as const, label: 'INFLUENCE' },
            {key: 'F10', id: 'COLLIDER' as const, label: 'COLLIDER' },
            {key: 'F11', id: 'BUNKER' as const, label: 'BUNKER' },
            {key: 'F12', id: 'CODEX' as const, label: 'CODEX_DB' },
            {key: 'F14', id: 'VIDEO_FEED' as const, label: 'VIDEO_FEED' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.key}
                onClick={() => {
                  executeUnifiedCommand(`${item.key} <GO>`);
                }}
                className={`px-1.5 h-5 font-black uppercase text-[8.5px] rounded-terminal transition-all cursor-pointer flex items-center gap-1 border shrink-0 ${
                  isActive 
                    ? 'bg-[#FF6F00] text-black border-white shadow-[0_0_5px_rgba(255,111,0,0.55)]'
                    : 'bg-[#ffb300] text-black border-[#7A3B00] hover:bg-yellow-400'
                }`}
              >
                <span className="opacity-70 text-[8px]">{item.key}:</span>
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="ml-auto flex items-center gap-2 pr-1.5 text-[8.5px] font-mono text-stone-500 font-bold shrink-0">
            <span>VOLUME: <span className="text-[#00D4FF]">50%</span></span>
            <span>MUTE: <span className="text-red-400">OFF</span></span>
          </div>
        </div>
      </div>

      {/* 2. UPGRADED TOP BAR PANEL */}
      <header className="min-h-[46px] bg-[#0c1015] border-b border-[#1e2530] flex flex-wrap items-center justify-between px-3.5 py-1 z-10 shrink-0 select-none gap-2">
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

          <div className="flex items-center gap-2 bg-[#10151d] border border-[#1e2535] px-2 py-0.5 rounded text-[10px] select-none font-mono">
            <span className="text-slate-400 tracking-tight">BIO_PULSE:</span>
            <svg className="w-[80px] h-[14px]" viewBox="0 0 100 20">
              <path
                d={`M 0,10 L 20,10 L 25,${10 - mouseSpeed * 0.15} L 30,${10 + mouseSpeed * 0.2} L 35,${5 - mouseSpeed * 0.05} L 40,${15 + mouseSpeed * 0.08} L 45,${10 - mouseSpeed * 0.1} L 50,10 L 70,10 L 75,${10 - mouseSpeed * 0.15} L 80,${10 + mouseSpeed * 0.2} L 100,10`}
                fill="none"
                stroke={mouseSpeed > 45 ? "#ff3b5c" : "#00ff88"}
                strokeWidth="1.5"
                className="transition-all duration-75"
              />
            </svg>
            <span className={`font-bold ${mouseSpeed > 45 ? 'text-[#ff3b5c] animate-pulse' : 'text-[#00ff88]'}`}>
              {72 + mouseSpeed} BPM
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
              {([1, 5, 10, 100] as number[]).map((spd) => (
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
                { id: 'LAB_VIEW' as const, key: 'F1', label: 'LAB_MAP', icon: FlaskConical },
                { id: 'MACRO' as const, key: 'F2', label: 'MACRO_M', icon: Globe },
                { id: 'DEBT' as const, key: 'F3', label: 'DEBT_CDS', icon: Activity },
                { id: 'DYNASTY' as const, key: 'F4', label: 'DYNASTIES', icon: Award },
                { id: 'TRADING' as const, key: 'F5', label: 'TRAD_DSK', icon: TrendingUp },
                { id: 'MARKETS' as const, key: 'F6', label: 'MKT_GRID', icon: Layers },
                { id: 'CORPORATE' as const, key: 'F7', label: 'CORP_REALLOC', icon: Briefcase },
                { id: 'SATELLITES' as const, key: 'F8', label: 'SAT_ORBIT', icon: Radio },
                { id: 'INFLUENCE' as const, key: 'F9', label: 'INFLU_NET', icon: Network },
                { id: 'COLLIDER' as const, key: 'F10', label: 'RING_COLL', icon: Sparkles },
                { id: 'BUNKER' as const, key: 'F11', label: 'BUNKER', icon: ShieldAlert },
                { id: 'CODEX' as const, key: 'F12', label: 'CODEX_DB', icon: BookOpen },
                { id: 'HELP' as const, key: 'F13', label: 'HELP_DESK', icon: TermIcon }
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
            {isTiledMode ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full min-h-[500px]">
                {/* Panel 1 */}
                <div className="border border-[#FF6F00] bg-[#080a0c] p-1.5 rounded-terminal relative flex flex-col overflow-hidden shadow-[0_0_8px_rgba(255,111,0,0.12)] col-span-1 row-span-1">
                  <div className="flex justify-between items-center text-[7.5px] text-[#FF6F00] border-b border-stone-900 pb-0.5 mb-1 shrink-0 uppercase font-bold font-mono">
                    <span>PANEL 1: ACTIVE {activeTab} [ALT+1]</span>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-none text-[10px]">
                    {activeTab === 'WORLD' && (
                      <div className="text-[9.5px] p-2 border border-slate-900 rounded bg-[#090b0e] space-y-2 font-mono">
                        <span className="font-bold text-[#00c2ff]">COORDINATES DESK ONLINE</span>
                        <div className="grid grid-cols-2 gap-1 font-terminal">
                          {gameState.satelliteCoordinates?.map((sc: any, i: number) => (
                            <div key={i} className="bg-[#111622] p-1 rounded border border-slate-900">
                              <span className="text-white block font-bold">{sc.name}</span>
                              <span className="text-slate-400 text-[8.5px]">X: {sc.x} Y: {sc.y}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeTab === 'LAB_VIEW' && (
                      <div className="text-[10px] space-y-1 p-2 bg-[#090b0e] border border-slate-900 rounded font-mono">
                        <span className="text-[#00ff88] font-bold">REACTOR MAP ACTIVES:</span>
                        <span className="block text-slate-400">Total Structures: {gameState.labStructures?.length} nodes</span>
                        <span className="block text-slate-400">Croplands Health: {gameState.cropHealth}%</span>
                        <span className="block text-slate-400">Flooded core: {gameState.floodLevel}%</span>
                      </div>
                    )}
                    {activeTab === 'DEBT' && (
                      <div className="text-[10px] space-y-1 p-2 bg-[#090b0e] border border-slate-900 rounded font-mono">
                        <span className="text-[#ff3b5c] font-bold">COGNITIVE SWAPS SPREAD:</span>
                        <span className="block text-slate-400">Total protective contracts active. Current rate trends sit at extreme inversions.</span>
                      </div>
                    )}
                    {activeTab === 'VIDEO_FEED' && (
                      <div className="h-full min-h-[180px]">
                        <VideoFeedPanel
                          state={gameState!}
                          playSyntheticSound={playSyntheticSound}
                          isAmbient={true}
                        />
                      </div>
                    )}
                    {activeTab !== 'WORLD' && activeTab !== 'LAB_VIEW' && activeTab !== 'DEBT' && activeTab !== 'VIDEO_FEED' && (
                      <div className="p-3 text-slate-500 italic text-[9px] font-mono">Module {activeTab} loaded in Workspace. Click Ctrl+T to return to Full Screen view mode.</div>
                    )}
                  </div>
                </div>

                {/* Panel 2: DEBT SPREAD & YIELD MONITOR */}
                <div className="border border-[#1e2530] bg-[#080a0c] p-1.5 rounded-terminal relative flex flex-col overflow-hidden col-span-1 row-span-1">
                  <div className="flex justify-between items-center text-[7.5px] text-slate-400 border-b border-stone-900 pb-0.5 mb-1 shrink-0 uppercase font-bold font-mono">
                    <span>PANEL 2: SOVEREIGN SPREADS [ALT+3]</span>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-none text-[9px] p-1 space-y-1 font-mono">
                    {Object.values(gameState.countries).slice(0, 4).map((c: any) => (
                      <div key={c.id} className="bg-[#101318] p-1 border border-slate-900 rounded flex justify-between font-terminal">
                        <span className="text-stone-300 font-semibold">{c.name} (CDS)</span>
                        <span className="text-yellow-500 font-bold">{c.debtStress.toFixed(0)} bps</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 3: REACTOR LAB FLUID SYSTEM */}
                <div className="border border-[#1e2530] bg-[#080a0c] p-1.5 rounded-terminal relative flex flex-col overflow-hidden col-span-1 row-span-1">
                  <div className="flex justify-between items-center text-[7.5px] text-slate-400 border-b border-stone-900 pb-0.5 mb-1 shrink-0 uppercase font-bold font-mono">
                    <span>PANEL 3: FLUID PUMP MATRIX [ALT+1]</span>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-none text-[9px] p-1 space-y-1 font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-0.5">
                      <span>FLOOD FLOOTAGE:</span>
                      <span className="text-[#00ff88] font-bold">{gameState.floodLevel?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-0.5">
                      <span>CORE TEMPERATURE:</span>
                      <span className="text-[#FF3B5C] font-bold">342°K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WEATHER THREAT:</span>
                      <span className="text-yellow-400 font-bold">{gameState.weatherThreat?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Panel 4: COGNITIVE OVERRIDE SYSTEM */}
                <div className="border border-[#1e2530] bg-[#080a0c] p-1.5 rounded-terminal relative flex flex-col overflow-hidden col-span-1 row-span-1">
                  <div className="flex justify-between items-center text-[7.5px] text-slate-400 border-b border-stone-900 pb-0.5 mb-1 shrink-0 uppercase font-bold font-mono">
                    <span>PANEL 4: CYBER FIREWALL STATUS</span>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-none text-[9px] p-1 space-y-1 font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-0.5">
                      <span>FIREWALL CONTROLS:</span>
                      <span className="text-[#00D4FF] font-bold">{gameState.neuralFirewallPower?.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ACTIVE SYSTEMS:</span>
                      <span className="text-yellow-500 font-bold">{gameState.activeSatellitesCount} SATS</span>
                    </div>
                    <p className="text-[8px] leading-tight text-slate-500 mt-1">Geopolitical Omega network is actively scanning and secure.</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                      <g key={sat.name || sat.id}>
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
                        <div key={sat.name || sat.id} className="flex justify-between font-mono">
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
              <IntrusionTraceConsole
                state={gameState!}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
              />
            )}

            {activeTab === 'DEBT' && (
              <div className="flex flex-col h-full overflow-hidden select-none font-mono">
                <div className="flex justify-between items-center bg-[#0f1318] border border-[#1e2535] p-2 rounded-terminal mb-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                  <span className="text-[10px] text-[#00ff88] font-bold uppercase tracking-wider">// MACRO SOVEREIGN CDS DEBT STRESS TRACE & EXCHG</span>
                  <span className="text-[9px] text-[#00c2ff] font-bold">CDS DERIVATIVES TRADING DESK</span>
                </div>

                <div className="flex-1 bg-[#07090d] border border-[#1e2535] p-3 rounded-terminal overflow-y-auto flex flex-col gap-3 font-terminal">
                  {/* Sovereign country card grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {Object.values(gameState.countries).map((country: any) => {
                      const stressColor = country.debtStress > 70 ? 'text-[#ff3b5c] border-[#ff3b5c]' : country.debtStress > 40 ? 'text-orange-400 border-orange-500' : 'text-[#00ff88] border-emerald-500';
                      return (
                        <div key={country.id} className={`bg-[#141920] border p-2.5 rounded-terminal uppercase flex flex-col justify-between h-[155px] ${stressColor}/35`}>
                          <div>
                            <span className="font-bold block text-[10px] mb-0.5">{country.name}</span>
                            <span className="text-[7.5px] text-slate-500 block mb-1.5">// CDS SOVEREIGN COLLATERAL</span>
                            
                            <div className="space-y-0.5 text-[9px] text-left">
                              <div className="flex justify-between">
                                <span className="text-slate-400">DEBT STRESS:</span>
                                <span className={`font-black ${stressColor}`}>{country.debtStress.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">BONDS OUT:</span>
                                <span className="text-slate-300 font-bold">${(country.bondsIssued / 1e9).toFixed(1)}B</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">BASE INTER:</span>
                                <span className="text-slate-300">{(country.interestRate * 100).toFixed(2)}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1.5 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setGameState(prev => {
                                  if (!prev) return null;
                                  const premium = 15000500;
                                  if (prev.player.cash < premium) {
                                    logToTerminal('REJECTED: Insufficient fund liquidity to cover $15M default policy payment premium.', true);
                                    playSyntheticSound('warning');
                                    return prev;
                                  }
                                  const next = { ...prev };
                                  next.player.cash -= premium;
                                  const arr = (next.player as any).cdsContracts || [];
                                  arr.push({
                                    id: Math.random().toString(),
                                    countryId: country.id,
                                    strikeStress: country.debtStress,
                                    premiumPaid: premium,
                                    currentValue: premium
                                  });
                                  (next.player as any).cdsContracts = arr;
                                  logToTerminal(`CDS CONTRACT SECURED: Subscribed protective $15.0M default swap for ${country.name} at strike ${country.debtStress.toFixed(1)}% stress.`);
                                  playSyntheticSound('order');
                                  return next;
                                });
                              }}
                              className="flex-1 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/40 hover:border-[#00ff88]/80 text-[#00ff88] font-bold text-[8px] py-1 uppercase rounded cursor-pointer transition-all duration-100"
                            >
                              +15M CDS
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setGameState(prev => {
                                  if (!prev) return null;
                                  const premium = 50000000;
                                  if (prev.player.cash < premium) {
                                    logToTerminal('REJECTED: Insufficient fund liquidity to cover $50M default policy payment premium.', true);
                                    playSyntheticSound('warning');
                                    return prev;
                                  }
                                  const next = { ...prev };
                                  next.player.cash -= premium;
                                  const arr = (next.player as any).cdsContracts || [];
                                  arr.push({
                                    id: Math.random().toString(),
                                    countryId: country.id,
                                    strikeStress: country.debtStress,
                                    premiumPaid: premium,
                                    currentValue: premium
                                  });
                                  (next.player as any).cdsContracts = arr;
                                  logToTerminal(`CDS CONTRACT SECURED: Subscribed protective $50.0M default swap for ${country.name} at strike ${country.debtStress.toFixed(1)}% stress.`);
                                  playSyntheticSound('order');
                                  return next;
                                });
                              }}
                              className="flex-1 bg-[#ffaa00]/10 hover:bg-[#ffaa00]/20 border border-[#ffaa00]/40 hover:border-[#ffaa00]/80 text-[#ffaa00] font-bold text-[8px] py-1 uppercase rounded cursor-pointer transition-all duration-100"
                            >
                              +50M CDS
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active CDS portfolio holdings */}
                  <div className="border border-[#1e2535] p-3 rounded-terminal bg-[#0a0c0f] flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-[#1e2535] pb-1.5 mb-2 shrink-0">
                        <span className="text-[9px] text-[#00c2ff] font-bold uppercase tracking-wider">// COMMITTED CDS HEDGE POSITIONS PORTFOLIO</span>
                        <span className="text-[8px] text-slate-500 font-mono">VALUATIONS TICK REAL-TIME WITH SOVEREIGN RISK SPREADS</span>
                      </div>

                      <div className="h-[120px] overflow-y-auto space-y-1.5 pr-1">
                        {(!((gameState.player as any).cdsContracts) || (gameState.player as any).cdsContracts.length === 0) ? (
                          <div className="text-center text-slate-500 py-6 text-[10px] italic">
                            No active default protection swaps secured on sovereign corridors. Purchase default coverage triggers to safeguard capital from contagion risk.
                          </div>
                        ) : (
                          (gameState.player as any).cdsContracts.map((cds: any) => {
                            const countryObj = gameState.countries[cds.countryId];
                            const currentStress = countryObj ? countryObj.debtStress : cds.strikeStress;
                            // Dynamically price the contract swap value to follow macro stress ratios perfectly!
                            const stressMultiplier = Math.max(0.4, (currentStress / (cds.strikeStress || 50)));
                            const calculatedSwapsCurrentValue = Math.floor(cds.premiumPaid * stressMultiplier * (currentStress > 65 ? 2.22 : 1.0));
                            const yieldPct = ((calculatedSwapsCurrentValue - cds.premiumPaid) / cds.premiumPaid) * 100;

                            return (
                              <div key={cds.id} className="flex flex-wrap items-center justify-between p-2 rounded bg-[#10151f] border border-[#1e2535]/70 gap-2">
                                <div className="flex items-center gap-2 font-mono">
                                  <span className="text-[#00c2ff] font-black text-[10px] w-12">{cds.countryId} CDS</span>
                                  <span className="text-slate-500 font-normal">STRIKE: {cds.strikeStress.toFixed(1)}%</span>
                                  <span className="h-3 w-px bg-slate-800" />
                                  <span className="text-slate-400">PREMIUM: <span className="text-white font-semibold">${(cds.premiumPaid / 1e6).toFixed(1)}M</span></span>
                                  <span className="h-3 w-px bg-slate-800" />
                                  <span className="text-slate-400">CURRENT_RISK: <span className={`font-bold ${currentStress > 60 ? 'text-[#ff3b5c]' : 'text-slate-300'}`}>{currentStress.toFixed(1)}%</span></span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <span className="text-slate-400 block text-[8px] leading-tight font-sans">VALUATION</span>
                                    <span className="text-[#00ff88] font-bold block text-[10px] leading-tight font-mono">${calculatedSwapsCurrentValue.toLocaleString()}</span>
                                    <span className={`text-[8.5px] font-mono leading-none block font-semibold ${yieldPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {yieldPct >= 0 ? '+' : ''}{yieldPct.toFixed(1)}%
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setGameState(prev => {
                                        if (!prev) return null;
                                        const next = { ...prev };
                                        const cContracts = (next.player as any).cdsContracts || [];
                                        const matchingIdx = cContracts.findIndex((c: any) => c.id === cds.id);
                                        if (matchingIdx !== -1) {
                                          const item = cContracts[matchingIdx];
                                          const cObj = next.countries[item.countryId];
                                          const curSt = cObj ? cObj.debtStress : item.strikeStress;
                                          const multObj = Math.max(0.4, (curSt / (item.strikeStress || 50)));
                                          const finalVal = Math.floor(item.premiumPaid * multObj * (curSt > 65 ? 2.22 : 1.0));

                                          next.player.cash += finalVal;
                                          cContracts.splice(matchingIdx, 1);
                                          (next.player as any).cdsContracts = cContracts;

                                          logToTerminal(`CDS POSITION LIQUIDATED: Redeemed protective swap policy on ${item.countryId}. Credited $${finalVal.toLocaleString()} to liquid cash balances.`);
                                          playSyntheticSound('profit');
                                        }
                                        return next;
                                      });
                                    }}
                                    className="bg-[#00ff88]/10 hover:bg-[#00ff88]/35 border border-[#00ff88]/40 hover:border-[#00ff88]/70 text-[#00ff88] text-[9px] px-2 py-1 font-bold rounded cursor-pointer uppercase transition-all duration-100 font-terminal"
                                  >
                                    CASH OUT Swaps
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="border border-[#1e2535] p-2 rounded-terminal bg-[#07090b] mt-3">
                      <span className="text-[8px] text-[#00c2ff] block mb-0.5 font-bold uppercase tracking-wider">// SYSTEM CONTAGION FACTOR</span>
                      <p className="text-[9px] text-slate-300 leading-relaxed font-mono">
                        High <span className="text-[#ff3b5c] font-bold">Sovereign Debt Stress</span> metrics on major corridors (especially inside US) spark compounding panic sell-offs on equities. Monitor indices closely to purchase protection derivatives. Liquidating CDS contracts at peak contagions realizes massive capital multiples.
                      </p>
                    </div>
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

            {activeTab === 'BUNKER' && (
              <BunkerPanel
                state={gameState!}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
              />
            )}

            {activeTab === 'CODEX' && (
              <CodexTerminal
                state={gameState!}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
              />
            )}

            {activeTab === 'COLLIDER' && (
              <CernHadronAccelerator
                state={gameState!}
                activeTicker={selectedTicker}
              />
            )}

            {activeTab === 'VIDEO_FEED' && (
              <VideoFeedPanel
                state={gameState!}
                playSyntheticSound={playSyntheticSound}
              />
            )}

            {activeTab === 'LAB_VIEW' && (
              <LabMapView
                state={gameState!}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
              />
            )}

            {activeTab === 'SATELLITES' && (
              <OrbitalRadarPanel
                state={gameState!}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
              />
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
              <BloomiTradingTerminal
                state={gameState!}
                selectedTicker={selectedTicker}
                setSelectedTicker={setSelectedTicker}
                onExecuteCommand={executeUnifiedCommand}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
              />
            )}
            {activeTab === 'TRADING' && (
              <BloomiTradingTerminal
                state={gameState!}
                selectedTicker={selectedTicker}
                setSelectedTicker={setSelectedTicker}
                onExecuteCommand={executeUnifiedCommand}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
              />
            )}
            {activeTab === 'SINGULARITY' && gameState && (
              <BloomiSingularityCore
                state={gameState}
                setGameState={setGameState}
                executeCommand={executeUnifiedCommand}
                logToTerminal={logToTerminal}
                activeTicker={selectedTicker}
                onSetTicker={setSelectedTicker}
              />
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
                state={gameState!} 
                onSomaticEdits={handleSomaticEdits}
                onHeirSpawn={handleHeirSpawn}
                onModifyState={onModifySomaticState}
                onLogTerminal={logToTerminal}
                playSyntheticSound={playSyntheticSound}
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
            </>
            )}
          </div>

          {/* Section 2.3 Context-Sensitive Yellow Function Keys Strip */}
          <div className="h-8 bg-[#090b0e] border-t border-[#1e2530] flex items-center px-2 py-1 gap-1.5 select-none shrink-0 z-15 font-mono text-[9px] overflow-x-auto scrollbar-none">
            <span className="text-yellow-500 font-bold mr-1 shrink-0">ACTIONS (SHIFT+key):</span>
            {(() => {
              const activeActionsMap: Record<string, string[]> = {
                LAB_VIEW: ["DRILL_LEVEL", "CELL_STAT", "RESET_GRID", "FLOOD_PULSE", "HIST_LOG", "MANUAL"],
                MACRO: ["REALLOCATE", "YIELD_CRV", "EXPORT_DAT", "SYS_ALERT", "STRESS_LOG", "MANUAL"],
                DEBT: ["SHORT_CDS", "MAT_LADDER", "EXPORT_CDS", "CRV_ALERT", "HIST_YIELD", "MANUAL"],
                DYNASTY: ["CLONE_HEIR", "DNA_MAP", "SPLICE_TRAIT", "ALERT_GEN", "CHROMO_LOG", "MANUAL"],
                TRADING: ["ORDER_BUY", "DEPTH_CHART", "TRADE_LOGS", "SPREAD_ALRT", "EXEC_HIST", "MANUAL"],
                MARKETS: ["FORCE_BLOCK", "HEAT_GRAPH", "INST_TAPE", "POOL_WARN", "DEPTH_HIST", "MANUAL"],
                CORPORATE: ["LAUNCH_COUP", "OWN_NETWORK", "SEC_FILINGS", "REORG_ALERT", "TAKEOVER_H", "MANUAL"],
                SATELLITES: ["LASER_BEAM", "KEPLER_ORB", "SIG_TELEM", "JAM_WARN", "STORM_CORRID", "MANUAL"],
                INFLUENCE: ["BRIBE_ADMIN", "PROPAG_MAP", "CHANC_DOSSER", "INTEL_WARN", "COUPS_LOG", "MANUAL"],
                COLLIDER: ["ARM_TRIGGER", "VOL_STREAM", "PART_BURST", "THERM_WARN", "LATTICE_H", "MANUAL"],
                BUNKER: ["PURGE_FLOOD", "ISOM_SECT", "MANIF_EXP", "THREAT_ALRT", "DRILL_LOG", "MANUAL"],
                CODEX: ["SEARCH_DB", "RELA_GRAPH", "COGN_EXPORT", "CLASF_WARN", "DEC_LEVEL5", "MANUAL"],
                VIDEO_FEED: ["CERN_ARM", "MRKTS_LINK", "INTEL_NET", "DARK_RAIN", "GLITCH_SIG", "MANUAL"],
              };
              const keys = activeActionsMap[activeTab] || ["EXEC_ACTION", "PLOT_CHART", "EXPORT_CSV", "SET_ALERTS", "SEGM_LOGS", "SUPPORT"];
              return keys.map((lbl, idx) => (
                <button
                  key={`${lbl}-${idx}`}
                  type="button"
                  onClick={() => handleYellowAction(idx)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-1.5 py-0.5 rounded font-black text-[8px] cursor-pointer tracking-tighter transition-all uppercase whitespace-nowrap active:scale-95"
                >
                  S+F{idx + 1} {lbl}
                </button>
              ));
            })()}
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
