'use strict';
var isServer = function(){
  return (typeof window == "undefined")
}

if(isServer()){
  var _ = require('underscore'); //node_moduleから探してくれる
  var Angle = require('./Angle.js').Angle; //同じディレクトリ

  var EventEmitter = require("eventemitter2").EventEmitter2;
}
else{
  var EventEmitter = EventEmitter2;
}



class Roulette extends EventEmitter{

  constructor(angle, velocity, labels){
    super();
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

    this.changed = true;//最初は描画するでしょ

  }



  initState(timestamp, serverAngle, serverVel){
    var func = this.generateMoveFunction(timestamp, 0, serverAngle, serverVel);

    //ここから、サーバーの時間で、歴史がはじまる
    this.forceHistory = [{
      timestamp:timestamp ,
      value:0,
      func:func
    }];
  }

  setTimer(timer){
    this.timer = timer;
  }

  getTimer(){
    return this.timer;
  }


  setLabels(labels){
    this.changed = true;
    this.labels = labels;

    var this_roulette = this;
    setTimeout(function(){
      this_roulette.emit("changed");
    },0);
  }

  getLabels(){
    return this.labels;
  }

  isChanged (){
    return this.changed;
  }

  drawn (){
    this.changed = false;
  }


  getCurrentLabel (){
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

  getVelocity (){
    return this.velocity;
  }

  getAngle (){
    return this.angle.get();
  };

  recentFunction (){
    return this.forceHistory[this.forceHistory.length - 1].func;
  };


  addHistory(impactTime, impactValue, impactAngle, impactVelocity){

    //自分の最近の歴史と同じだったら採用しない
    //サーバーから戻ってきたに過ぎない
    var recent = this.forceHistory[this.forceHistory.length -1];
    if(impactTime == recent.timestamp && impactAngle == recent.angle && impactVelocity == recent.Velocity){
      return recent;
    }

    var func = this.generateMoveFunction(
        impactTime,
        impactValue,
        impactAngle,
        impactVelocity);

    var history = {
      timestamp:impactTime, //時間
      value:impactValue, //力の大きさ
      angle:impactAngle,
      velocity:impactVelocity,
      func:func
    };

    this.forceHistory.push(history);

    return history;
  }

  impact(impactTime, impactValue, next){


    //すでにこの力はかかってるんじゃないか

    var recentTime = this.forceHistory[this.forceHistory.length -1].timestamp;


    var ang_vel = this.recentFunction()(impactTime);

    //申し込まれたimpactが、昔のものだったら
    if(impactTime <= recentTime){
      //ここで逃げてはいけない。再計算をするべき。
      // _____/\____ // だとおもってたけど 
      // __/\_/\___  // まえになんかはいってた！
      // とりあえず今は、なかったことにする。
      return ang_vel; //なにもしない
    }

    //タイマーがあって、それがロック状態ならば、impactはかけられない
    if(this.timer && this.timer.currentState(impactTime) === "locked"){
      return ang_vel; //なにもしない
    }


    console.log("impact! " + impactTime + " " + impactValue);


    var impactAngle    = ang_vel.angle;
    var impactVelocity = ang_vel.velocity;

    var history = this.addHistory(impactTime, impactValue, impactAngle, impactVelocity);

    //歴史に、前の角度、あとの角度、前の速度、あとの速度も両方保存すべきか？
    //あと、ストップタイムもせっかく計算したんだから。

    if(typeof next === "function"){
      next(history);
    }
  }


  //インパクトの時間,そのときの角度と角速度を受け取り、
  //"その後の動きを表す,時間を引数にとる関数"を返す
  generateMoveFunction(impactTime, impactValue, impactAngle, impactVelocity){

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

  firstImpactTime (){
    return this.forceHistory[0].time;
  };


  //最新のを使っちゃう
  calcCurrentAngle (timestamp){
    var ang_vel = this.recentFunction()(timestamp);
    this.angle.set(ang_vel.angle);
    this.velocity =ang_vel.velocity; 
    return this.angle.get();
  };


  calcCurrentAngleWithBack(timestamp){
    //今までの歴史の中から適切な関数を探して、
    //それを使ってtimestamp時の角度を計算

    var history  = this.forceHistory;

    var i = 0;

    var properFunc = function(){
      return {angle:0, velocity:0};
    }

    for(i = 0; i < history.length; i ++){
      var impactPoint = history[i];
      if(timestamp < impactPoint.timestamp ){
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

}

this["Roulette"] = Roulette;
