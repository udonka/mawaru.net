var socket_io = require("socket.io");
var Roulette = require("../model/common/Roulette").Roulette;

var roulette = new Roulette(0,0,["label", "hoge", "fuga"]);

module.exports = function(server){

  var io = socket_io(server);

  console.log("io connnection setting...");

  io.on("connection", function(socket){
    var now = Date.now();
    roulette.calcCurrentAngle(now);
    socket.emit('time_adjust', {
      timestamp:now,
      angle: roulette.getAngle(),
      velocity: roulette.getVelocity(), 
    });

    console.log("a user "+socket.id.slice(0,4)+" connected");

    socket.join("default");

    socket.on("client_scratch", function(message){

      roulette.impact(message.timestamp, message.value );

      console.log(JSON.stringify(message));
      socket.broadcast.emit("server_scratch", message);

      console.log(socket.id.slice(0,4) + " scratched" + message);
    });

    socket.on("disconnect", function(){
      console.log("a user "+socket.id+" disconnected");
    });
  });
}


