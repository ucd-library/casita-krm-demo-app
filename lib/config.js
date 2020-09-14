let env = process.env.APP_ENV || 'dev';
let clientPackage = require('../client/public/package.json');
let path = require('path');

let FULLDISK_SIZE = 21696;


const BAND_CHARACTERISTICS = {
  1 : {
    resolution: 1,
    bitDepth: 10,
    bitMask : 0x3FF,
    maxValue : 1022,
    offsetBounds : {
      min : -25.93664701,
      max : 804.03605737
    },
    scale : 0.812106364,
    offset: -25.93664701
  },
  2 : { 
    resolution: 0.5,
    bitDepth: 12,
    bitMask : 0xFFF,
    maxValue : 4095,
    offsetBounds : {
      min : -20.28991094,
      max : 628.98723908
    },
    scale : 0.158592367,
    offset: -20.28991094
  },
  3 : { 
    resolution: 1,
    bitDepth: 10,
    bitMask : 0x3FF,
    maxValue : 1022,
    offsetBounds : {
      min : -12.03764377,
      max : 373.16695681
    },
    scale : 0.376912525,
    offset : -12.03764377
  },
  4 : { 
    resolution: 2,
    bitDepth: 11,
    bitMask: 0x7FF,
    maxValue : 2047,
    offsetBounds : {
      min : -4.52236858,
      max : 140.19342584
    },
    scale : 0.070731082,
    offset : -4.52236858
  },
  5 : { 
    resolution: 1,
    bitDepth: 10,
    bitMask : 0x3FF,
    maxValue : 1022,
    scale: 0.095800040,
    offset: 3.05961376
  },
  6 : { 
    resolution: 2,
    bitDepth: 10,
    bitMask : 0x3FF,
    maxValue : 1022,
    offsetBounds : {
      min : -3.05961376,
      max : 94.84802665
    },
    scale: 0.030088475,
    offset: -0.96095066
  },
  7 : { 
    resolution: 2,
    bitDepth: 14,
    bitMask : 0x1FFF,
    maxValue : 16383,
    offsetBounds : {
      min : -0.96095066,
      max : 29.78947040
    },
    scale : 0.001564351,
    offset : 0.03760000
  },
  8 : { 
    resolution: 2,
    bitDepth: 12,
    bitMask : 0xFFF,
    maxValue : 4095,
    offsetBounds : {
      min : -0.03760000,
      max : 25.58960000
    },
    scale : 0.007104763,
    offset : -0.55860000
  },
  9 : { 
    resolution: 2,
    bitDepth: 11,
    bitMask: 0x7FF,
    maxValue : 2047,
    offsetBounds : {
      min : -0.82360000,
      max : 45.29140000
    },
    scale : 0.022539101,
    offset : -0.82360000
  },
  10 : { 
    resolution: 2,
    bitDepth: 12,
    bitMask : 0xFFF,
    maxValue : 4095,
    offsetBounds : {
      min : -0.95610000,
      max : 81.09290000
    },
    scale : 0.020041280,
    offset : -0.95610000
  },
  11 : { 
    resolution: 2,
    bitDepth: 12,
    bitMask : 0xFFF,
    maxValue : 4095,
    offsetBounds : {
      min : -1.30220000,
      max : 135.26460000
    },
    scale : 0.033357792,
    offset : -1.30220000
  },
  12 : { 
    resolution: 2,
    bitDepth: 11,
    bitMask: 0x7FF,
    maxValue : 2047,
    offsetBounds : {
      min : -1.53940000,
      max : 109.84480000
    },
    scale : 0.054439980,
    offset : -1.53940000
  },
  13 : { 
    resolution: 2,
    bitDepth: 12,
    bitMask : 0xFFF,
    maxValue : 4095,
    offsetBounds : {
      min : -1.64430000,
      max : 185.56990000
    },
    scale : 0.045728920,
    offset : -1.64430000
  },
  14 : { 
    resolution: 2,
    bitDepth: 12,
    bitMask : 0xFFF,
    maxValue : 4095,
    offsetBounds : {
      min : -1.71870000,
      max : 200.90240000
    },
    scale : 0.049492208,
    offset : -1.71870000
  },
  15 : { 
    resolution: 2,
    bitDepth: 12,
    bitMask : 0xFFF,
    maxValue : 4095,
    offsetBounds : {
      min : -1.75580000,
      max : 214.30140000
    },
    scale : 0.052774108,
    offset : -1.75580000
  },
  16 : { 
    resolution: 2,
    bitDepth: 10,
    bitMask : 0x3FF,
    maxValue : 1022,
    offsetBounds : {
      min : 5.23920000,
      max : 174.69260000
    },
    scale : 0.176058513,
    offset : -5.23920000
  }
}

// (1/resolution * 2)

const BASE_CA_BLOCKS = [
  {top: 1314, left: 6328},
  {top: 1314, left: 7232},
  {top: 1820, left: 6328},
  {top: 1820, left: 7232}
];

for( let band in BAND_CHARACTERISTICS ) {
  let blocks = [];
  for( let block of BASE_CA_BLOCKS ) {
    blocks.push({
      top : block.top / BAND_CHARACTERISTICS[band].resolution,
      left : block.left / BAND_CHARACTERISTICS[band].resolution
    });
  }
  BAND_CHARACTERISTICS[band].blocks = blocks;
  BAND_CHARACTERISTICS[band].band = band;
}

module.exports = {
  dataServer : {
    url : 'http://casita.justinmerz.net',
    wsPath : '/_/ws'
  },

  server : {
    assets : (env === 'prod') ? 'dist' : 'public',
    appRoutes : ['map', 'about'],
    port : process.env.APP_PORT || process.env.PORT || 3000,
  },
  
  client : {
    gaCode : process.env.GOOGLE_ANALYTICS || '',
    versions : {
      bundle : clientPackage.version,
      loader : clientPackage.dependencies['@ucd-lib/cork-app-load'].replace(/^\D/, '')
    }
  },

  epoch : 946728000000,
  imageScaleFactor : 25,

  fullDiskSize : FULLDISK_SIZE,

  coverage : {
    fulldisk : {
      x : 0.303704160,
      y : 0.302701402
    },
    conus : {
      x : 0.14,
      y : 0.084,
    },
    mesoscale : {
      x : 0.028,
      y : 0.028
    },

    // from center full disk
    offsets : {
      west : {
        conus : {
          x : 0,
          y : 0.086240
        }
      },
      east : {
        conus : {
          x : -0.031360,
          y : 0.086240
        }
      }
    }
  },

  spatialResolutions : {
    0.5 : 0.000014,
    1 : 0.000028,
    2 : 0.000056,
    4 : 0.000112
  },

  bandCharacteristics : BAND_CHARACTERISTICS
}