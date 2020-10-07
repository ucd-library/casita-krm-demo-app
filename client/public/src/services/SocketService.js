const {BaseService, EventBus} = require('@ucd-lib/cork-app-utils');
const SocketStore = require('../stores/SocketStore');
const io = require('socket.io-client');
const apidUtils = require("@ucd-lib/goes-r-packet-decoder/lib/utils/apid");

class SocketService extends BaseService {

  constructor() {
    super();
    this.store = SocketStore;

    this.imageModeEnabled = '';

    this.io = io(APP_CONFIG.dataServer.url, {
      path : APP_CONFIG.dataServer.wsPath
    });

    this.subjectIds = {
      bands : [],
      lightning : []
    };

    this.io.on('connect', () => this.onConnect());
    this.io.on('message', msg => this.onMessage(msg));

    // this.io.on('lightning-events', data => this.onLightningEvents(data));
    // this.io.on('lightning-strike-count', data => this.onLightningStrikeCount(data));
    this.io.on('disconnect', () => this.onDisconnect());

    this.registerListeners = {};
  }

  setModel(model) {
    this.model = model;
  }


  setBand(band) {
    if( this.store.data.band === band ) {
      return;
    }

    if( this.subjectIds.bands.length && this.connected ) {
      console.log('Unlistening to: ', this.subjectIds.bands);
      this.io.emit('unlisten', JSON.stringify(this.subjectIds.bands));
    }

    this.subjectIds.bands = [
      `file:///west/{scale}/{date}/{hour}/{minsec}/${band}/{apid}/blocks/{block}/web-scaled.png`,
      `file:///west/mesocale/{date}/{hour}/{minsec}/${band}/{apid}/blocks/{block}/payload.bin`
    ]
    this.store.data.band = band;

    if( this.connected ) {
      this._listen(this.subjectIds.bands)
    }
  }

  toggleLightning(enabled=true) {
    if( !enabled ) enabled = false;

    if( enabled ) {
      this.subjectIds.lightning = [
        `file:///west/lightning-detection-event-data/{date}/{hour}/{min-sec}/summary/301/stats.json`,
        `file:///west/lightning-detection-flash-data/{date}/{hour}/{min-sec}/{ms}/302/payload.json`
      ]
    }

    if( !this.connected ) return;

    if( enabled ) {
      this._listen(this.subjectIds.lightning)
    } else if( this.subjectIds.lightning.length ) {
      this.io.emit('unlisten', JSON.stringify(this.subjectIds.lightning));
      this.subjectIds.lightning = [];
    }
  }

  onConnect() {
    console.log('connected to socket');
    this.connected = true;

    // make sure we reconnect 
    if( this.subjectIds.bands.length ) {
      this._listen(this.subjectIds.bands)
    }
    if( this.subjectIds.lightning.length ) {
     this._listen(this.subjectIds.lightning)
    }
  }

  _listen(subjects) {
    if( subject.length === 0 ) return;
    console.log('listening to: ', subjects);
    this.io.emit('listen', JSON.stringify(
      subjects.map(subject => ({subject}))
    ));
  }

  onDisconnect() {
    this.connected = false;
    console.warn('disconnected to socket');
  }

  join(room) {
    if( !this.registerListeners[room] ) {
      this.registerListeners[room] = true;
      this.io.on(room, data => this.onImageBoundary(room, data));
    }

    this.io.emit('join', room);
  }

  loadCache(room) {
    this.io.emit('load-cache', room);
  }

  onLightningStrikeCount(data) {
    this.store.onLightningCountLoad(data);
  }

  async onMessage(msg) {
    EventBus.emit('socket-message', msg);
  }

  onLightningEvents(data) {
    data = Object.assign(data, apidUtils.get(data.apid)); 
    this.store.onLightningEventsLoad(data.data);
  }

  _loadImage(url) {
    let img = new Image();
    img.src = url;

    return new Promise((resolve, reject) => {
      img.onload = resolve;
    });
  }

}

module.exports = new SocketService();