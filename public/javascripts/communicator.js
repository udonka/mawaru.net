

Communicator.prototype.setReceivers= function(){

  var this_comm = this;

  this.socket.on("server_scratch",function(message){

    this_comm.roulette.impact(message.timestamp, message.value);
  });
};


