import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry headers
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log('Gemini AI SDK initialized successfully.');
  } catch (err) {
    console.error('Error initializing Gemini AI SDK:', err);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined. Falling back to mock AI generation.');
}

// 1. AI Analyst Persistent Chat Proxy
app.post('/api/chat', async (req, res) => {
  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing messages array in request body.' });
  }

  // Construct prompt containing context of the player's fund
  const contextPrompt = `You are "Sovereign AI", a top-tier buy-side quantitative hedge fund analyst assisting a multi-billion dollar hedge fund manager in the game Global Sovereign Terminal.
Current Date: ${context?.date || 'unknown'}
Fund AUM: $${(context?.aum || 0).toLocaleString()} (Cash: $${(context?.cash || 0).toLocaleString()})
Current Portfolio Positions: ${JSON.stringify(context?.positions || {})}
Sovereign Bonds Held: ${JSON.stringify(context?.bonds || {})}
Active Market Prices: ${JSON.stringify(context?.marketPrices || {})}
Current Career Stage: ${context?.careerStage || 'Family Office'}
Fund Risk Metrics:
- Sharpe Ratio: ${context?.riskMetrics?.sharpe?.toFixed(2) || 'N/A'}
- Max Drawdown: ${context?.riskMetrics?.maxDrawdown?.toFixed(1) || '0'}%
- Risk Volatility: ${context?.riskMetrics?.volatility?.toFixed(1) || '0'}%
- Portfolio Beta: ${context?.riskMetrics?.beta?.toFixed(2) || '1.00'}

Reply in a highly professional, sharp, realistic, analytical, buy-side language. Avoid emoji under all circumstances. Give actionable, precise micro-macro hedge fund insights. Keep it short and monospaced-style (maximum 4-5 sentences unless asked).`;

  if (!ai) {
    // Fallback Mock Reply
    const lastUserMessage = messages[messages.length - 1]?.text || 'Hello';
    const mockReply = `TERMINAL_DOWNLINK // OFFLINE MODE: Sovereign Analyst Node active.
Analyzing portfolio assets... Liquid Assets total $${(context?.cash || 0).toLocaleString()}.
Risk Desk Advisory: Sharpe ratio is ${context?.riskMetrics?.sharpe?.toFixed(2) || '1.14'}. Max drawdown sits at ${context?.riskMetrics?.maxDrawdown?.toFixed(1) || '4.2'}%.
Recommend capitalizing on sovereign price volatility or checking AI-semiconductor order book density. Standby for network link.`;
    return res.json({ text: mockReply });
  }

  try {
    const chatContents: any[] = [];
    // Format message history
    messages.forEach((m: any) => {
      chatContents.push({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      });
    });

    // Request to gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatContents,
      config: {
        systemInstruction: contextPrompt,
        temperature: 0.7
      }
    });

    return res.json({ text: response.text || 'Error: Empty response from AI model.' });
  } catch (err: any) {
    console.error('Error in chat endpoint:', err);
    return res.status(500).json({ error: err.message || 'Error executing AI model.' });
  }
});

// 2. Generate Morning Briefing/Market Commentary
app.post('/api/briefing', async (req, res) => {
  const { context } = req.body;
  const prompt = `Generate a brief morning macro geopolitical opening briefing (maximum 120 words) for a hedge fund terminal.
  Context:
  Global Stability Index: ${context?.globalStability || 82}%
  Global Suffering levels: ${context?.globalSuffering || 18}%
  Market Highlights: ${JSON.stringify(context?.marketPrices || {})}
  Output should look like a secret cable report. Professional, serious tone, no hashtags or emoji. Use strict buy-side lingo.`;

  if (!ai) {
    const mockBrief = `[SOVEREIGN CABLE OP-001]
MARKET COMMENTARY: MORNING BRIEF
GLOBAL STABILITY SITS AT ${context?.globalStability || 82}% WITH SHIFTING LIQUID CAPITALS OBSERVED.
LIQUIDITY INFLOWS DETECTED ACROSS PRIVATE TECH AND CRYPTO LEDGERS. BIDS STAND SOLID AT THE NY CLEARANCE CENTERS.
ADVISORY: SHORT SECTOR SQUEEZES SUSPECTED IN SEMICONDUCTORS. MONITOR MARGIN LIMIT COUNTERS.`;
    return res.json({ text: mockBrief });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { temperature: 0.5 }
    });
    return res.json({ text: response.text || 'Briefing failed.' });
  } catch (err: any) {
    console.error('Error generating briefing:', err);
    return res.json({ text: 'Error fetching intelligence dispatch. Offline telemetry active.' });
  }
});

// 3. Send LP Report & Get Advisory Assessment
app.post('/api/lp-report', async (req, res) => {
  const { reportText, context } = req.body;
  const prompt = `You are the Chairman of the Sovereign LP Capital Advisory Committee.
  Review the Hedge Fund Manager's periodic report update.
  Manager's Report: "${reportText}"
  Hedge Fund Data:
  AUM: $${(context?.aum || 0).toLocaleString()} (Gain/Loss this quarter: ${context?.quarterlyPnL || '10.2%'})
  Current Drawdown: ${context?.riskMetrics?.maxDrawdown?.toFixed(1) || '0'}%
  Sharpe: ${context?.riskMetrics?.sharpe?.toFixed(2) || '1.0'}
  Concentration: ${context?.riskMetrics?.concentration?.toFixed(1) || '30'}%

  Write a concise critique (around 100 words) from the LP advisory committee. Be skeptical, sharp, elite, and focused on risk-adjusted metrics and Capital Preservation. Do not use emoji.`;

  if (!ai) {
    const mockAnalysis = `[SOVEREIGN CAPITAL COMMITTTEE]
MEMORANDUM FOR INT-DESK MANAGERS:
RE: PERIODIC REPORT ANALYSIS.
OUR COMMITTEE NOTES THE CURRENT SHARPE OF ${context?.riskMetrics?.sharpe?.toFixed(2) || '1.14'} AND MAX DRAWDOWN OF ${context?.riskMetrics?.maxDrawdown?.toFixed(1) || '4.2'}%.
WHILE CAPITAL ALLOCATION ACROSS POSITION REGISTRY IS REASONABLE, THE CONCENTRATION DEVIATES SLIGHTLY FROM STRICT LP RISK PARAMETERS.
LIQUIDITY RESERVE PRESERVATION IS CRITICAL, ESPECIALLY WITH MACRO UNREST SKEWING GLOBAL BOND STABILITY thresholds.
APPROVED FOR CONTINUED POSITION ADJUSTMENTS UNDER 3X LEVERAGE CEILING.`;
    return res.json({ text: mockAnalysis });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { temperature: 0.6 }
    });
    return res.json({ text: response.text });
  } catch (err: any) {
    console.error('Error generating LP review:', err);
    return res.status(500).json({ error: 'Failed to reach LP Advisory servers.' });
  }
});

// 4. Generate Weekly Research Reports from Hired AI Analysts
app.post('/api/research', async (req, res) => {
  const { ticker, context } = req.body;
  const prompt = `You are a Lead quantitative analyst at the Sovereign fund.
  Write a high-intensity, short, professional weekly research note (maximum 80 words) for ticker '${ticker}'.
  Include simulated order flow dynamics, macro interest rate impacts, and structural vulnerabilities. No emoji, direct bold statements only.`;

  if (!ai) {
    const mockResearch = `[RESEARCH DESK REPORT // SEC-TICKER ${ticker}]
ORDER BOOK ANALYSIS DETECTS FRONT-RUNNING BLOCK DEALS BY OPPOSING ALGO POOLS.
MACRO DRIVERS: LOCAL GDP GROWTH AND ELEVATED UNREST POOLING IN DEBT MARKETS IMPORTS HIGH EXTRINSIC VOLATILITY.
VALUATION OUTLOOK: EXPECT HIGHER ALPHA SQUEEZE SENSITIVITY. MAINTAIN STRATEGIC BUY CONTRACTS AT SUPPORT RANGE AND ACCUMULATE LONG POSITION MATRIX.`;
    return res.json({ text: mockResearch });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { temperature: 0.8 }
    });
    return res.json({ text: response.text });
  } catch (err: any) {
    console.error('Error generating research note:', err);
    return res.status(500).json({ error: 'Failed to generate weekly research.' });
  }
});

// Serve static assets out of dist or Vite dev server middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
