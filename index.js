var WS_PORT=8080

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
const Sound = require('node-arecord');
var wav = require('node-wav');

var open_sockets = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

io.on('connection', function(socket){
  console.log('a user connected');
  open_sockets.push(socket);

  recordAudio(socket);

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

//    let buffer = fs.readFileSync('./recordings/recording.wav');
//    let result = wav.decode(buffer);

//    socket.emit("recording", buffer);
    socket.emit("recording", "hi");

}, 2000);

}
