const {EventBus} = require('@ucd-lib/cork-app-utils');

class MapStrikeRenderer {

  constructor(strike) {
    this.created = Date.now();
    this.strike = strike;

    // this.imageMode = 'boundary';
    // EventBus.on('app-state-update', e => {
    //   this.imageMode = e.mode;
    // });
  }

  redraw(context, mapView, now) {
    // if( this.imageMode !== 'boundary' && !this.imageMode.match(/fulldisk/) ) {
    //   return;
    // }

    context.beginPath();

    let p = (now - this.created) / 60000;
    context.fillStyle = `rgba(255, 215, 0, ${1-p} )`;

    let scaleFactor = mapView.zoom*2;

    let energy = this.strike.flash_energy / 500;
    if( energy > 1 ) energy = 1;
    if( energy < .25 ) energy = 0.25;

    let x = mapView.offset.x + (this.strike.flash_x / scaleFactor);
    let y = mapView.offset.y + (this.strike.flash_y / scaleFactor);

    context.arc(
      x, y, 
      3*energy, 0, 2 * Math.PI
    );
    context.fill();

    if( now - this.created > 1000 ) return
    p = (now - this.created) / 1000;

    context.beginPath();

    context.strokeStyle = `rgba(255, 215, 0, ${1-p} )`;
    context.lineWidth = 2;
    context.arc(
      x, y, 
      28*p*energy, 0, 2 * Math.PI
    );
    context.stroke();
  }

}

export default MapStrikeRenderer;