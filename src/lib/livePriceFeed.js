import https from 'node:https';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Failed to parse response from ${url}: ${data.slice(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

export class LivePriceFeed {
  constructor({ symbol, apiKey, intervalSeconds = 60 }) {
    this.symbol = symbol;
    this.apiKey = apiKey;
    this.intervalSeconds = intervalSeconds;
    this.lastPrice = null;
  }

  async fetchCurrentPrice() {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${this.symbol}&apikey=${this.apiKey}`;
    const json = await fetchJson(url);

    if (json['Error Message']) {
      throw new Error(`Alpha Vantage error: ${json['Error Message']}`);
    }

    if (json['Note'] || json['Information']) {
      throw new Error(`Alpha Vantage rate limit hit. Wait 60 seconds and try again.`);
    }

    const quote = json['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error(`No price data returned for ${this.symbol}. Response: ${JSON.stringify(json).slice(0, 300)}`);
    }

    const price = parseFloat(quote['05. price']);
    if (!Number.isFinite(price)) {
      throw new Error(`Invalid price for ${this.symbol}: ${quote['05. price']}`);
    }

    this.lastPrice = price;
    return price;
  }

  async getNextPrice() {
    return this.fetchCurrentPrice();
  }
}
