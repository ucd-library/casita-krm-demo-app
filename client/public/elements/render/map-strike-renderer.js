const {EventBus} = require('@ucd-lib/cork-app-utils');

class MapStrikeRenderer {

  constructor(strike) {
    this.created = Date.now();
    this.strike = strike;

    this.imageMode = 'boundary';
    EventBus.on('app-state-update', e => {
      this.imageMode = e.mode;
    });
  }

  redraw(context, scaleFactor, now) {
    if( this.imageMode !== 'boundary' && !this.imageMode.match(/fulldisk/) ) {
      return;
    }

    context.beginPath();

    let p = (now - this.created) / 30000;
    context.fillStyle = `rgba(255, 215, 0, ${1-p} )`;

    context.arc(
      this.strike.lon / scaleFactor, 
      this.strike.lat / scaleFactor, 
      2, 0, 2 * Math.PI
    );
    context.fill();

    if( now - this.created > 1000 ) return
    p = (now - this.created) / 1000;

    context.beginPath();

    context.strokeStyle = `rgba(255, 215, 0, ${1-p} )`;
    context.lineWidth = 2;
    context.arc(
      this.strike.lon / scaleFactor, 
      this.strike.lat / scaleFactor, 
      24*p, 0, 2 * Math.PI
    );
    context.stroke();
  }

}

export default MapStrikeRenderer;