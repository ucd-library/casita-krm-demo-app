import StrikeRenderer from "./map-strike-renderer"


class StrikeStore {

  constructor() {
    this.strikes = [];
  }

  addStrikes(strikes=[]) {
    if( strikes.length === 0 ) return;
    let now = Date.now();

    let t0 = strikes[0].flash_frame_time_offset_of_first_event;
    for( let i = 1; i < strikes.length; i++ ) {
      this.addStrike(strikes[i], Math.abs(t0 - strikes[i].flash_frame_time_offset_of_first_event));
    }

    // add and cleanup
    this.strikes = this.strikes
      .filter(strike => now - strike.created < 60000);
  }

  addStrike(strike, offset) {
    setTimeout(
      () => this.strikes.push(new StrikeRenderer(strike)),
      offset * 5
    )
  }

}

export default new StrikeStore();