import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export class Dashboard {
  constructor({ port = 3000, logger }) {
    this.port = port;
    this.logger = logger;
    this.botStatus = { mode: 'starting', symbol: '', equity: 0, cash: 0, position: 0, lastPrice: 0, lastUpdate: null };
  }

  updateStatus(status) {
    Object.assign(this.botStatus, status, { lastUpdate: new Date().toISOString() });
  }

  async start() {
    const server = http.createServer(async (req, res) => {
      if (req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        const summary = this.logger.getSummary();
        res.end(JSON.stringify({ ...this.botStatus, ...summary }));
        return;
      }

      if (req.url === '/' || req.url === '/index.html') {
        try {
          const html = await readFile(resolve('src/dashboard/index.html'), 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        } catch {
          res.writeHead(500);
          res.end('Dashboard HTML not found');
        }
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    await new Promise((resolvePromise, reject) => {
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          this.port += 1;
          console.log(`Port in use, retrying on port ${this.port}...`);
          server.listen(this.port);
        } else {
          reject(err);
        }
      });
      server.listen(this.port, () => {
        console.log(`Dashboard running at http://localhost:${this.port}`);
        resolvePromise();
      });
    });
  }
}
