function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getSignal(prices, shortWindow, longWindow) {
  if (prices.length < longWindow + 1) {
    return { action: 'hold', reason: 'waiting-for-history' };
  }

  const previousPrices = prices.slice(0, -1);
  const currentShort = average(prices.slice(-shortWindow));
  const currentLong = average(prices.slice(-longWindow));
  const previousShort = average(previousPrices.slice(-shortWindow));
  const previousLong = average(previousPrices.slice(-longWindow));

  if (previousShort <= previousLong && currentShort > currentLong) {
    return { action: 'buy', reason: 'bullish-crossover', shortAverage: currentShort, longAverage: currentLong };
  }

  if (previousShort >= previousLong && currentShort < currentLong) {
    return { action: 'sell', reason: 'bearish-crossover', shortAverage: currentShort, longAverage: currentLong };
  }

  return { action: 'hold', reason: 'no-crossover', shortAverage: currentShort, longAverage: currentLong };
}
