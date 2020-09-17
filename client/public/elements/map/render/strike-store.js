import StrikeRenderer from "./map-strike-renderer"


class StrikeStore {

  constructor() {
    this.strikes = [];
  }

  addStrikes(strikes) {
    let now = Date.now();

    // add and cleanup
    this.strikes = this.strikes
      .filter(strike => now - strike.created < 30000)
      .concat(strikes.map(s => new StrikeRenderer(s)));
  }

}

export default new StrikeStore();