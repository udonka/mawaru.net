
function RouletteClient(roulette){
  this.socket = io();

  this.model = roulette;

  this.setReceivers();

  this.timeDiffToServer = 0;
}

RouletteClient.prototype.setLabels =function(labels){
  return this.model.setLabels(labels)
}

RouletteClient.prototype.getLabels =function(){
  return this.model.getLabels();
}

RouletteClient.prototype.isChanged = function(){
  return this.model.isChanged();
}

RouletteClient.prototype.drawn = function(){
  return this.model.drawn();
}


RouletteClient.prototype.getCurrentLabel = function(){
  return this.model.getCurrentLabel();
}

RouletteClient.prototype.getVelocity = function(){
  return this.model.getVelocity();
}

RouletteClient.prototype.getAngle = function(){
  return this.model.getAngle();
};

RouletteClient.prototype.recentFunction = function(){
  return this.model.recentFunction();
};

RouletteClient.prototype.initState = function(serverTime ,serverAngle, serverVel){

  var myTime = Date.now();


  this.timeDiffToServer = serverTime - myTime;

  this.model.initState(serverTime, serverAngle, serverVel);

}


RouletteClient.prototype.impact = function(timestamp, impactValue){

  var serverTime = timestamp + this.timeDiffToServer;

  this.socket.emit("client_scratch", {
    timestamp:serverTime,
    value:impactValue
  });

  return this.model.impact(serverTime, impactValue);
}


RouletteClient.prototype.serverConnected = function(){
  return this.connectionPromise;
}
RouletteClient.prototype.setReceivers= function(){

  var this_roulette = this;

  this.connectionPromise = new Promise(function(resolve,reject){
    this_roulette.socket.on("time_adjust",function(message){

      var serverTime = message.timestamp;
      var serverAngle = message.angle;
      var serverVel = message.velocity;

      this_roulette.initState(serverTime, serverAngle, serverVel);

      resolve();
    });

    setTimeout(function(){
      reject(new Error("10秒以内にサーバーにつなげなかったのでアウトー"));
    }, 10 * 1000);
  });

  this.socket.on("server_scratch",function(message){
    //もってるか調べる
    //ここで矛盾があろうとも、サーバー様の言うことがただしい。
    //歴史を無理やり付け足す。
    this_roulette.model.addHistory(
      message.time,
      message.value,
      message.angle,
      message.velocity
    );
    //矛盾のごまかしも仕掛けたい
  });
};



RouletteClient.prototype.firstImpactTime = function(){
  return this.model.firstImpactTime();
};


//最新のを使っちゃう
RouletteClient.prototype.calcCurrentAngle = function(timestamp){
  var serverTime = timestamp + this.timeDiffToServer;

  return this.model.calcCurrentAngle(serverTime );
};


RouletteClient.prototype.calcCurrentAngleWithBack = function(timestamp){
  var serverTime = timestamp + this.timeDiffToServer;
  return this.model.calcCurrentAngleWithBack(serverTime );
};


