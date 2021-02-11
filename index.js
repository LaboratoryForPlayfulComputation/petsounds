/* 
  This is the main server logic which handles
  1) receiving requests from the client, 
  2) responding with appropiate data,
  3) creating, deleting, and saving recordings,
  4) encoding and decoding audio data. 
*/

/* Require statements */
var express      = require('express');          // server framework
var app          = express();
var http         = require('http').Server(app);
var io           = require('socket.io')(http);  // for real-time client-server communication
var ss           = require('socket.io-stream');
var fs           = require('fs');               // for using the filesystem
const Sound      = require('node-arecord');     // for interfacing with the microphone
var mic          = require('mic');
var wav          = require('node-wav');         // not using currently
const WavDecoder = require("wav-decoder");      // for decoding wav files

/* Global variables */
var WS_PORT      = 8080
var open_sockets = [];                              // list of connected clients
var files        = fs.readdirSync('./recordings/'); // array of files in the recordings directory
var numOfFiles   = files.length;
var micInstance  = mic({
                     rate: '44100',
                     channels: '1',
                     debug: true,
                     exitOnSilence: 6,
                     fileType: 'wav'
                   });

/* Logic for what files server sends when client connects to home page */
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static('public'));

/* Event when a user connects (i.e. a new client in the browser) */
/* Add code in here for listening for websocket messages */
/* socket.on listens for messages, socket.emit sends a message */
io.on('connection', function(socket){
  console.log('a user connected');
  open_sockets.push(socket);

  /* initialize live microphone stream to client */
  ss(socket).on('live', function(stream) {
    var micInputStream = micInstance.getAudioStream();
    micInputStream.on('data', function(data) {
      console.log("Recieved Input Stream: " + data.length);
    });
    micInputStream.on('error', function(err) {
      cosole.log("Error in Input Stream: " + err);
    });
    micInputStream.pipe(stream);
    micInstance.start();
  });

  /* Send list of available filenames to client */
  socket.emit('filenames', files);

  socket.on('trends', function() {
    // To do
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

/* Helper functions which can eventually move to separate files */
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

  }, 2000);

}

function recordWavefile() {
  var filename = './recording' + numOfFiles.toString() + '.wav';
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
      var numOfFiles = files.length;

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
    var msg = {filename: filename, audioData: audioData};
    socket.emit("receive-file", msg);
  });
}

