// echo -75 80 | proj +proj=geos +x_0=0 +y_0=0 +lon_0=-75 +sweep=x +h=35786023 +ellps=GRS80 +datum=NAD83 +units=m +no_defs
// 0.00 5414758.28
module.exports = {
  goes : {
    // 10484
    scanHeight : 21696,
    scanWidth : 21696,
    mapMpPxScale : 500
  }
}