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

  onConnect() {
    console.log('connected to socket');
    this.io.emit('listen', JSON.stringify([{
      subject : 'file:///west/{scale}/{date}/{hour}/{minsec}/2/{apid}/blocks/{block}/web_scaled.png'
    }]));
  }

  onDisconnect() {
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

    // data = Object.assign(data, apidUtils.get(data.apid)); 
    // new Date('2000-01-01T12:00:00.000Z').getTime()
    // data.localTime = new Date(APP_CONFIG.epoch + (data.time * 1000));

    // this.store.onImageBoundaryLoad(this.model.getBoundaryId(data), data);
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