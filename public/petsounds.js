var numChannels = 1;
var sampleRate = 250000;
var socket = io();
var audioCtx = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 250000});
var analyser = audioCtx.createAnalyser();

socket.on('recording', function(audioData){
  console.log("received socket msg");
  audioCtx.resume();

  /* Convert channel data to Float32Array */
  var channelArray = Object.values(audioData.channelData[0]);
  var channelFloatArray = new Float32Array(channelArray);

  /* Create audio buffer and fill it with decoded wav file data (type Float32 array) */
  var buffer = audioCtx.createBuffer(numChannels, channelFloatArray.length, audioData.sampleRate);
  buffer.copyToChannel(channelFloatArray, 0, 0);
  //console.log(buffer.getChannelData(0));

  /* start of custom waveform code (not working), feel like things not connecting to analyser properly */
  /* Create audio source node and connect to analyser */
  /*var source = new AudioBufferSourceNode(
    audioCtx, {
      buffer: buffer
    });*/
  var source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  //source.start(); // plays the recording back
  //analyser.start();

  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0;
  var bufferLength = analyser.frequencyBinCount; // half of fftSize
  var dataArray = new Float32Array(bufferLength);
  analyser.getFloatTimeDomainData(dataArray);

  generateWaveform(bufferLength, dataArray);
  /* end of custom waveform code (not working) */
  
  var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'black',
    progressColor: '#31D0AA',
    audioContext: audioCtx,
    barWidth: 1,
    barRadius: 2,
    plugins: [
        WaveSurfer.spectrogram.create({
            wavesurfer: wavesurfer,
            container: "#wave-spectrogram",
            labels: true
        })
    ]
});

  wavesurfer.loadDecodedBuffer(buffer);
  //wavesurfer.loadArrayBuffer(channelArray);
  //wavesurfer.load('http://wavesurfer-js.org/example/media/demo.wav');
  wavesurfer.drawBuffer();
});
