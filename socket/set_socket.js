var socket_io = require("socket.io");

module.exports = function(server){

  var io = socket_io(server);

  console.log("io connnection setting...");

  io.on("connection", function(socket){

    console.log("a user "+socket.id.slice(0,4)+" connected");

    socket.join("default");


    socket.on("client_scratch", function(message){

      console.log(JSON.stringify(message));
      socket.broadcast.emit("server_scratch", message);

      console.log(socket.id.slice(0,4) + " scratched" + message);
    });

    socket.on("disconnect", function(){
      console.log("a user "+socket.id+" disconnected");

    });
  });

}
