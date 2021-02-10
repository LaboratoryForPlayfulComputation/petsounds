var numChannels = 1;
var sampleRate = 250000;
var socket = io();
var audioCtx = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 250000});
var analyser = audioCtx.createAnalyser();

socket.on('livedata', function(stream) {
  // update view with live data
});

socket.on('filenames', function(files) {
  var namesListElement = document.getElementById("filenames");
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    namesListElement.innerHTML = namesListElement.innerHTML + '<li class="nav-item"><a class="nav-link js-scroll-trigger" onclick="fileSelected(\'' + f.toString() + '\')" href="#"><span class="nav-item-primary-icon"><i class="fas fa-headphones-alt"></i></span><span class="nav-item-primary-label">'+ f.toString() +'</span></a></li>'
  }
})

socket.on('new-recorded-file', function(filename) {
  namesListElement.innerHTML = namesListElement.innerHTML + '<li class="nav-item"><a class="nav-link js-scroll-trigger" onclick="fileSelected(\'' + filename.toString() + '\')" href="#"><span class="nav-item-primary-icon"><i class="fas fa-headphones-alt"></i></span><span class="nav-item-primary-label">'+ filename.toString() +'</span></a></li>'
});

socket.on('receivefile', function(msg) {
  var filename = msg["filename"];
  var audioData = msg["audioData"];
  audioCtx.resume();

  /* Clear current graphs */
  document.getElementById("recording-title").innerHTML = filename.toString();
  document.getElementById("waveform").innerHTML = "";
  document.getElementById("spectrum").innerHTML = "";
  document.getElementById("wave-spectrogram").innerHTML = "";

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

function fileSelected(filename) {
  socket.emit('request-file', filename);
  $("#recorded-file-view").show();
  $("#trends-view").hide();
  $("#live-view").hide();
}