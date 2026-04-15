import { loadConfig } from './lib/config.js';
import { TradingBot } from './lib/bot.js';
import { SimBroker } from './lib/simBroker.js';
import { RobinhoodBroker } from './lib/robinhoodBroker.js';
import { loadClosePricesFromCsv } from './lib/csv.js';

function createBroker(config, prices) {
  if (config.brokerMode === 'robinhood') {
    return new RobinhoodBroker({ symbol: config.symbol });
  }

  return new SimBroker({
    symbol: config.symbol,
    startingEquity: config.startingEquity,
    simulatedPrices: prices,
  });
}

async function main() {
  const mode = process.argv[2] || 'sim';
  const config = loadConfig(process.env, { mode });
  const prices = config.mode === 'backtest'
    ? await loadClosePricesFromCsv(config.dataFile)
    : config.simulatedPrices;

  const broker = createBroker(config, prices);
  const bot = new TradingBot({ broker, config, prices });
  await bot.run();
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exitCode = 1;
});
