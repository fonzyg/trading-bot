import { loadEnvFile } from './lib/env.js';
import { loadConfig } from './lib/config.js';
import { TradingBot } from './lib/bot.js';
import { SimBroker } from './lib/simBroker.js';
import { PaperBroker } from './lib/paperBroker.js';
import { RobinhoodBroker } from './lib/robinhoodBroker.js';
import { loadClosePricesFromCsv } from './lib/csv.js';
import { TradeLogger } from './lib/tradeLogger.js';
import { Dashboard } from './lib/dashboard.js';

function createBroker(config, prices) {
  if (config.brokerMode === 'robinhood') {
    return new RobinhoodBroker({ symbol: config.symbol });
  }

  if (config.mode === 'paper') {
    return new PaperBroker({
      symbol: config.symbol,
      startingEquity: config.startingEquity,
    });
  }

  return new SimBroker({
    symbol: config.symbol,
    startingEquity: config.startingEquity,
    simulatedPrices: prices,
  });
}

async function main() {
  await loadEnvFile();
  const mode = process.argv[2] || 'sim';
  const config = loadConfig(process.env, { mode });

  const prices = config.mode === 'backtest'
    ? await loadClosePricesFromCsv(config.dataFile)
    : config.simulatedPrices;

  const broker = createBroker(config, prices);

  let logger = null;
  let dashboard = null;

  if (config.mode === 'paper') {
    logger = new TradeLogger();
    await logger.load();

    dashboard = new Dashboard({ port: config.dashboardPort, logger });
    await dashboard.start();
    dashboard.updateStatus({ mode: 'paper', symbol: config.symbol });
  }

  const bot = new TradingBot({ broker, config, prices, logger, dashboard });

  process.on('SIGINT', async () => {
    console.log('\nStopping bot...');
    const finalPrice = bot.prices[bot.prices.length - 1];
    if (finalPrice) {
      const finalAccount = await broker.getAccount(finalPrice);
      bot.printSummary(finalAccount);
    }
    if (logger) await logger.save();
    process.exit(0);
  });

  await bot.run();
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exitCode = 1;
});
