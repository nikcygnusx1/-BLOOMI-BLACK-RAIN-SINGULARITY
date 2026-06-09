export interface FeedData {
  id: 'CERN' | 'MRKTS' | 'INTEL' | 'DARK';
  name: string;
  source: string;
  status: string;
  metricLabel: string;
  metricValue: string;
  clarity: string;
  videoField: string;
  description: string[];
}

export const FEED_LORE_DATA: Record<FeedData['id'], FeedData> = {
  CERN: {
    id: 'CERN',
    name: 'CERN_COLLIDER_TELEMETRY',
    source: 'CERN_LHC_S3',
    status: 'ACTIVE // RUNNING',
    metricLabel: 'ENERGY:',
    metricValue: '13.6 TeV',
    clarity: '98.4%',
    videoField: 'SECONDARY HADRON BEAM COUPLING',
    description: [
      'SEC_LEVEL: BLACK COLD INTEL',
      'ACCELERATOR RANGE: 27KM',
      'DETECTOR: ATLAS LIQUID RE-ENTRY',
      'COLLISION FOCUS: HIGGS SCATTER',
      'LUMINOSITY SPAN: ULTRA-HIGH',
      'BEAM POSITION: LOCK STABLE'
    ]
  },
  MRKTS: {
    id: 'MRKTS',
    name: 'SOVEREIGN_CDS_SPREADS',
    source: 'BBG_CORE_TICKER',
    status: 'OPTIMAL // FLOATING',
    metricLabel: 'CDS RATE SPREAD:',
    metricValue: '480 BPS avg',
    clarity: '99.1%',
    videoField: 'LIQUIDITY SWAPS DEVIATION',
    description: [
      'SEC_LEVEL: CLASS_V MARKET',
      'YIELD SPREADS STRESS: HIGH',
      'CENTRAL BANKING LINK: ONLINE',
      'ARBITRAGE ANOMALIES: DETECTED',
      'COGNITIVE SWAPS TRACK: ACTIVE',
      'MARKET COMPLIANCE: MARGINAL'
    ]
  },
  INTEL: {
    id: 'INTEL',
    name: 'PALANTIR_GRAPH_NET',
    source: 'CLASSIFIED_OMEGA',
    status: 'SECURE // CRYPTO',
    metricLabel: 'NETWORK DENSITY:',
    metricValue: '88,924 NODES',
    clarity: '95.7%',
    videoField: 'LOBBY REPUTATION CONVERGENCE',
    description: [
      'SEC_LEVEL: 5_EYES CLASS_A',
      'GEOPOLITICAL THREAT: MEDIUM',
      'ACTIVE SPY NODES: 124 LOCKED',
      'FINANCIAL BACKDOORS: ACTIVE',
      'SINGULARITY TRACE: SECURE',
      'INTRUSION ATTEMPTS: ZERO'
    ]
  },
  DARK: {
    id: 'DARK',
    name: 'BLACK_RAIN_METEOROLOGY',
    source: 'SATELLITE_OMEGA_9',
    status: 'ANOMALY DETECTED',
    metricLabel: 'THREAT LEVEL:',
    metricValue: '86% MONSOON',
    clarity: '72.3%',
    videoField: 'ATMOSPHERIC SCAN RADAR',
    description: [
      'SEC_LEVEL: EMERGENCY DIRECTIVE',
      'FLOOD LEVEL VECTOR: +9.2m/hr',
      'LIGHTNING BREAK FREQ: CRITICAL',
      'WEATHER THREAT RAMP: SEVERE',
      'SOMATIC SHIELD: COLD RATED',
      'OMEGA CORE SHIELD: STRESSED'
    ]
  }
};
