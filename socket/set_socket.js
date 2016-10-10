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

      //クライアントに言われたとおり追加する。
      var old_ang_vel = roulette.impact(message.timestamp, message.value );

      var state = {
        time:message.timestamp,
        value:message.value,
        angle:old_ang_vel.angle,
        velocity:old_ang_vel.velocity
      };

      console.log(JSON.stringify(state));
      socket.broadcast.emit("server_scratch", state);

      console.log(socket.id.slice(0,4) + " scratched" + message);
    });

    socket.on("disconnect", function(){
      console.log("a user "+socket.id+" disconnected");
    });
  });
}


