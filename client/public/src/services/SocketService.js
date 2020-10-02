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
    let subjectId = `file:///west/{scale}/{date}/{hour}/{minsec}/${band}/{apid}/blocks/{block}/web-scaled.png`
    if( this.store.data.band.subjectId === subjectId ) return;

    let currentId = this.store.data.band.subjectId;
    if( currentId && this.connected ) {
      console.log('Unlistening to: '+this.store.data.band.subjectId);
      this.io.emit('unlisten', JSON.stringify([currentId]));
    }

    this.store.data.band = {band, subjectId};

    if( this.connected ) {
      console.log('Listening to: '+this.store.data.band.subjectId);
      this.io.emit('listen', JSON.stringify([{
        subject : subjectId
      }]));
    }
  }

  onConnect() {
    console.log('connected to socket');
    this.connected = true;

    // make sure we reconnect 
    if( this.store.data.band.subjectId ) {
      console.log('Listening to: '+this.store.data.band.subjectId);
      this.io.emit('listen', JSON.stringify([{
        subject : this.store.data.band.subjectId
      }]));
    }
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