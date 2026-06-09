/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CentralBank {
  rate: number;
  balanceSheet: number;
  liquidityInjection: number;
  printingPressOverride: boolean;
}

export type RegimeType = 'DEMOCRACY' | 'DICTATORSHIP';

export interface SovereignSpending {
  healthcare: number;
  infrastructure: number;
  military: number;
  research: number;
}

export interface WeaponSystem {
  id: string;
  name: string;
  type: 'ICBM' | 'JET' | 'TANK' | 'CARRIER' | 'SUB' | 'CYBER' | 'CLIMATE';
  stockpile: number;
  maintenanceCost: number;
  powerRating: number;
}

export interface ActiveStrike {
  id: string;
  source: string;
  target: string;
  weaponId: string;
  progress: number;
  bezierPoints: { x: number; y: number }[];
  impactTick: number;
  damageAmount?: number;
}

export interface TaxRates {
  income: number;
  corporate: number;
  capitalGains: number;
}

export interface Country {
  id: string;
  name: string;
  gdp: number;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  stability: number; // 0 to 100
  unrest: number; // 0 to 100
  taxRates: TaxRates;
  interestRate: number;
  moneySupply: number;
  bondsIssued: number;
  budget: number;
  opinionOfPlayer: number; // 0 to 100
  centralBank: CentralBank;
  capturedLobbyFraction: number;
  
  // Tactical planetary indexes:
  foodSecurity: number; // 0 to 100
  debtStress: number; // 0 to 100
  aiPenetration: number; // 0 to 100
  volatility: number; // 0 to 100
  politicalHeat: number; // 0 to 100
  resourceValue: number; // 0 to 100 (rating)

  // Sovereign and Tactical Fields:
  treasuryCash: number;
  unrestHistory?: number[];
  approvalRating: number;
  electionCountdown: number;
  alliance: 'NATO' | 'BRICS' | 'NEUTRAL';
  regimeType: RegimeType;
  spending: SovereignSpending;
  weapons: WeaponSystem[];
  martialLaw: boolean;
}

export interface BoardMember {
  name: string;
  owner: string; // "Founders" | "Retail" | "Player" | "Hedge Fund"
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  industry: 'AI' | 'Energy' | 'Defense' | 'Logistics' | 'Banking' | 'Media' | 'Healthcare' | 'Agriculture';
  country: string;
  sharesOutstanding: number;
  sharePrice: number;
  marketCap: number;
  cash: number;
  debt: number;
  revenue: number;
  expenses: number;
  profit: number;
  board: BoardMember[];
  shareholders: Record<string, number>;
  layoffsPercentage: number;
}

export interface Order {
  id: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  owner: string;
  timestamp: number;
}

export interface OrderBook {
  bids: Order[];
  asks: Order[];
}

export interface HistoryPoint {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: string;
}

export interface Market {
  ticker: string;
  type: 'equity' | 'crypto' | 'commodity' | 'derivative';
  currentPrice: number;
  orderBook: OrderBook;
  history: HistoryPoint[];
  liquidity: number;
}

export interface CryptoChain {
  id: string;
  name: string;
  ticker: string;
  tvl: number;
  tokenPrice: number;
  validators: number;
  activeUsers: number;
  gasPriceGwei: number;
  bankRunTriggered: boolean;
}

export interface HedgeFund {
  id: string;
  name: string;
  cash: number;
  positions: Record<string, number>;
  strategy: 'Arbitrage' | 'LongShort' | 'Distressed' | 'Vampire';
  leverage: number;
  isWolf: boolean;
  dynastyEnemy: boolean;
}

export interface InfluenceNode {
  id: string;
  name: string;
  type: 'Intelligence' | 'Lobby' | 'State Machine' | 'Regulator';
  nation: string;
  influenceCap: number;
  fundingRequired: number;
  playerControlWeight: number;
}

export interface DynastyMember {
  name: string;
  role: 'Head of Dynasty' | 'Heir' | 'Operative' | 'Lobbyist_Chief' | 'Lead_Biologist' | 'Quant_General';
  age: number;
  status: 'Alive' | 'Deceased';
  sociopathyIndex: number; // 0 to 100
  geneticEdits: string[];
}

export interface TraumaLog {
  id: string;
  tick: number;
  date: string;
  eventType: 'MARKET_CRASH' | 'WAR' | 'REVOLUTION' | 'COGNITIVE_WAR' | 'EUGENICS_EXP' | 'WEATHER_DISASTER' | 'LAB_EXPLOSION' | 'REGULATORY_RAID';
  description: string;
  severity: number; // 1 to 10
}

export interface CableLog {
  time: string;
  source: string;
  message: string;
  classification: 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET' | 'EYES_ONLY';
}

// Laboratory Grid Element
export interface LabStructure {
  id: string;
  type: 'CROP_POD' | 'GENE_CHAMBER' | 'WEATHER_RADAR' | 'CARBON_CAPTURE' | 'TRADING_TERM' | 'SERVER_RACK' | 'STORM_SIMULATOR' | 'BIO_REACTOR' | 'DRONE_BAY' | 'QUARANTINE' | 'COMMAND_ROOM' | 'CLIMATE_ENGINE';
  x: number;
  y: number;
  level: number;
  health: number; // 0 to 100
  powerUsage: number; // MW
  waterUsage: number; // Litres/sec
  lastTickActive: boolean;
}

// Research Path Node
export interface ResearchNode {
  id: string;
  name: string;
  cost: number; // Biomass cost
  unlocked: boolean;
  description: string;
  benefits: string[];
}

// Specialized staff member
export interface LaboratoryStaff {
  id: string;
  name: string;
  role: 'QUANT' | 'METEOROLOGIST' | 'BIOLOGIST' | 'ENGINEER' | 'SECURITY' | 'LOBBYIST' | 'SPY' | 'DISASTER_CREW';
  salary: number; // Cash cost per tick/week
  skill: number; // 0 to 100
  stress: number; // 0 to 100
  loyalty: number; // 0 to 100
  trait: string;
}

export interface SimState {
  currentTick: number;
  date: string;
  globalStability: number;
  globalSuffering: number;
  careerStage: 'Family Office' | 'Emerging Manager' | 'Institutional Titan' | 'Singularity Core';
  highWaterMark: number;
  shorts: Record<string, { qty: number; avgPrice: number }>;
  leverageEnabled: boolean;
  marginCallWarning: boolean;
  lastDailyReturns: number[];
  benchmarkReturns: number[];
  hiredAnalysts: { id: string; name: string; salary: number; specialty: string; reports: { date: string; text: string }[] }[];
  hiringPool: { id: string; name: string; salary: number; specialty: string; tier: string }[];
  chatLogs: { sender: 'user' | 'analyst'; timestamp: string; text: string }[];
  player: {
    id: string;
    name: string;
    nationality: string;
    education: string;
    background: string;
    cash: number;
    influence: number;
    traits: {
      intel: number;
      charisma: number;
      ambition: number;
      risk: number;
      connections: number;
    };
    assets: {
      stocks: Record<string, number>;
      crypto: Record<string, number>;
      bonds: Record<string, number>;
      lobbyists: number;
      analysts: number;
      informants: number;
    };
  };
  dynasty: {
    prestige: number;
    generation: number;
    members: DynastyMember[];
  };
  countries: Record<string, Country>;
  companies: Company[];
  markets: Record<string, Market>;
  cryptoChains: Record<string, CryptoChain>;
  hedgeFunds: HedgeFund[];
  influenceNodes: InfluenceNode[];
  traumaLog: TraumaLog[];
  cables: CableLog[];
  simulationSpeed: number;

  // --- NEW BLACK RAIN CLIMATE LABORATORY STATE VARIABLES ---
  biomass: number; // Genetic capital
  labPowerMax: number; // Total MW capacity
  labPowerUsed: number;
  labWaterMax: number;
  labWaterUsed: number;
  cropHealth: number; // 0 to 100 metric
  weatherThreat: number; // 0 to 100 threat score
  regulatoryHeat: number; // 0 to 100 risk of raid
  reputation: number; // 0 to 100 world faction score
  currentWeather: 'CLEAR' | 'BLACK_RAIN' | 'ACID_FOG' | 'FLASH_FLOOD' | 'HEAT_DOME' | 'LIGHTNING_STORM' | 'CROP_BLIGHT' | 'GRID_COLLAPSE' | 'MONSOON_BREACH' | 'ATMOSPHERIC_ANOMALY';
  weatherTicksRemaining: number;
  floodLevel: number; // Global floor water percentage
  labStructures: LabStructure[];
  researchTree: Record<string, ResearchNode>;
  labStaff: LaboratoryStaff[];
  researchPoints: number; // general tech levels

  // --- NEW OMEGA AI & PLANETARY SECURITY STATE VARIABLES ---
  omegaThreatLevel: number; // 0 to 100
  neuralFirewallPower: number; // 0 to 100 (defence power)
  hallucinationShield: number; // 0 to 100
  activeSatellitesCount: number; // count of tactical orbital systems
  satelliteTargetId: string; // which region is orbital scanned
  omegaActiveAttacks: string[]; // active attacks like "synthetic_news", "liquidity_traps", "satellite_spoof", "cyber_grid"
  commodityExchangesLocked: boolean; // if OMEGA locked down commodity tickers
  contrabandLevel: number; // heat related to illegal sovereign weaponization
  satelliteCoordinates: { id?: string; name: string; x: number; y: number }[]; // coordinates on physical map
  capitalFlowBeams: { fromId: string; toId: string; strength: number }[]; // capital beams coordinates for SVG canvas
  activeBots?: { sigmaHunter?: boolean; cdsReaper?: boolean; scytheArbitrage?: boolean; [key: string]: any };
  activeStrikes: ActiveStrike[];
  commoditiesSpotPrice: { soy: number; fuel: number; defense: number; chips: number };
}
