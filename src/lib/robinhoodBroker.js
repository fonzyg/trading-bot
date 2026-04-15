export class RobinhoodBroker {
  constructor({ symbol }) {
    this.symbol = symbol;
  }

  async getNextPrice() {
    throw new Error('RobinhoodBroker is a placeholder. Wire authenticated market data before live use.');
  }

  async getAccount() {
    throw new Error('RobinhoodBroker is a placeholder. Wire authenticated account access before live use.');
  }

  async buy() {
    throw new Error('RobinhoodBroker is disabled by design. Keep using simulation/backtests until the adapter is implemented and audited.');
  }

  async sell() {
    throw new Error('RobinhoodBroker is disabled by design. Keep using simulation/backtests until the adapter is implemented and audited.');
  }
}
