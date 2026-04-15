import https from 'node:https';
import http from 'node:http';

function fetch(url) {
  const client = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    client.get(url, { headers: { 'User-Agent': 'trading-bot/0.3' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Failed to parse response: ${data.slice(0, 300)}`));
        }
      });
    }).on('error', reject);
  });
}

export class YahooPriceFeed {
  constructor({ symbol }) {
    this.symbol = symbol;
    this.lastPrice = null;
  }

  async fetchCurrentPrice() {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${this.symbol}?interval=1m&range=1d`;
    const json = await fetch(url);

    if (json.chart && json.chart.error) {
      throw new Error(`Yahoo Finance error: ${JSON.stringify(json.chart.error)}`);
    }

    const result = json.chart?.result?.[0];
    if (!result) {
      throw new Error(`No data returned for ${this.symbol}`);
    }

    const meta = result.meta;
    const price = meta?.regularMarketPrice;

    if (!Number.isFinite(price)) {
      throw new Error(`Invalid price for ${this.symbol}`);
    }

    this.lastPrice = price;
    return price;
  }

  async getNextPrice() {
    return this.fetchCurrentPrice();
  }
}
