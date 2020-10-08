const {AppStateModel} = require('@ucd-lib/cork-app-state');
const AppStateStore = require('../stores/AppStateStore');

class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();
    this.store = AppStateStore;

    // this.EventBus.on(this.store.events.APP_STATE_UPDATE, () => this._sendGA());
    // this._sendGA();

    setInterval(() => this.setLowLightState(), 1000 * 60 * 15);
    setTimeout(() => this.setLowLightState(), 500);
  }


  set(state) {
    if( !state.band && !this.store.data.band ) {
      state.band = 7;
    }

    return super.set(state);
  }

  setLowLightState() {
    let now = new Date();
    let hour = now.getUTCHours();

    let lowLight = false;
    if( hour > 2 && hour < 14 ) lowLight = true;

    if( this.store.data.lowLight === lowLight ) return;
    this.set({lowLight});
  }

}

module.exports = new AppStateModelImpl();