export class SimBroker {
  constructor({ symbol, startingEquity, simulatedPrices }) {
    this.symbol = symbol;
    this.cash = startingEquity;
    this.positionQty = 0;
    this.avgEntryPrice = 0;
    this.priceFeed = simulatedPrices;
    this.pointer = 0;
    this.realizedPnL = 0;
  }

  async getNextPrice() {
    const price = this.priceFeed[this.pointer % this.priceFeed.length];
    this.pointer += 1;
    return price;
  }

  async getAccount(price) {
    return {
      cash: this.cash,
      equity: this.cash + this.positionQty * price,
      positionQty: this.positionQty,
      avgEntryPrice: this.avgEntryPrice,
      realizedPnL: this.realizedPnL,
    };
  }

  async buy({ qty, price }) {
    const cost = qty * price;
    if (cost > this.cash) {
      throw new Error('Insufficient cash for simulated buy');
    }

    const newQty = this.positionQty + qty;
    const weightedCost = this.avgEntryPrice * this.positionQty + cost;
    this.cash -= cost;
    this.positionQty = newQty;
    this.avgEntryPrice = weightedCost / newQty;

    return { side: 'buy', qty, price };
  }

  async sell({ qty, price }) {
    if (qty > this.positionQty) {
      throw new Error('Insufficient shares for simulated sell');
    }

    const proceeds = qty * price;
    const pnl = (price - this.avgEntryPrice) * qty;
    this.cash += proceeds;
    this.positionQty -= qty;
    this.realizedPnL += pnl;

    if (this.positionQty === 0) {
      this.avgEntryPrice = 0;
    }

    return { side: 'sell', qty, price, pnl };
  }
}
