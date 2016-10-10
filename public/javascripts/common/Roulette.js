var isServer = function(){
  console.log("This is server");
  return (typeof window == "undefined")
}

if(isServer()){
  var _ = require('underscore'); //node_moduleから探してくれる
  var Angle = require('./Angle.js').Angle; //同じディレクトリ
}


function Roulette(angle, velocity, labels){

  var this_roulette = this;
  this.angle = new Angle(angle); //ほんとに、Viewに渡すだけのバッファ
  this.velocity = velocity;

  if(labels.length < 2){
    throw new Error("labelの数が少なすぎます：" + labels.length);
  }
  this.labels = labels

  this.friction = 1; // rad / sec^2
  this.mass = 1; // kg //人数に応じてこの値を変えればいいと思う

  //とりあえず最初はいつでも0の位置

  //この関数の中に閉じ込める
  var firstAngle = this_roulette.angle.get();
  var firstVelocity = this_roulette.velocity;

  this.initState(Date.now(), firstAngle, firstVelocity);


}

Roulette.prototype.initState = function(timestamp, serverAngle, serverVel){
  var func = this.generateMoveFunction(timestamp, 0, serverAngle, serverVel);

  //ここから、サーバーの時間で、歴史がはじまる
  this.forceHistory = [{
    time:timestamp ,
    value:0,
    func:func
  }];
}

Roulette.prototype.setLabels =function(labels){
  this.changed = true;
  this.labels = labels;
}

Roulette.prototype.getLabels =function(){
  return this.labels;
}

Roulette.prototype.isChanged = function(){
  return this.changed;
}

Roulette.prototype.drawn = function(){
  this.changed = false;
}


Roulette.prototype.getCurrentLabel = function(){
  var angle = this.getAngle();

  var labels = this.labels;
  var label_num = labels.length;
  var round = Math.PI * 2;
  var label_size = round / label_num;
  var stop = 0;
  var angle0 = new Angle(angle - label_size /2 - stop).get();
  var index = label_num -1 - Math.floor(angle0 / label_size);
  var currentLabel = labels[index];

  return {
    index:index,
    text:currentLabel
  };
}

Roulette.prototype.getVelocity = function(){
  return this.velocity;
}

Roulette.prototype.getAngle = function(){
  return this.angle.get();
};

Roulette.prototype.recentFunction = function(){
  return this.forceHistory[this.forceHistory.length - 1].func;
};

Roulette.prototype.impact = function(timestamp, impactValue){

  //すでにこの力はかかってるんじゃないか

  var recentTime = this.forceHistory[this.forceHistory.length -1].time;

  //申し込まれたimpactが、昔のものだったら
  if(recentTime >= timestamp){
    return ; //なにもしない
  }




  var impactTime = timestamp;

  console.log("impact! " + impactTime + " " + impactValue);

  var ang_vel = this.recentFunction()(impactTime);

  var impactAngle    = ang_vel.angle;
  var impactVelocity = ang_vel.velocity;

  var func = this.generateMoveFunction(
      impactTime,
      impactValue,
      impactAngle,
      impactVelocity);

  this.forceHistory.push({
    time:timestamp, //時間
    value:impactValue, //力の大きさ
    func:func
  });
}


//インパクトの時間,そのときの角度と角速度を受け取り、
//"その後の動きを表す,時間を引数にとる関数"を返す
Roulette.prototype.generateMoveFunction
  = function(impactTime, impactValue, impactAngle, impactVelocity){

  //力から加速度に変換
  //f = ma より a = f / m
  impactValue = impactValue / this.mass ; 


  impactVelocity += impactValue;

  var d = (impactVelocity>0 ? 1 : -1);

  var maxVel =  10; // [rad / s]

  //最高速度の制限をもうけた
  impactVelocity = d * Math.min(Math.abs(impactVelocity), maxVel);

  //摩擦力は、速度の方向とは逆方向
  var f =  this.friction ;

  // v = -ft + v_impact  == 0 となるとき
  var stopTime = impactVelocity / f*d ;
  // そのときの角度を計算
  var stopAngle = 
        -1/2*f*d*stopTime*stopTime+    //2次項  摩擦減速
        impactVelocity*stopTime + //1次項  慣性
        impactAngle;           //定数項 初めの角度

  //impactTime, impactVelocity, impactAngle, alreadyZero を束縛するクロージャを返す
  //impactValueは、impactVelocityの中に入っている。
  return function(timestamp){
    //impactTimeを基準にした時間に変換
    //これにより、計算が非常に楽になる。
    var t_ms  = timestamp - impactTime; 
    if(t_ms < 0 ){

      
      throw new Error("時間を遡ってはいけません. "+
          impactTime+" 以降の時間を入れてください。"+
          timestamp + " ではだめです。");
    }

    var t_sec = t_ms / 1000;

    //終わる時間も、終わる角度も、すでに決まっているのだ。
    if(t_sec > stopTime){
      return {
        angle:stopAngle,
        velocity:0
      }
    }

    var velocity = - f*d * t_sec + impactVelocity;
                   //摩擦減速  //切片: 初めの速度
    //velocity は angle を微分したもの。
    var angle = 
      -1/2*f*d*t_sec*t_sec +    //2次項  摩擦減速
      impactVelocity*t_sec + //1次項  慣性
      impactAngle;           //定数項 初めの角度

    /* 不完全。指数にしてみたが今度は止まるのがじれったい
    var velocity = - d * impactVelocity * Math.exp(- f * t_sec);
                   //摩擦減速  //切片: 初めの速度
    //velocity は angle を微分したもの。
    var angle = - impactVelocity/f * Math.exp(- f * t_sec)
                + impactVelocity/f + impactAngle;*/


    //位置と速度を返す
    return {
      angle:angle,
      velocity:velocity
    };
  };
};

Roulette.prototype.firstImpactTime = function(){
  return this.forceHistory[0].time;
};


//最新のを使っちゃう
Roulette.prototype.calcCurrentAngle = function(timestamp){
  var ang_vel = this.recentFunction()(timestamp);
  this.angle.set(ang_vel.angle);
  this.velocity =ang_vel.velocity; 
  return this.angle.get();
};


Roulette.prototype.calcCurrentAngleWithBack= function(timestamp){
  //今までの歴史の中から適切な関数を探して、
  //それを使ってtimestamp時の角度を計算

  var history  = this.forceHistory;

  var i = 0;

  var properFunc = function(){
    return {angle:0, velocity:0};
  }

  for(i = 0; i < history.length; i ++){
    var impactPoint = history[i];
    if(timestamp < impactPoint.time ){
      break;
    }
    else{
      properFunc = impactPoint.func;
    }
  }

  var ang_vel = properFunc(timestamp);
  this.angle.set(ang_vel.angle);
  this.velocity = ang_vel.velocity;
  return this.angle.get();
};

this["Roulette"] = Roulette;
