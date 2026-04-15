import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function loadEnvFile(filePath = '.env') {
  try {
    const raw = await readFile(resolve(filePath), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}
