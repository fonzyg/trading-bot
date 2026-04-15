import { YahooPriceFeed } from './yahooPriceFeed.js';
import { SimBroker } from './simBroker.js';

export class PaperBroker {
  constructor({ symbol, startingEquity }) {
    this.priceFeed = new YahooPriceFeed({ symbol });
    this.sim = new SimBroker({
      symbol,
      startingEquity,
      simulatedPrices: [],
    });
  }

  async getNextPrice() {
    const price = await this.priceFeed.getNextPrice();
    return price;
  }

  async getAccount(price) {
    return this.sim.getAccount(price);
  }

  async buy({ qty, price }) {
    console.log(`[PAPER] BUY ${qty} shares at $${price.toFixed(2)} (not a real order)`);
    return this.sim.buy({ qty, price });
  }

  async sell({ qty, price }) {
    console.log(`[PAPER] SELL ${qty} shares at $${price.toFixed(2)} (not a real order)`);
    return this.sim.sell({ qty, price });
  }
}
