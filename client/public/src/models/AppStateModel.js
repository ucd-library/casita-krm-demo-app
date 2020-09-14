const {AppStateModel} = require('@ucd-lib/cork-app-state');
const AppStateStore = require('../stores/AppStateStore');

class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();
    this.store = AppStateStore;

    // this.EventBus.on(this.store.events.APP_STATE_UPDATE, () => this._sendGA());
    // this._sendGA();
  }


  set(state) {
    // if( state.gridModeEnabled === undefined ) {
    //   state.gridModeEnabled = true;
    // }
    return super.set(state);
  }

}

module.exports = new AppStateModelImpl();