var socket = io();

socket.on('recording', function(msg){
  console.log("received socket msg");
  console.log(msg);

  /*var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'black',
    progressColor: 'purple',
  });*/

  var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'black',
    progressColor: '#31D0AA',
    barWidth: 1,
    barRadius: 2,
    /*,
    plugins: [
      WaveSurfer.spectrogram.create({
          container: '#wave-spectrogram'
      })
    ]*/
    plugins: [
        WaveSurfer.spectrogram.create({
            wavesurfer: wavesurfer,
            container: "#wave-spectrogram",
            labels: true
        })
    ]
});

  /*wavesurfer.on('ready', function () {
    var spectrogram = Object.create(WaveSurfer.Spectrogram);
    spectrogram.init({
      wavesurfer: wavesurfer,
      container: "#wave-spectrogram",
      fftSamples: 1024,
      labels: true
    });
  });*/

  wavesurfer.load('http://wavesurfer-js.org/example/media/demo.wav');
  /*wavesurfer.loadArrayBuffer(msg.channelData);
  wavesurfer.drawBuffer();*/
});
