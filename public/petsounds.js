var socket = io();

socket.on('recording', function(msg){
  console.log("received socket msg");
  document.body.style.backgroundColor = "red";
  console.log(msg);
});
