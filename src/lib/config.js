function numberFromEnv(rawValue, fallback) {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function listOfNumbers(rawValue, fallback) {
  if (!rawValue) {
    return fallback;
  }

  const values = rawValue
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

  return values.length > 0 ? values : fallback;
}

export function loadConfig(env, overrides = {}) {
  return {
    mode: overrides.mode || env.MODE || 'sim',
    brokerMode: env.BROKER_MODE || 'sim',
    symbol: env.BOT_SYMBOL || 'USO',
    apiKey: env.ALPHA_VANTAGE_API_KEY || '',
    dataFile: env.DATA_FILE || './data/crude_oil_sample.csv',
    startingEquity: numberFromEnv(env.STARTING_EQUITY, 1000),
    riskPerTradePct: numberFromEnv(env.RISK_PER_TRADE_PCT, 0.01),
    maxPositionPct: numberFromEnv(env.MAX_POSITION_PCT, 0.25),
    stopLossPct: numberFromEnv(env.STOP_LOSS_PCT, 0.025),
    takeProfitPct: numberFromEnv(env.TAKE_PROFIT_PCT, 0.05),
    maxDailyLossPct: numberFromEnv(env.MAX_DAILY_LOSS_PCT, 0.03),
    maxTradesPerDay: Math.max(1, Math.floor(numberFromEnv(env.MAX_TRADES_PER_DAY, 3))),
    shortWindow: Math.max(2, Math.floor(numberFromEnv(env.SHORT_WINDOW, 3))),
    longWindow: Math.max(3, Math.floor(numberFromEnv(env.LONG_WINDOW, 8))),
    pollIntervalMs: Math.max(250, Math.floor(numberFromEnv(env.POLL_INTERVAL_MS, 960000))),
    simulatedPrices: listOfNumbers(env.SIMULATED_PRICES, [67.8, 67.45, 67.1, 66.95, 66.7, 66.55, 66.88, 67.2, 67.62, 68.05, 68.48, 68.92, 69.3, 69.78, 70.22, 69.85, 69.1, 68.55, 68.02, 67.66, 67.2, 66.82, 66.35, 66.02, 66.28, 66.74, 67.15, 67.68, 68.12, 68.44, 68.9, 69.32, 69.88, 70.35, 70.62, 69.95, 69.22, 68.74, 68.11, 67.72]),
  };
}
