function processImage(imageData, height, width, weights){
  var output = new Array(imageData.length);

  function clip (a,x,b) {
    return Math.min(Math.max(x,a), b);
  }

  function adjustPixel (ci, cj){
    var r=0,g=0,b=0;
    var s=(weights.length-1)/2;
    for (var ii=-s; ii<=s; ii++){
      for (var jj=-s; jj<=s; jj++){
        var i = clip(0, ci + ii, height-1);
        var j = clip(0, cj + jj, width-1);
        r += imageData[3*(i*width + j)+0] * weights[ii+s][jj+s];
        g += imageData[3*(i*width + j)+1] * weights[ii+s][jj+s];
        b += imageData[3*(i*width + j)+2] * weights[ii+s][jj+s];
      }
    }
    output[3*(ci*width+cj)+0] = clip(0,r,255);
    output[3*(ci*width+cj)+1] = clip(0,g,255);
    output[3*(ci*width+cj)+2] = clip(0,b,255);
  }

  for (var i=0; i<height; i++){
    for (var j=0; j<width; j++){
      adjustPixel(i,j);
    }
  }

  return output;
}
