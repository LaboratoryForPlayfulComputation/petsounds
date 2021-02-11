/*
  Client-side JavaScript code
*/

var socket      = io();   // initialize socket connection client<>server
var fileNames   = []      // list of filenames
var numChannels = 1;      // audio recordings are mono and therefore have 1 channel
var sampleRate  = 250000; // sample rate of the Ultramic
var audioCtx    = new (window.AudioContext || window.webkitAudioContext)({sampleRate: sampleRate});
var analyser    = audioCtx.createAnalyser();

/* When client receives list of filenames from server, add them as list items in the side nav */
socket.on('filenames', function(files) {
  fileNames = files;
  var namesListElement = document.getElementById("filenames");
  for (var i = 0; i < fileNames.length; i++) {
    var f = fileNames[i];
    namesListElement.innerHTML = namesListElement.innerHTML + '<li class="nav-item"><a class="nav-link js-scroll-trigger" id="'+ f.toString() +'" onclick="fileSelected(\'' + f.toString() + '\')" href="#"><span class="nav-item-label"><span class="nav-item-primary-icon"><i class="fas fa-headphones-alt"></i></span><span class="nav-item-primary-label">'+ f.toString() +'</span></span></a></li>'
  }
})

socket.on('live-data', function(stream) {
  // update view with live data
  /* 
    // need code like this to analyze audio data in realtime
    var source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0;
    var bufferLength = analyser.frequencyBinCount; 
    var dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray);
  
    generateWaveform(bufferLength, dataArray);
    */
});

socket.on('new-recorded-file', function(filename) {
  namesListElement.innerHTML = namesListElement.innerHTML + '<li class="nav-item"><a class="nav-link js-scroll-trigger" onclick="fileSelected(\'' + filename.toString() + '\')" href="#"><span class="nav-item-label"><span class="nav-item-primary-icon"><i class="fas fa-headphones-alt"></i></span><span class="nav-item-primary-label">'+ filename.toString() +'</span></span></a></li>'
});

socket.on('receive-file', function(msg) {
  var filename = msg["filename"];
  var audioData = msg["audioData"];
  audioCtx.resume();

  /* Clear current graphs */
  document.getElementById("recording-title").innerHTML = filename.toString();
  document.getElementById("waveform").innerHTML = "";
  document.getElementById("spectrum").innerHTML = "";
  document.getElementById("wave-spectrogram").innerHTML = "";

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

  var buffer = createAudioBufferFromMemory(audioData);
  wavesurfer.loadDecodedBuffer(buffer);
  wavesurfer.drawBuffer();
});

function fileSelected(filename) {
  socket.emit('request-file', filename); // request data from that file on the server
  $("#recorded-file-view").show();
  $("#trends-view").hide();
  $("#live-view").hide();
  $("#live-link").removeClass("active");
  $("#trends-link").removeClass("active");
  $("#" + filename.toString() + "").addClass("active"); // not working
  // To do, also add code to remove active class from other recorded files
}

/* Returns audio buffer containing decoded wav file data */
function createAudioBufferFromMemory(audioData) {
  var channelArray = Object.values(audioData.channelData[0]);
  var channelFloatArray = new Float32Array(channelArray);
  var buffer = audioCtx.createBuffer(numChannels, channelFloatArray.length, audioData.sampleRate);
  buffer.copyToChannel(channelFloatArray, 0, 0);
  return buffer;
}