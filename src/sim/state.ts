/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimState, DynastyMember, Country, Company, CryptoChain, HedgeFund, InfluenceNode, Market, HistoryPoint, LabStructure, ResearchNode, LaboratoryStaff } from '../types';

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
      capturedLobbyFraction: 0.15,
      foodSecurity: 92,
      debtStress: 28,
      aiPenetration: 15,
      volatility: 18,
      politicalHeat: 20,
      resourceValue: 85
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
      capturedLobbyFraction: 0.05,
      foodSecurity: 88,
      debtStress: 42,
      aiPenetration: 45,
      volatility: 22,
      politicalHeat: 35,
      resourceValue: 95
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
        liquidityInjection: 1000000,
        printingPressOverride: false
      },
      capturedLobbyFraction: 0.08,
      foodSecurity: 85,
      debtStress: 36,
      aiPenetration: 25,
      volatility: 20,
      politicalHeat: 25,
      resourceValue: 70
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
      capturedLobbyFraction: 0.12,
      foodSecurity: 98,
      debtStress: 10,
      aiPenetration: 12,
      volatility: 12,
      politicalHeat: 5,
      resourceValue: 50
    }
  ];

  const countries: Record<string, Country> = {};
  countriesArray.forEach(c => {
    countries[c.id] = c;
  });

  // 3. New Companies List (with agricultural/weather-hedging firms)
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
      history: generateMockHistory(c.sharePrice, 35),
      liquidity: 1.0
    };
  });

  // Adding climate-finance tickers
  const climateTickers = [
    { ticker: 'WETH-FUT', price: 280, type: 'derivative' as const, desc: 'Weather Sovereign Index Futures' },
    { ticker: 'SOY-CROP', price: 65, type: 'commodity' as const, desc: 'Transgenic Soy Crop Index' },
    { ticker: 'CARB-CRD', price: 120, type: 'derivative' as const, desc: 'Carbon Offset Emissions Contracts' },
    { ticker: 'DIS-INS', price: 190, type: 'derivative' as const, desc: 'Disaster Insurance Annuities' },
    { ticker: 'H2O-LIQ', price: 42, type: 'commodity' as const, desc: 'Global Water Reserves Index' }
  ];

  climateTickers.forEach(ct => {
    companies.push({
      id: ct.ticker.toLowerCase(),
      name: ct.desc,
      ticker: ct.ticker,
      industry: 'Agriculture' as const,
      country: 'CH',
      sharesOutstanding: 500000000,
      sharePrice: ct.price,
      marketCap: 500000000 * ct.price,
      cash: 1000000000,
      debt: 0,
      revenue: 50000000,
      expenses: 40000000,
      profit: 10000000,
      board: [{ name: 'Seat Alfa', owner: 'Founders' }],
      shareholders: { 'retail_public': 500000000 },
      layoffsPercentage: 0
    });

    markets[ct.ticker] = {
      ticker: ct.ticker,
      type: ct.type,
      currentPrice: ct.price,
      orderBook: { bids: [], asks: [] },
      history: generateMockHistory(ct.price, 35),
      liquidity: 0.95
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
      history: generateMockHistory(chain.tokenPrice, 35),
      liquidity: 0.8
    };
  });

  // 5. Predatory Hedge Funds
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

  // Initial Diplomatic cables
  const cables = [
    { time: '2026-06-08 12:55:00', source: 'BIO_COM', message: 'Sovereign Lab Terminal initialized. Cybernetic agricultural simulation online.', classification: 'EYES_ONLY' as const },
    { time: '2026-06-08 12:55:01', source: 'FED_RESERVE', message: 'Sub-atmospheric futures (WETH-FUT) experiencing high option bidding density.', classification: 'CONFIDENTIAL' as const }
  ];

  const hiringPool = [
    { id: 'al_1', name: 'Dominik Vance', salary: 150000, specialty: 'AI & Semiconductors Quant', tier: 'Senior' },
    { id: 'al_2', name: 'Sophia Sterling', salary: 80000, specialty: 'Macro Sovereign Bonds', tier: 'Associate' },
    { id: 'al_3', name: 'Dr. Evelyn Biotech', salary: 120000, specialty: 'Transgenic Eugenics & Pharma', tier: 'VP' }
  ];

  const initialChatLogs = [
    { sender: 'analyst' as const, timestamp: '12:55:00', text: 'Black Rain Lab terminals synchronized. Weather radar is armed. Commodity futures metrics online.' }
  ];

  // Starting Lab Structures configurations
  const labStructures: LabStructure[] = [
    { id: 'str_1', type: 'COMMAND_ROOM', x: 4, y: 3, level: 1, health: 100, powerUsage: 10, waterUsage: 2, lastTickActive: true },
    { id: 'str_2', type: 'CROP_POD', x: 2, y: 2, level: 1, health: 100, powerUsage: 15, waterUsage: 25, lastTickActive: true },
    { id: 'str_3', type: 'SERVER_RACK', x: 6, y: 2, level: 1, health: 100, powerUsage: 25, waterUsage: 5, lastTickActive: true },
    { id: 'str_4', type: 'BIO_REACTOR', x: 3, y: 5, level: 1, health: 100, powerUsage: -40, waterUsage: 10, lastTickActive: true } // Negative power usage means it generates base power!
  ];

  // Starting Lab Staff
  const labStaff: LaboratoryStaff[] = [
    { id: 'stf_1', name: 'Mitch Miller', role: 'QUANT', salary: 120000, skill: 75, stress: 25, loyalty: 90, trait: 'Overclock Specialist' },
    { id: 'stf_2', name: 'Dr. Sarah Rain', role: 'BIOLOGIST', salary: 95000, skill: 82, stress: 15, loyalty: 80, trait: 'Drought Synthesizer' },
    { id: 'stf_3', name: 'Jax Spark', role: 'ENGINEER', salary: 85000, skill: 68, stress: 30, loyalty: 75, trait: 'Lightning Mitigator' }
  ];

  // Research tree initialization
  const researchTree: Record<string, ResearchNode> = {
    syntheticDroughtCrops: { id: 'syntheticDroughtCrops', name: 'Synthetic Drought Crops', cost: 200, unlocked: false, description: 'Soma-engineered seeds resistant to extreme Heat Domes.', benefits: ['Crops withstand HEAT_DOME damage by 50%', 'Boost agricultural futures trading margins'] },
    floodResistantRoots: { id: 'floodResistantRoots', name: 'Flood-resistant Roots', cost: 350, unlocked: false, description: 'Hydro-repellent genetic structures that prevent flash flood rot.', benefits: ['Crops withstand FLASH_FLOOD damage by 70%'] },
    weatherPredictionAI: { id: 'weatherPredictionAI', name: 'Weather Prediction AI', cost: 150, unlocked: false, description: 'Overlocked deep neural nets calculating atmospheric moisture vectors.', benefits: ['Advance warnings of anomalous climate impacts', 'Weather derivatives prediction boosts (+20% gains)'] },
    atmosphericArbitrage: { id: 'atmosphericArbitrage', name: 'Atmospheric Arbitrage', cost: 400, unlocked: false, description: 'Deploy algorithmic high-frequency bots on real-time radar data feeds.', benefits: ['Automates WETH-FUT coverage hedging'] },
    carbonCaptureScaling: { id: 'carbonCaptureScaling', name: 'Carbon Capture Scaling', cost: 300, unlocked: false, description: 'Graphene composite matrices filtering atmospheric CO2 directly.', benefits: ['Generates passive cash flow ($500K per CC structure per tick)'] },
    autonomousLabDrones: { id: 'autonomousLabDrones', name: 'Autonomous Lab Drones', cost: 250, unlocked: false, description: 'Compact hovering repair nodes keeping sectors structural integrity intact.', benefits: ['Auto-repairs damaged lab equipment without requiring actions'] },
    quantumVolatilityEngine: { id: 'quantumVolatilityEngine', name: 'Quantum Volatility Engine', cost: 500, unlocked: false, description: 'Predict and ride market shocks generated during massive weather panic cascades.', benefits: ['Yields large cash bonuses during extreme market crashes'] },
    syntheticRainfall: { id: 'syntheticRainfall', name: 'Synthetic Rainfall Systems', cost: 600, unlocked: false, description: 'Silicate chemical rain seeding drones manipulated remotely.', benefits: ['Unlocks the Synthetic Rainfall operational control'] },
    crisisTradingAlgorithms: { id: 'crisisTradingAlgorithms', name: 'Crisis Trading Algos', cost: 450, unlocked: false, description: 'Automatic short positions triggering upon major disaster detection.', benefits: ['Boost portfolio leverage options'] },
    climateShield: { id: 'climateShield', name: 'Atmospheric Aegis Shield', cost: 1000, unlocked: false, description: 'Static electrostatic canopy fields blocking radioactive rains.', benefits: ['Prevents weather disaster room damage completely'] }
  };

  return {
    currentTick: 0,
    date: '2026-06-08',
    globalStability: 82,
    globalSuffering: 18,
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
    simulationSpeed: 0,

    // --- NEW LAB PARAMS SEEDING ---
    biomass: 500,
    labPowerMax: 100,
    labPowerUsed: 50,
    labWaterMax: 100,
    labWaterUsed: 42,
    cropHealth: 95,
    weatherThreat: 10,
    regulatoryHeat: 15,
    reputation: 60,
    currentWeather: 'CLEAR',
    weatherTicksRemaining: 0,
    floodLevel: 0,
    labStructures,
    researchTree,
    labStaff,
    researchPoints: 50,

    // --- NEW OMEGA AI & PLANETARY SECURITY STATE VARIABLES ---
    omegaThreatLevel: 15,
    neuralFirewallPower: 80,
    hallucinationShield: 100,
    activeSatellitesCount: 2,
    satelliteTargetId: 'US',
    omegaActiveAttacks: [],
    commodityExchangesLocked: false,
    contrabandLevel: 10,
    satelliteCoordinates: [
      { name: "ORBITAL-STATION-A", x: 210, y: 150 },
      { name: "ORBITAL-STATION-B", x: 490, y: 310 }
    ],
    capitalFlowBeams: [
      { fromId: "US", toId: "EU", strength: 3 },
      { fromId: "CN", toId: "US", strength: 5 },
      { fromId: "EU", toId: "CN", strength: 2 }
    ]
  };
}

// Generate starting random history
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

// Pruning helper to strictly avoid LocalStorage over quota
function pruneStateSize(state: SimState): SimState {
  const cloned = JSON.parse(JSON.stringify(state));
  if (cloned.markets) {
    Object.keys(cloned.markets).forEach(k => {
      if (cloned.markets[k]?.history && cloned.markets[k].history.length > 25) {
        cloned.markets[k].history = cloned.markets[k].history.slice(-25);
      }
    });
  }
  if (cloned.cables && cloned.cables.length > 20) {
    cloned.cables = cloned.cables.slice(-20);
  }
  if (cloned.traumaLog && cloned.traumaLog.length > 15) {
    cloned.traumaLog = cloned.traumaLog.slice(-15);
  }
  if (cloned.chatLogs && cloned.chatLogs.length > 15) {
    cloned.chatLogs = cloned.chatLogs.slice(-15);
  }
  return cloned;
}

// Save & Load state to storage
export function saveSimState(state: SimState, saveName: string = 'omega_autosave') {
  try {
    const pruned = pruneStateSize(state);
    localStorage.setItem(saveName, JSON.stringify(pruned));
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
      // Ensure missing climate specific arrays and objects fallback nicely
      if (loaded.biomass === undefined) loaded.biomass = 500;
      if (loaded.labPowerMax === undefined) loaded.labPowerMax = 100;
      if (loaded.labPowerUsed === undefined) loaded.labPowerUsed = 50;
      if (loaded.labWaterMax === undefined) loaded.labWaterMax = 100;
      if (loaded.labWaterUsed === undefined) loaded.labWaterUsed = 42;
      if (loaded.cropHealth === undefined) loaded.cropHealth = 95;
      if (loaded.weatherThreat === undefined) loaded.weatherThreat = 12;
      if (loaded.regulatoryHeat === undefined) loaded.regulatoryHeat = 15;
      if (loaded.reputation === undefined) loaded.reputation = 60;
      if (loaded.currentWeather === undefined) loaded.currentWeather = 'CLEAR';
      if (loaded.weatherTicksRemaining === undefined) loaded.weatherTicksRemaining = 0;
      if (loaded.floodLevel === undefined) loaded.floodLevel = 0;
      if (loaded.researchPoints === undefined) loaded.researchPoints = 50;

      // Ensure OMEGA parameters load safely
      if (loaded.omegaThreatLevel === undefined) loaded.omegaThreatLevel = 15;
      if (loaded.neuralFirewallPower === undefined) loaded.neuralFirewallPower = 80;
      if (loaded.hallucinationShield === undefined) loaded.hallucinationShield = 100;
      if (loaded.activeSatellitesCount === undefined) loaded.activeSatellitesCount = 2;
      if (loaded.satelliteTargetId === undefined) loaded.satelliteTargetId = 'US';
      if (loaded.omegaActiveAttacks === undefined) loaded.omegaActiveAttacks = [];
      if (loaded.commodityExchangesLocked === undefined) loaded.commodityExchangesLocked = false;
      if (loaded.contrabandLevel === undefined) loaded.contrabandLevel = 10;
      if (!loaded.satelliteCoordinates) {
        loaded.satelliteCoordinates = [
          { name: "ORBITAL-STATION-A", x: 210, y: 150 },
          { name: "ORBITAL-STATION-B", x: 490, y: 310 }
        ];
      }
      if (!loaded.capitalFlowBeams) {
        loaded.capitalFlowBeams = [
          { fromId: "US", toId: "EU", strength: 3 },
          { fromId: "CN", toId: "US", strength: 5 },
          { fromId: "EU", toId: "CN", strength: 2 }
        ];
      }

      if (!loaded.countries || !loaded.countries['US'] || loaded.countries['US'].foodSecurity === undefined) {
        // Enforce the fields on countries if loaded old save
        const defaults: Record<string, any> = {
          US: { foodSecurity: 92, debtStress: 28, aiPenetration: 15, volatility: 18, politicalHeat: 20, resourceValue: 85 },
          CN: { foodSecurity: 88, debtStress: 42, aiPenetration: 45, volatility: 22, politicalHeat: 35, resourceValue: 95 },
          EU: { foodSecurity: 85, debtStress: 36, aiPenetration: 25, volatility: 20, politicalHeat: 25, resourceValue: 70 },
          CH: { foodSecurity: 98, debtStress: 10, aiPenetration: 12, volatility: 12, politicalHeat: 5, resourceValue: 50 },
        };
        Object.keys(defaults).forEach((id) => {
          if (loaded.countries && loaded.countries[id]) {
            Object.assign(loaded.countries[id], defaults[id]);
          }
        });
      }

      if (!loaded.labStructures) {
        loaded.labStructures = [
          { id: 'str_1', type: 'COMMAND_ROOM', x: 4, y: 3, level: 1, health: 100, powerUsage: 10, waterUsage: 2, lastTickActive: true },
          { id: 'str_2', type: 'CROP_POD', x: 2, y: 2, level: 1, health: 100, powerUsage: 15, waterUsage: 25, lastTickActive: true },
          { id: 'str_3', type: 'SERVER_RACK', x: 6, y: 2, level: 1, health: 100, powerUsage: 25, waterUsage: 5, lastTickActive: true },
          { id: 'str_4', type: 'BIO_REACTOR', x: 3, y: 5, level: 1, health: 100, powerUsage: -40, waterUsage: 10, lastTickActive: true }
        ];
      }
      if (!loaded.labStaff) {
        loaded.labStaff = [
          { id: 'stf_1', name: 'Mitch Miller', role: 'QUANT', salary: 120000, skill: 75, stress: 25, loyalty: 90, trait: 'Overclock Specialist' },
          { id: 'stf_2', name: 'Dr. Sarah Rain', role: 'BIOLOGIST', salary: 95000, skill: 82, stress: 15, loyalty: 80, trait: 'Drought Synthesizer' },
          { id: 'stf_3', name: 'Jax Spark', role: 'ENGINEER', salary: 85000, skill: 68, stress: 30, loyalty: 75, trait: 'Lightning Mitigator' }
        ];
      }
      if (!loaded.researchTree) {
        loaded.researchTree = {
          syntheticDroughtCrops: { id: 'syntheticDroughtCrops', name: 'Synthetic Drought Crops', cost: 200, unlocked: false, description: 'Soma-engineered seeds resistant to extreme Heat Domes.', benefits: ['Crops withstand HEAT_DOME damage by 50%', 'Boost agricultural futures trading margins'] },
          floodResistantRoots: { id: 'floodResistantRoots', name: 'Flood-resistant Roots', cost: 350, unlocked: false, description: 'Hydro-repellent genetic structures that prevent flash flood rot.', benefits: ['Crops withstand FLASH_FLOOD damage by 70%'] },
          weatherPredictionAI: { id: 'weatherPredictionAI', name: 'Weather Prediction AI', cost: 150, unlocked: false, description: 'Overlocked deep neural nets calculating atmospheric moisture vectors.', benefits: ['Advance warnings of anomalous climate impacts', 'Weather derivatives prediction boosts (+20% gains)'] },
          atmosphericArbitrage: { id: 'atmosphericArbitrage', name: 'Atmospheric Arbitrage', cost: 400, unlocked: false, description: 'Deploy algorithmic high-frequency bots on real-time radar data feeds.', benefits: ['Automates WETH-FUT coverage hedging'] },
          carbonCaptureScaling: { id: 'carbonCaptureScaling', name: 'Carbon Capture Scaling', cost: 300, unlocked: false, description: 'Graphene composite matrices filtering atmospheric CO2 directly.', benefits: ['Generates passive cash flow ($500K per CC structure per tick)'] },
          autonomousLabDrones: { id: 'autonomousLabDrones', name: 'Autonomous Lab Drones', cost: 250, unlocked: false, description: 'Compact hovering repair nodes keeping sectors structural integrity intact.', benefits: ['Auto-repairs damaged lab equipment without requiring actions'] },
          quantumVolatilityEngine: { id: 'quantumVolatilityEngine', name: 'Quantum Volatility Engine', cost: 500, unlocked: false, description: 'Predict and ride market shocks generated during massive weather panic cascades.', benefits: ['Yields large cash bonuses during extreme market crashes'] },
          syntheticRainfall: { id: 'syntheticRainfall', name: 'Synthetic Rainfall Systems', cost: 600, unlocked: false, description: 'Silicate chemical rain seeding drones manipulated remotely.', benefits: ['Unlocks the Synthetic Rainfall operational control'] },
          crisisTradingAlgorithms: { id: 'crisisTradingAlgorithms', name: 'Crisis Trading Algos', cost: 450, unlocked: false, description: 'Automatic short positions triggering upon major disaster detection.', benefits: ['Boost portfolio leverage options'] },
          climateShield: { id: 'climateShield', name: 'Atmospheric Aegis Shield', cost: 1000, unlocked: false, description: 'Static electrostatic canopy fields blocking radioactive rains.', benefits: ['Prevents weather disaster room damage completely'] }
        };
      }
    }
    return loaded;
  } catch (e) {
    console.error('Failed to load state:', e);
    return null;
  }
}
