
function Communicator(){
  this.socket = io();

  console.log("connected");
  
  this.setReceivers();

}


Communicator.prototype.setRoulette = function(roulette){
  this.roulette = roulette;
}

Communicator.prototype.sendScratch = function(timestamp, value){
  this.socket.emit("client_scratch", {
    timestamp:timestamp,
    value:value
  });
};


Communicator.prototype.setReceivers= function(){

  var this_comm = this;

  this.socket.on("server_scratch",function(message){

    this_comm.roulette.impact(message.timestamp, message.value);

  });


};
