# Trading Bot Scaffold

This project is a dry-run-first trading bot scaffold with a crude-oil-oriented example setup.

It does not guarantee profit. It is designed to help you inspect strategy behavior before any live brokerage work.

## What is in here

- `sim` mode for quick local runs using sample prices
- `backtest` mode using CSV close-price data
- A simple moving-average momentum strategy
- Risk controls: fixed risk per trade, max allocation, stop loss, take profit, max daily loss, max trades per day
- A disabled Robinhood adapter placeholder so the live-execution seam is visible without enabling unsafe orders

## Default market focus

The example config uses `USO` as a liquid crude-oil proxy and ships with sample crude-oil-style price data in [data/crude_oil_sample.csv](/home/ubuntu/.openclaw/workspace/data/crude_oil_sample.csv). If you want direct crude futures later, that is a separate brokerage and data problem; Robinhood-style retail access is typically via ETFs or related instruments rather than CL futures.

## Run it

1. Copy `.env.example` to `.env`
2. Adjust values if needed
3. Run one of these commands:

```bash
npm start
npm run backtest
```

## Quick inspection

If you want to understand the setup quickly, read these files in this order:

- [README.md](/home/ubuntu/.openclaw/workspace/README.md)
- [src/index.js](/home/ubuntu/.openclaw/workspace/src/index.js)
- [src/lib/bot.js](/home/ubuntu/.openclaw/workspace/src/lib/bot.js)
- [src/lib/strategy.js](/home/ubuntu/.openclaw/workspace/src/lib/strategy.js)
- [src/lib/simBroker.js](/home/ubuntu/.openclaw/workspace/src/lib/simBroker.js)
- [data/crude_oil_sample.csv](/home/ubuntu/.openclaw/workspace/data/crude_oil_sample.csv)

## Project layout

- `src/index.js` selects `sim` or `backtest` mode
- `src/lib/config.js` parses environment configuration
- `src/lib/strategy.js` generates moving-average crossover signals
- `src/lib/bot.js` runs the strategy, enforces risk limits, and prints a trade summary
- `src/lib/simBroker.js` provides in-memory execution for testing
- `src/lib/robinhoodBroker.js` is a disabled placeholder for future live-broker work
- `src/lib/csv.js` loads close prices from CSV data files

## Important constraint

The Robinhood adapter is intentionally not implemented. That is deliberate. For a volatile market like crude oil, the right order is:

1. Backtest the strategy
2. Paper trade it
3. Add broker connectivity only after the strategy and operational controls are defensible
