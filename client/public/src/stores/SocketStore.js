const {BaseStore} = require('@ucd-lib/cork-app-utils');

class SocketStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      boundary : {},
      lightening : [],
      strikeCount : 0
    };
    this.events = {
      IMAGE_BOUNDARY_UPDATE : 'image-boundary-update',
      LIGHTINING_EVENTS_UPDATE : 'lightning-events-update',
      LIGHTINING_STRIKE_COUNT_UPDATE : 'lightning-strike-count-update'
    };
  }

  onImageBoundaryLoad(id, payload) {
    this._setImageBoundaryState({
      state : this.STATE.LOADED,
      id, payload
    })
  }

  _setImageBoundaryState(state) {
    this.data.boundary[state.id] = state;
    this.emit(this.events.IMAGE_BOUNDARY_UPDATE, state);
  }

  onLightningEventsLoad(data) {
    this.data.lightening = data;
    this.emit(this.events.LIGHTINING_EVENTS_UPDATE, this.data.lightening);
  }

  onLightningCountLoad(data) {
    this.data.strikeCount = data.data;
    this.emit(this.events.LIGHTINING_STRIKE_COUNT_UPDATE, this.data.strikeCount);
  }

}


//geos projection
module.exports = new SocketStore();