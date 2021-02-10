function generateWaveform(bufferLength, dataArray) {

    var canvasElement = document.getElementById("my-canvas");
    var canvasCtx = canvasElement.getContext("2d");
    canvasCtx.clearRect(0, 0, 480, 270);

    function draw() {
      var drawVisual = requestAnimationFrame(draw);
      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, 480, 270);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
      canvasCtx.beginPath();

      var sliceWidth = 480 * 1.0 / bufferLength;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
  
        var v = dataArray[i] / 128.0;
        var y = v * 270/2;
  
        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
  
        x += sliceWidth;
      }
      canvasCtx.lineTo(480, 270/2);
      canvasCtx.stroke();
    };
    draw();
}

function generateSpectrogtam() {}

function generateBarGraph() {}
