import { readFile } from 'node:fs/promises';

export async function loadClosePricesFromCsv(path) {
  const raw = await readFile(path, 'utf8');
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(`CSV file ${path} does not contain enough rows`);
  }

  const header = lines[0].split(',').map((value) => value.trim().toLowerCase());
  const closeIndex = header.indexOf('close');
  if (closeIndex === -1) {
    throw new Error(`CSV file ${path} must contain a close column`);
  }

  return lines.slice(1).map((line) => {
    const fields = line.split(',');
    const close = Number(fields[closeIndex]);
    if (!Number.isFinite(close)) {
      throw new Error(`Invalid close value in ${path}: ${line}`);
    }
    return close;
  });
}
