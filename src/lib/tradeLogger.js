import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export class TradeLogger {
  constructor(filePath = './data/trade_log.json') {
    this.filePath = filePath;
    this.ticks = [];
    this.trades = [];
  }

  async load() {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const data = JSON.parse(raw);
      this.ticks = data.ticks || [];
      this.trades = data.trades || [];
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  async save() {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify({
      ticks: this.ticks.slice(-500),
      trades: this.trades,
    }, null, 2));
  }

  logTick({ tick, price, equity, cash, position, time }) {
    this.ticks.push({ tick, price, equity, cash, position, time });
  }

  logTrade({ side, qty, price, pnl, reason, tick, time }) {
    this.trades.push({ side, qty, price, pnl, reason, tick, time });
  }

  getSummary() {
    const sells = this.trades.filter((t) => t.side === 'sell');
    const totalPnL = sells.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const wins = sells.filter((t) => t.pnl > 0).length;
    const losses = sells.filter((t) => t.pnl <= 0).length;
    return {
      totalTrades: this.trades.length,
      roundTrips: sells.length,
      wins,
      losses,
      winRate: sells.length > 0 ? ((wins / sells.length) * 100).toFixed(1) + '%' : 'N/A',
      totalPnL: totalPnL.toFixed(2),
      ticks: this.ticks,
      trades: this.trades,
    };
  }
}
