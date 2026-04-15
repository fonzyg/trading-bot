import { getSignal } from './strategy.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDollars(value) {
  return `$${value.toFixed(2)}`;
}

export class TradingBot {
  constructor({ broker, config, prices = [] }) {
    this.broker = broker;
    this.config = config;
    this.sourcePrices = prices;
    this.prices = [];
    this.tradeCount = 0;
    this.trades = [];
  }

  getMaxDailyLoss(startingEquity) {
    return startingEquity * this.config.maxDailyLossPct;
  }

  getPositionSize({ equity, price }) {
    const riskBudget = equity * this.config.riskPerTradePct;
    const stopDistance = price * this.config.stopLossPct;
    const cappedByRisk = Math.floor(riskBudget / stopDistance);
    const cappedByAllocation = Math.floor((equity * this.config.maxPositionPct) / price);
    return Math.max(0, Math.min(cappedByRisk, cappedByAllocation));
  }

  shouldExitPosition(account, price) {
    if (account.positionQty === 0) {
      return null;
    }

    const stopPrice = account.avgEntryPrice * (1 - this.config.stopLossPct);
    const targetPrice = account.avgEntryPrice * (1 + this.config.takeProfitPct);

    if (price <= stopPrice) {
      return 'stop-loss';
    }

    if (price >= targetPrice) {
      return 'take-profit';
    }

    return null;
  }

  recordTrade({ side, qty, price, pnl = 0, reason, tick }) {
    this.trades.push({ side, qty, price, pnl, reason, tick });
  }

  printSummary(finalAccount) {
    console.log('Summary');
    console.log(`Trades executed: ${this.trades.length}`);
    console.log(`Round trips: ${Math.floor(this.trades.filter((trade) => trade.side === 'sell').length)}`);
    console.log(`Final equity: ${toDollars(finalAccount.equity)}`);
    console.log(`Realized PnL: ${toDollars(finalAccount.realizedPnL)}`);

    if (this.trades.length > 0) {
      console.log('Trade log:');
      for (const trade of this.trades) {
        console.log(`- tick=${trade.tick} side=${trade.side} qty=${trade.qty} price=${trade.price.toFixed(2)} reason=${trade.reason} pnl=${toDollars(trade.pnl)}`);
      }
    }
  }

  async run() {
    console.log(`Mode: ${this.config.mode}`);
    console.log(`Broker: ${this.config.brokerMode}`);
    console.log(`Symbol: ${this.config.symbol}`);
    console.log(`Starting equity: ${toDollars(this.config.startingEquity)}`);

    const maxTicks = this.sourcePrices.length;

    for (let tick = 0; tick < maxTicks; tick += 1) {
      const price = await this.broker.getNextPrice();
      this.prices.push(price);
      const account = await this.broker.getAccount(price);
      const dailyLossLimit = this.getMaxDailyLoss(this.config.startingEquity);

      console.log(`Tick ${tick + 1}: price=${price.toFixed(2)} equity=${account.equity.toFixed(2)} cash=${account.cash.toFixed(2)} position=${account.positionQty}`);

      if (-account.realizedPnL >= dailyLossLimit) {
        console.log(`Daily loss cap reached at ${toDollars(-account.realizedPnL)}. Stopping bot.`);
        break;
      }

      const exitReason = this.shouldExitPosition(account, price);
      if (exitReason) {
        const result = await this.broker.sell({ qty: account.positionQty, price });
        this.recordTrade({ side: 'sell', qty: result.qty, price, pnl: result.pnl, reason: exitReason, tick: tick + 1 });
        console.log(`Exit ${exitReason}: sold ${result.qty} at ${price.toFixed(2)} pnl=${toDollars(result.pnl)}`);
        continue;
      }

      const signal = getSignal(this.prices, this.config.shortWindow, this.config.longWindow);
      if (signal.action === 'buy' && account.positionQty === 0 && this.tradeCount < this.config.maxTradesPerDay) {
        const qty = this.getPositionSize({ equity: account.equity, price });
        if (qty > 0) {
          await this.broker.buy({ qty, price });
          this.tradeCount += 1;
          this.recordTrade({ side: 'buy', qty, price, reason: signal.reason, tick: tick + 1 });
          console.log(`Entry ${signal.reason}: bought ${qty} at ${price.toFixed(2)}`);
        }
      } else if (signal.action === 'sell' && account.positionQty > 0) {
        const result = await this.broker.sell({ qty: account.positionQty, price });
        this.recordTrade({ side: 'sell', qty: result.qty, price, pnl: result.pnl, reason: signal.reason, tick: tick + 1 });
        console.log(`Exit ${signal.reason}: sold ${result.qty} at ${price.toFixed(2)} pnl=${toDollars(result.pnl)}`);
      }

      if (this.config.mode === 'live' && this.config.brokerMode !== 'sim') {
        await sleep(this.config.pollIntervalMs);
      }
    }

    const finalPrice = this.prices[this.prices.length - 1];
    const finalAccount = await this.broker.getAccount(finalPrice);
    this.printSummary(finalAccount);
  }
}
