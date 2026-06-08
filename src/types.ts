/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CentralBank {
  rate: number;
  balanceSheet: number;
  liquidityInjection: number;
  printingPressOverride: boolean; // Captured & overriding
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
  capturedLobbyFraction: number; // 0.0 to 1.0 (>=0.80 unlocks printing press)
}

export interface BoardMember {
  name: string;
  owner: string; // "Founders" | "Retail" | "Player" | "Hedge Fund"
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  industry: 'AI' | 'Energy' | 'Defense' | 'Logistics' | 'Banking' | 'Media' | 'Healthcare';
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
  shareholders: Record<string, number>; // shareholder ID -> shares
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
  type: 'equity' | 'crypto';
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
  positions: Record<string, number>; // ticker -> shares/tokens
  strategy: 'Arbitrage' | 'LongShort' | 'Distressed' | 'Vampire';
  leverage: number;
  isWolf: boolean; // Pattern-hunting wolf AI active
  dynastyEnemy: boolean;
}

export interface InfluenceNode {
  id: string;
  name: string;
  type: 'Intelligence' | 'Lobby' | 'State Machine' | 'Regulator';
  nation: string;
  influenceCap: number;
  fundingRequired: number;
  playerControlWeight: number; // 0 to 100
}

export interface DynastyMember {
  name: string;
  role: 'Head of Dynasty' | 'Heir' | 'Operative' | 'Lobbyist_Chief';
  age: number;
  status: 'Alive' | 'Deceased';
  sociopathyIndex: number; // 0 to 100
  geneticEdits: string[]; // somatic edits like "Amoral Brainstem", "Sovereign Charisma", etc.
}

export interface TraumaLog {
  id: string;
  tick: number;
  date: string;
  eventType: 'MARKET_CRASH' | 'WAR' | 'REVOLUTION' | 'COGNITIVE_WAR' | 'EUGENICS_EXP';
  description: string;
  severity: number; // 1 to 10
}

export interface CableLog {
  time: string;
  source: string;
  message: string;
  classification: 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET' | 'EYES_ONLY';
}

export interface SimState {
  currentTick: number;
  date: string; // Date string
  globalStability: number; // 0 to 100 base
  globalSuffering: number; // 0 to 100 base (Genetic capital ignores debuffs from high Global Suffering)
  careerStage: 'Family Office' | 'Emerging Manager' | 'Institutional Titan';
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
      bonds: Record<string, number>; // CountryID -> debt value held
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
  simulationSpeed: number; // 0 (pause), 1 (1x), 5 (5x), 10 (10x)
}
