function RouletteClient(roulette){
  var this_roulette = this;

  this.socket = io();
  this.model = roulette;


  this.connectionPromise = new Promise(function(resolve,reject){
    this_roulette.socket.emit("client_handshake",{
      //入りたい部屋とか
    });

    this_roulette.socket.on("server_handshake",function(message){

      var serverTime = message.timestamp;
      var serverAngle = message.angle;
      var serverVel = message.velocity;
      var timerParams = message.timer;


      this_roulette.initState(serverTime, serverAngle, serverVel);

      if(timerParams){
        var timer = this_roulette.getTimer();

        timer.setCountTime(timerParams.countTime);
        if(timerParams.startTime){
          timer.start(timerParams.startTime);
        }

      }

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
    console.log("server_scratch");
    this_roulette.model.addHistory(
      message.timestamp,
      message.value,
      message.angle,
      message.velocity
    );
    //矛盾のごまかしも仕掛けたい
  });

  this.socket.on("server_timerStart",function(message){
    console.log("server_timerStart");

    this_roulette.model.timer.setCountTime(message.countTime);
    this_roulette.model.timer.start(message.startTime);

  });


  this.socket.on("server_timerRelease",function(){
    console.log("server_timerRelease");
    this_roulette.model.timer.release();
  });

  this.socket.on("server_setLabels",function(message){
    console.log("set labels");
    this_roulette.model.setLabels(message.labels);
  });

  this.timeDiffToServer = 0;
}

RouletteClient.prototype.on = function(eve, func){
  return this.model.on(eve,func);
}

RouletteClient.prototype.setTimer=function(timer){
  return this.model.setTimer(timer);
}

RouletteClient.prototype.getTimer=function(){
  return this.model.getTimer();
}

RouletteClient.prototype.toggleTimer=function(timestamp){
  var state = this.currentState(timestamp);

  if(state == "counting"){
    return ; //カウント中はなにもしない
  }
  else if(state == "standby"){
    return this.startTimer(timestamp);
  }
  else if(state == "locked"){
    return this.releaseTimer();
  }
  else{
    throw new Error("ここにくるのはおかしい。どれかの状態のはずだ");
  }
}

RouletteClient.prototype.startTimer=function(timestamp){
  console.log("timer start");
  var serverTime = timestamp + this.timeDiffToServer;

  this.model.timer.start(serverTime);

  this.socket.emit("client_timerStart", {
    startTime:this.model.timer.startTime,
    countTime:this.model.timer.countTime,
    stopTime:this.model.timer.stopTime
  });
  
  
  return ;
};

RouletteClient.prototype.currentState =function(timestamp){
  var serverTime = timestamp + this.timeDiffToServer;
  return this.model.timer.currentState(serverTime);
}

RouletteClient.prototype.leftRate =function(timestamp){
  var serverTime = timestamp + this.timeDiffToServer;
  return this.model.timer.leftRate(serverTime);
}

RouletteClient.prototype.leftSec =function(timestamp){

  var serverTime = timestamp + this.timeDiffToServer;
  return this.model.timer.leftSec(serverTime);
}

RouletteClient.prototype.releaseTimer=function(){
  this.model.timer.release();

  this.socket.emit("client_timerRelease");

}


RouletteClient.prototype.setLabels =function(labels){
  this.socket.emit("client_setLabels", {labels});
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

  var this_roulette =this;
  this.model.impact(serverTime, impactValue, function(history){
    //history.angleとか必要なのかもしれないけど
    //いまはいいや
    this_roulette.socket.emit("client_scratch", {
      timestamp:serverTime,
      value:impactValue
    });
  });
}

RouletteClient.prototype.serverConnected = function(){
  return this.connectionPromise;
}
RouletteClient.prototype.setReceivers= function(){

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
  return this.model.calcCurrentAngleWithBack( serverTime );
};


