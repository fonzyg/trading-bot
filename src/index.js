import { loadConfig } from './lib/config.js';
import { TradingBot } from './lib/bot.js';
import { SimBroker } from './lib/simBroker.js';
import { PaperBroker } from './lib/paperBroker.js';
import { RobinhoodBroker } from './lib/robinhoodBroker.js';
import { loadClosePricesFromCsv } from './lib/csv.js';

function createBroker(config, prices) {
  if (config.brokerMode === 'robinhood') {
    return new RobinhoodBroker({ symbol: config.symbol });
  }

  if (config.mode === 'paper') {
    return new PaperBroker({
      symbol: config.symbol,
      startingEquity: config.startingEquity,
      apiKey: config.apiKey,
    });
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

  if (config.mode === 'paper' && !config.apiKey) {
    console.error('Paper trading requires ALPHA_VANTAGE_API_KEY in your .env file.');
    console.error('Get a free key at: https://www.alphavantage.co/support/#api-key');
    process.exitCode = 1;
    return;
  }

  const prices = config.mode === 'backtest'
    ? await loadClosePricesFromCsv(config.dataFile)
    : config.simulatedPrices;

  const broker = createBroker(config, prices);
  const bot = new TradingBot({ broker, config, prices });

  process.on('SIGINT', async () => {
    console.log('\nStopping bot...');
    const finalPrice = bot.prices[bot.prices.length - 1];
    if (finalPrice) {
      const finalAccount = await broker.getAccount(finalPrice);
      bot.printSummary(finalAccount);
    }
    process.exit(0);
  });

  await bot.run();
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exitCode = 1;
});
