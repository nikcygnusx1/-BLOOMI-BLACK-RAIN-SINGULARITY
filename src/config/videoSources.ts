export const VIDEO_SOURCES = {
  intro_act1_cern: 'YOUTUBE_VIDEO_ID_HERE',
  intro_act3_bloomberg: 'YOUTUBE_VIDEO_ID_HERE',
  intro_act3_palantir: 'YOUTUBE_VIDEO_ID_HERE',
  panel_feed_1: 'YOUTUBE_VIDEO_ID_HERE',
  panel_feed_2: 'YOUTUBE_VIDEO_ID_HERE',
  panel_feed_3: 'YOUTUBE_VIDEO_ID_HERE',
};

// Fill these in with real YouTube video IDs before deploying.
// Leave as empty string '' to trigger SIGNAL_OFFLINE state for that feed.
export const VIDEO_PANEL_SOURCES = {
  cern:    '',   // e.g. LHC flythrough, particle collision visualization
  markets: '',   // e.g. Bloomberg trading floor, market data visualization
  intel:   '',   // e.g. Palantir network graph demo, data ops footage
  atmo:    '',   // e.g. Storm satellite footage, atmospheric timelapse
};

export interface FeedConfig {
  id: 'orbital' | 'markets' | 'geopolitical' | 'particle';
  label: string;
  subLabel: string;
  channelId: string;
  liveUrl: string;
  fallbackVideoId: string;
  dataOverlay: string;          // static display string
  gameModule: string;           // which game module it links to
}

export const QUAD_FEEDS: FeedConfig[] = [
  {
    id: 'orbital',
    label: 'ORBITAL_SURVEILLANCE',
    subLabel: 'ISS // EARTH_VIEW // ALT_408KM',
    channelId: 'UCLA_DiR1FfKNvjuUpBHmylQ',
    liveUrl: 'https://www.youtube.com/embed/live_stream?channel=UCOpNcN46ux-yApV678VEjSg',
    fallbackVideoId: 'rt3mxeSgPZ0',
    dataOverlay: 'ALT: 408 KM  //  V: 7.66 KM/S  //  INCL: 51.6°',
    gameModule: 'SAT_ORBIT',
  },
  {
    id: 'markets',
    label: 'SOVEREIGN_MARKETS',
    subLabel: 'BLOOMBERG // LIVE_INTELLIGENCE',
    channelId: 'UCIALMKvobgE9ovPZhiEz0OA',
    liveUrl: 'https://www.youtube.com/embed/live_stream?channel=UCIALMKvobgE9ovPZhiEz0OA',
    fallbackVideoId: 'F3_8_gU_8_0',
    dataOverlay: 'SPX: LIVE  //  VIX: LIVE  //  FED: 5.50%  //  USD_IDX: LIVE',
    gameModule: 'TRADING',
  },
  {
    id: 'geopolitical',
    label: 'GEOPOLITICAL_FLUX',
    subLabel: 'AJE // SOVEREIGN_INTELLIGENCE',
    channelId: 'UCNye-wNBqNL5ZzHSJj3l8Bg',
    liveUrl: 'https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg',
    fallbackVideoId: 'bNyUyrR0PHo',
    dataOverlay: 'CONFLICTS: 7_ACTIVE  //  SANCTIONS: 34  //  RISK: ELEVATED',
    gameModule: 'INFLU_NET',
  },
  {
    id: 'particle',
    label: 'PARTICLE_CORE',
    subLabel: 'CERN // LHC // 13.6_TEV',
    channelId: 'UCBcRF18a7Qf58cCRy5xuWwQ',
    liveUrl: 'https://www.youtube.com/embed/live_stream?channel=UCBcRF18a7Qf58cCRy5xuWwQ',
    fallbackVideoId: '06kFq1QF5-s',
    dataOverlay: 'ENERGY: 13.6 TEV  //  LUMI: 2.0×10³⁴  //  BUNCHES: 2748',
    gameModule: 'RING_COLL',
  },
];
