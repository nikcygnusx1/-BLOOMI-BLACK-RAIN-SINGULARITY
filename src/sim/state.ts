/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimState, DynastyMember, Country, Company, CryptoChain, HedgeFund, InfluenceNode, Market, HistoryPoint } from '../types';

export function createInitialWorld(params: {
  name: string;
  nationality: string;
  education: string;
  background: string;
  capital: number;
  intel: number;
  charisma: number;
  ambition: number;
  risk: number;
  connections: number;
}): SimState {
  // 1. Player Character and initial Head of Dynasty with genetic traits
  const playerTraits = {
    intel: params.intel,
    charisma: params.charisma,
    ambition: params.ambition,
    risk: params.risk,
    connections: params.connections,
  };

  const initialMember: DynastyMember = {
    name: params.name,
    role: 'Head of Dynasty',
    age: 35,
    status: 'Alive',
    sociopathyIndex: params.background === 'Quant' ? 85 : 50,
    geneticEdits: params.background === 'Quant' ? ['Amoral Synaptic Relay'] : ['Natural Rhetoric Core'],
  };

  // 2. Initialize Geopolitics & Major Countries
  const countriesArray: Country[] = [
    {
      id: 'US',
      name: 'United States',
      gdp: 28000000000000,
      gdpGrowth: 0.024,
      inflation: 0.025,
      unemployment: 0.038,
      stability: 85,
      unrest: 15,
      taxRates: { income: 0.30, capitalGains: 0.20, corporate: 0.21 },
      interestRate: 0.045,
      moneySupply: 21000000000000,
      bondsIssued: 34000000000000,
      budget: 5000000000000,
      opinionOfPlayer: 50,
      centralBank: {
        rate: 0.045,
        balanceSheet: 8400000000000,
        liquidityInjection: 0,
        printingPressOverride: false
      },
      capturedLobbyFraction: 0.15
    },
    {
      id: 'CN',
      name: 'China',
      gdp: 19000000000000,
      gdpGrowth: 0.045,
      inflation: 0.015,
      unemployment: 0.052,
      stability: 90,
      unrest: 10,
      taxRates: { income: 0.25, capitalGains: 0.10, corporate: 0.25 },
      interestRate: 0.032,
      moneySupply: 38000000000000,
      bondsIssued: 15000000000000,
      budget: 3500000000000,
      opinionOfPlayer: 40,
      centralBank: {
        rate: 0.032,
        balanceSheet: 6200000000000,
        liquidityInjection: 0,
        printingPressOverride: false
      },
      capturedLobbyFraction: 0.05
    },
    {
      id: 'EU',
      name: 'European Union',
      gdp: 18500000000000,
      gdpGrowth: 0.012,
      inflation: 0.020,
      unemployment: 0.065,
      stability: 80,
      unrest: 20,
      taxRates: { income: 0.40, capitalGains: 0.26, corporate: 0.25 },
      interestRate: 0.0375,
      moneySupply: 16000000000000,
      bondsIssued: 14000000000000,
      budget: 4100000000000,
      opinionOfPlayer: 60,
      centralBank: {
        rate: 0.0375,
        balanceSheet: 5100000000000,
        liquidityInjection: 0,
        printingPressOverride: false
      },
      capturedLobbyFraction: 0.08
    },
    {
      id: 'CH',
      name: 'Switzerland',
      gdp: 850000000000,
      gdpGrowth: 0.015,
      inflation: 0.010,
      unemployment: 0.020,
      stability: 98,
      unrest: 2,
      taxRates: { income: 0.22, capitalGains: 0.0, corporate: 0.15 },
      interestRate: 0.015,
      moneySupply: 900000000000,
      bondsIssued: 120000000000,
      budget: 180000000000,
      opinionOfPlayer: 70,
      centralBank: {
        rate: 0.015,
        balanceSheet: 450000000000,
        liquidityInjection: 0,
        printingPressOverride: false
      },
      capturedLobbyFraction: 0.12
    }
  ];

  const countries: Record<string, Country> = {};
  countriesArray.forEach(c => {
    countries[c.id] = c;
  });

  // 3. Companies & Markets Seeding
  const rawCompanies = [
    { id: 'aplh', name: 'AlphaTech AI', ticker: 'APLH', industry: 'AI' as const, country: 'US', shares: 1000000000, price: 150, cash: 5000000000, debt: 1000000000, revenue: 1200000000, expenses: 800000000 },
    { id: 'heli', name: 'Helios Fusion', ticker: 'HELI', industry: 'Energy' as const, country: 'US', shares: 500000000, price: 85, cash: 2000000000, debt: 5000000000, revenue: 300000000, expenses: 450000000 },
    { id: 'vanc', name: 'Vanguard Defence', ticker: 'VANC', industry: 'Defense' as const, country: 'US', shares: 400000000, price: 210, cash: 3000000000, debt: 800000000, revenue: 950000000, expenses: 780000000 },
    { id: 'glob', name: 'Global Logistics', ticker: 'GLOB', industry: 'Logistics' as const, country: 'EU', shares: 600000000, price: 45, cash: 800000000, debt: 1200000000, revenue: 500000000, expenses: 460000000 },
    { id: 'nord', name: 'Nordic Bank', ticker: 'NORD', industry: 'Banking' as const, country: 'EU', shares: 800000000, price: 72, cash: 15000000000, debt: 12000000000, revenue: 800000000, expenses: 500000000 },
    { id: 'medi', name: 'MediaOne Group', ticker: 'MEDI', industry: 'Media' as const, country: 'US', shares: 300000000, price: 30, cash: 400000000, debt: 600000000, revenue: 250000000, expenses: 230000000 },
    { id: 'drag', name: 'Dragon Semiconductor', ticker: 'DRAG', industry: 'AI' as const, country: 'CN', shares: 2000000000, price: 90, cash: 6000000000, debt: 2000000000, revenue: 1500000000, expenses: 1100000000 },
    { id: 'sino', name: 'Sino Resource Matrix', ticker: 'SINO', industry: 'Energy' as const, country: 'CN', shares: 1500000000, price: 35, cash: 4000000000, debt: 3000000000, revenue: 1100000000, expenses: 950000000 },
    { id: 'gene', name: 'GeneEdit Therapeutics', ticker: 'GENE', industry: 'Healthcare' as const, country: 'CH', shares: 250000000, price: 180, cash: 1200000000, debt: 200000000, revenue: 150000000, expenses: 200000000 }
  ];

  const companies: Company[] = rawCompanies.map(c => ({
    id: c.id,
    name: c.name,
    ticker: c.ticker,
    industry: c.industry,
    country: c.country,
    sharesOutstanding: c.shares,
    sharePrice: c.price,
    marketCap: c.shares * c.price,
    cash: c.cash,
    debt: c.debt,
    revenue: c.revenue,
    expenses: c.expenses,
    profit: c.revenue - c.expenses,
    board: [
      { name: 'Seat Alpha', owner: 'Founders' },
      { name: 'Seat Beta', owner: 'Institutional Holdings' },
      { name: 'Seat Gamma', owner: 'Retail Cascade' }
    ],
    shareholders: {
      'institutional_main': Math.floor(c.shares * 0.5),
      'retail_public': Math.floor(c.shares * 0.5)
    },
    layoffsPercentage: 0
  }));

  const markets: Record<string, Market> = {};
  companies.forEach(c => {
    markets[c.ticker] = {
      ticker: c.ticker,
      type: 'equity',
      currentPrice: c.sharePrice,
      orderBook: { bids: [], asks: [] },
      history: generateMockHistory(c.sharePrice, 100),
      liquidity: 1.0
    };
  });

  // 4. Crypto Networks Seeding
  const rawCryptoChains: CryptoChain[] = [
    { id: 'L1_ETH', name: 'Ethernet Prime', ticker: 'ETHP', tvl: 85000000000, tokenPrice: 3200, validators: 250, activeUsers: 500000, gasPriceGwei: 28, bankRunTriggered: false },
    { id: 'L1_SOL', name: 'Sol Velocity', ticker: 'SOLV', tvl: 12000000000, tokenPrice: 140, validators: 120, activeUsers: 1500000, gasPriceGwei: 15, bankRunTriggered: false }
  ];

  const cryptoChains: Record<string, CryptoChain> = {};
  rawCryptoChains.forEach(chain => {
    cryptoChains[chain.id] = chain;
    markets[chain.ticker] = {
      ticker: chain.ticker,
      type: 'crypto',
      currentPrice: chain.tokenPrice,
      orderBook: { bids: [], asks: [] },
      history: generateMockHistory(chain.tokenPrice, 100),
      liquidity: 0.8
    };
  });

  // 5. Predatory Hedge Funds ("Pattern-Hunting Wolves" of the dark liquidity pool)
  const hedgeFunds: HedgeFund[] = [
    { id: 'blackstone_shadow', name: 'Noxious Asset Capital', cash: 15000000000, positions: { 'APLH': 25000000, 'ETHP': 1500000 }, strategy: 'LongShort', leverage: 5, isWolf: true, dynastyEnemy: false },
    { id: 'vanguard_iron', name: 'IronClad Arbitrage Desk', cash: 25000000000, positions: { 'HELI': 30000000, 'SOLV': 5000000 }, strategy: 'Arbitrage', leverage: 3, isWolf: true, dynastyEnemy: false },
    { id: 'citadel_scythe', name: 'Scythe Quant Holdings', cash: 32000000000, positions: { 'DRAG': 45000000, 'VANC': 12000000 }, strategy: 'Vampire', leverage: 10, isWolf: true, dynastyEnemy: true }
  ];

  // 6. Seed Shadow Network Influence Desks
  const influenceNodes: InfluenceNode[] = [
    { id: 'wash_lobby', name: 'Capitol Hill Coalition', type: 'Lobby', nation: 'US', influenceCap: 100, fundingRequired: 50000000, playerControlWeight: 15 },
    { id: 'cia_analog', name: 'Apex Intelligence Directive', type: 'Intelligence', nation: 'US', influenceCap: 100, fundingRequired: 75000000, playerControlWeight: 5 },
    { id: 'beijing_com', name: 'State Production Commission', type: 'State Machine', nation: 'CN', influenceCap: 100, fundingRequired: 100000000, playerControlWeight: 2 },
    { id: 'brussels_reg', name: 'DG Antitrust Oversight', type: 'Regulator', nation: 'EU', influenceCap: 100, fundingRequired: 60000000, playerControlWeight: 8 }
  ];

  // Let core stability start healthy
  const globalStability = 82;
  const globalSuffering = 18;

  // Initial Diplomatic cables
  const cables = [
    { time: '2026-06-08 12:55:00', source: 'APEX_INT', message: 'NSA Terminal Online. Access Granted. Operational Protocol: PROJECT OMEGA-ASCENSION initiated.', classification: 'EYES_ONLY' as const },
    { time: '2026-06-08 12:55:01', source: 'FED_RESERVE', message: 'Notice: Shadow repo rates spiking in dark pool clearance networks. Liquidity tightness observed.', classification: 'CONFIDENTIAL' as const }
  ];

  const hiringPool = [
    { id: 'al_1', name: 'Dominik Vance', salary: 150000, specialty: 'AI & Semiconductors Quant', tier: 'Senior' },
    { id: 'al_2', name: 'Sophia Sterling', salary: 80000, specialty: 'Macro Sovereign Bonds', tier: 'Associate' },
    { id: 'al_3', name: 'Dr. Evelyn Biotech', salary: 120000, specialty: 'Transgenic Eugenics & Pharma', tier: 'VP' }
  ];

  const initialChatLogs = [
    { sender: 'analyst' as const, timestamp: '12:55:00', text: 'Sovereign AI Terminal connection established. Welcome, Manager. Ready to run multi-billion capital desk.' }
  ];

  return {
    currentTick: 0,
    date: '2026-06-08',
    globalStability,
    globalSuffering,
    careerStage: 'Family Office',
    highWaterMark: params.capital,
    shorts: {},
    leverageEnabled: true,
    marginCallWarning: false,
    lastDailyReturns: [0.015, -0.005, 0.02, 0.01],
    benchmarkReturns: [0.005, -0.002, 0.003, 0.008],
    hiredAnalysts: [],
    hiringPool,
    chatLogs: initialChatLogs,
    player: {
      id: 'player_dynasty',
      name: params.name,
      nationality: params.nationality,
      education: params.education,
      background: params.background,
      cash: params.capital,
      influence: 20,
      traits: playerTraits,
      assets: {
        stocks: {},
        crypto: {},
        bonds: {},
        lobbyists: 0,
        analysts: 0,
        informants: 0
      }
    },
    dynasty: {
      prestige: 100,
      generation: 1,
      members: [initialMember]
    },
    countries,
    companies,
    markets,
    cryptoChains,
    hedgeFunds,
    influenceNodes,
    traumaLog: [],
    cables,
    simulationSpeed: 0 // Game starts paused
  };
}

// Generate starting random history for high quality visualization
function generateMockHistory(startPrice: number, points: number) {
  const history: HistoryPoint[] = [];
  let current = startPrice;
  const today = new Date('2026-06-08');

  for (let i = points; i > 0; i--) {
    const change = current * (Math.random() - 0.48) * 0.04;
    const open = current;
    const close = Math.max(0.01, current + change);
    const high = Math.max(open, close) + Math.random() * (current * 0.015);
    const low = Math.max(0.01, Math.min(open, close) - Math.random() * (current * 0.015));
    const volume = Math.floor(Math.random() * 800000 + 200000);

    const d = new Date(today);
    d.setDate(d.getDate() - i * 7);

    history.push({
      open,
      high,
      low,
      close,
      volume,
      date: d.toISOString().split('T')[0]
    });

    current = close;
  }
  return history;
}

// Save & Load state to storage
export function saveSimState(state: SimState, saveName: string = 'omega_autosave') {
  try {
    localStorage.setItem(saveName, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('Failed to save state:', e);
    return false;
  }
}

export function loadSimState(saveName: string = 'omega_autosave'): SimState | null {
  try {
    const raw = localStorage.getItem(saveName);
    if (!raw) return null;
    const loaded = JSON.parse(raw);
    if (loaded) {
      if (!loaded.hiredAnalysts) loaded.hiredAnalysts = [];
      if (!loaded.hiringPool) {
        loaded.hiringPool = [
          { id: 'al_1', name: 'Dominik Vance', salary: 150000, specialty: 'AI & Semiconductors Quant', tier: 'Senior' },
          { id: 'al_2', name: 'Sophia Sterling', salary: 80000, specialty: 'Macro Sovereign Bonds', tier: 'Associate' },
          { id: 'al_3', name: 'Dr. Evelyn Biotech', salary: 120000, specialty: 'Transgenic Eugenics & Pharma', tier: 'VP' }
        ];
      }
      if (!loaded.shorts) loaded.shorts = {};
      if (!loaded.chatLogs) {
        loaded.chatLogs = [
          { sender: 'analyst', timestamp: '12:55:00', text: 'Sovereign AI Terminal connection established. Welcome, Manager.' }
        ];
      }
      if (!loaded.lastDailyReturns) loaded.lastDailyReturns = [0.015, -0.005, 0.02, 0.01];
      if (!loaded.benchmarkReturns) loaded.benchmarkReturns = [0.005, -0.002, 0.003, 0.008];
      if (!loaded.highWaterMark) loaded.highWaterMark = loaded.player?.cash || 100000000;
      if (!loaded.careerStage) loaded.careerStage = 'Family Office';
      if (!loaded.cables) loaded.cables = [];
      if (!loaded.traumaLog) loaded.traumaLog = [];
      if (loaded.player) {
        if (!loaded.player.assets) {
          loaded.player.assets = {
            stocks: {},
            crypto: {},
            bonds: {},
            lobbyists: 0,
            analysts: 0,
            informants: 0
          };
        } else {
          if (!loaded.player.assets.stocks) loaded.player.assets.stocks = {};
          if (!loaded.player.assets.crypto) loaded.player.assets.crypto = {};
          if (!loaded.player.assets.bonds) loaded.player.assets.bonds = {};
        }
      }
    }
    return loaded;
  } catch (e) {
    console.error('Failed to load state:', e);
    return null;
  }
}
