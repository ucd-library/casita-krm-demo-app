// function fitData(val, min, max) {
//   if( val < min ) val = min;
//   else if ( val > max ) val = max;

//   val = val - min;

//   return Math.round( ( val / (max-min)) * 255);
// }

onmessage = function(e) {
  let blocks = e.data.data;
  let absMin = e.data.min || 90;
  let absMax = e.data.max || 200;

  let histogram = {};

  let min = Number.MAX_SAFE_INTEGER;
  let max = 0;

  for( let block of blocks ) {
    let data = block.data;
    for( let i = 0; i < data.length; i++ ) {
    // for( let i = 0; i < data.length; i +=4 ) {
      // if( data[i+3] === 0 ) continue;
      // if( data[i] === 0 && data[i+1] === 0 && data[i+2] === 0 ) {
      //   continue;
      // }

      if( histogram[data[i]] !== undefined ) histogram[data[i]] += 1;
      else histogram[data[i]] = 1;

      if( data[i] > absMax ) continue;
      if( data[i] < absMin ) continue;

      if( min > data[i] ) min = data[i];
      if( max < data[i] ) max = data[i];
    }
  }

  // for( let block of blocks ) {
  //   let data = block.data;
  //   for( let i = 0; i < data.length; i++ ) {
  //   // for( let i = 0; i < data.length; i +=4 ) {
  //     if( data[i] === 0 ) {
  //       continue;
  //     }
  //     // if( data[i] === 0 && data[i+1] === 0 && data[i+2] === 0 ) {
  //     //   continue;
  //     // }

  //     data[i] = fitData(data[i], min, max);
  //     data[i] = fit;
  //   }
  // }

  postMessage({min, max, histogram});
}

