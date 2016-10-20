var Server = require("socket.io");
var Roulette = require("../model/common/Roulette").Roulette;
var Timer = require("../model/common/Timer");

var roulette = new Roulette(0,0,["label", "hoge", "fuga"]);

roulette.setTimer( new Timer(3000) );

module.exports = function(http){

  var io = new Server(http);

  console.log("io connnection setting...");

  io.on("connection", function(socket){

    console.log("a user "+socket.id.slice(0,4)+" connected");


    socket.on("client_handshake", function(message){
      console.log("a user "+socket.id.slice(0,4)+" handshaked");

      var now = Date.now();
      roulette.calcCurrentAngle(now);

      var obj = {
        timestamp:now,
        angle: roulette.getAngle(),
        velocity: roulette.getVelocity(), 
      };

      var timer = roulette.getTimer();
      if(timer){
        obj.timer = {
          startTime: timer.startTime,
          countTime: timer.countTime
        };
      }

      socket.emit('server_handshake', obj);

      io.emit("server_setLabels", {labels:roulette.getLabels()});
    });



    socket.on("client_setLabels", function(message){
      console.log("message.labels");

      console.log(message.labels);

      io.emit("server_setLabels", message);

    });

    socket.on("client_scratch", function(message){

      //クライアントに言われたとおり追加する。
      //ただし、最後のimpactよりも前のインパクトは採用されない
      //その結果矛盾が生じることがある。
      roulette.impact(message.timestamp, message.value , function(history){

        var state = {
          timestamp:history.timestamp,
          value:history.value,
          angle:history.angle,
          velocity:history.velocity
        };

        //同じ部屋の住人（自分含む）に送りたい
        io.emit("server_scratch", state);

        console.log(socket.id.slice(0,4) + " scratched" + message);

      });

    });

    socket.on("client_timerStart", function(message){

      var timer = roulette.getTimer();

      timer.setCountTime(message.countTime);
      timer.start(message.startTime, function(){
        console.log("timer stop");
        //timer stop;
        //まあ、わざわざ知らせたところで今更なに？って話ではある。
      });

      socket.broadcast.emit("server_timerStart", message);

    });

    socket.on("client_timerRelease", function(){
      
      var timer = roulette.getTimer();

      timer.release();

      socket.broadcast.emit("server_timerRelease");
    });

    socket.on("disconnect", function(){
      console.log("a user "+socket.id+" disconnected");
    });
  });
}


