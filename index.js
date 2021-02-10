var WS_PORT=8080

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
const Sound = require('node-arecord');
var wav = require('node-wav');
const WavDecoder = require("wav-decoder");

var open_sockets = [];
var files = fs.readdirSync('./recordings/');
var numberOfFiles = files.length;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

io.on('connection', function(socket){
  console.log('a user connected');
  open_sockets.push(socket);

  socket.emit('filenames', files);

  socket.on('live', function() {
    // send live stream back
    // socket.emit live data
  });

  socket.on('trends', function() {
    // send trends data back
    // socket.emit trends data
  });

  socket.on('request-file', function(filename) {
    decodeAndSendWavefile(filename, socket);
  })

  socket.on('start-recording', function() {
    recordWavefile();
  });

  socket.on('stop-recording', function() {});

  socket.on('toggle-pause-recording', function() {});

  socket.on('disconnect', function(){
        open_sockets = open_sockets.filter(function(item){
              return item != socket;
        });
  });

});

http.listen(WS_PORT, function(){
  console.log('listening for WEBSOCKET connections on *:'+WS_PORT);
});

function recordAudio(socket) {

  var sound = new Sound({
      debug: false,
      destination_folder: './recordings/',
      filename: './recording.wav',
      alsa_format: 'dat',
      alsa_device: 'plughw:1,0'
  });
  sound.record();

  setTimeout(() => {
      sound.stop();
      console.log("done recording");
      socket.emit("recording", "hi");

  }, 2000);

}

function recordWavefile() {
  var filename = './recording' + numberOfFiles.toString() + '.wav';
  var sound = new Sound({
    debug: false,
    destination_folder: './recordings/',
    filename: filename,
    alsa_format: 'dat',
    alsa_device: 'plughw:1,0'
  });
  sound.record();

  setTimeout(() => {
      sound.stop();
      console.log("done recording");

      var files = fs.readdirSync('./recordings/');
      var numberOfFiles = files.length;

      socket.emit("new-recorded-file", filename);

      //    let buffer = fs.readFileSync('./recordings/recording.wav');
      //    let result = wav.decode(buffer);
      //    socket.emit("recording", buffer);

      //decodeAndSendWavefile(filename, socket);

      //socket.emit("recording", "hi");

  }, 2000);
}

function decodeAndSendWavefile(filename, socket) {
  var filepath = './recordings/' + filename.toString();
  const readFile = (filepath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, (err, buffer) => {
        if (err) {
          return reject(err);
        }
        return resolve(buffer);
      });
    });
  };
   
  readFile(filepath).then((buffer) => {
    return WavDecoder.decode(buffer);
  }).then(function(audioData) {
    console.log(audioData.sampleRate);
    console.log(audioData.channelData[0]); // Float32Array
    //console.log(audioData.channelData[1]); // Float32Array
    var msg = {filename: filename, audioData: audioData};
    socket.emit("receivefile", msg);
  });
}

