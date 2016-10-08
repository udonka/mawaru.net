function Roulette(angle){

  this.angle = new Angle(0); //ほんとに、Viewに渡すだけのバッファ
  this.labels = ["taro", "fuji", "hoge","pikarin", ];

  this.friction = 1; // rad / sec^2

  //とりあえず最初はいつでも0の位置
  this.forceHistory = [
    {
      time:Date.now(),
      value:0,
      func:function(){ 
        return {angle : 0, velocity:0}
      } 
    }
  ];
}


Roulette.prototype.getAngle = function(){
  return this.angle.get();
};

Roulette.prototype.recentFunction = function(){
  return this.forceHistory[this.forceHistory.length - 1].func;
};

Roulette.prototype.impact = function(timestamp, impactValue){
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

  if(!impactValue){
    throw new Error("impact value must be non-zero number. Not " + impactValue);
  }

  impactVelocity += impactValue;

  //impactTimeは保存される

  //万が一 impactVelocityが0になってしまったら、即0関数を返す
  if(impactVelocity === 0){
    return function(){
      return {
        angle:impactAngle,
        velocity:0
      };
    };
  }

  //摩擦力は、速度の方向とは逆方向
  var f =  this.friction * (impactVelocity>0 ? 1 : -1);

  // v = -ft + v_impact  == 0 となるとき
  var stopTime = impactVelocity / f ;
  // そのときの角度を計算
  var stopAngle = 
        -1/2*f*stopTime*stopTime+    //2次項  摩擦減速
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
          impactTime+" 以降の時間を入れてください。");
    }

    var t_sec = t_ms / 1000;

    //終わる時間も、終わる角度も、すでに決まっているのだ。
    if(t_sec > stopTime){
      return {
        angle:stopAngle,
        velocity:0
      }
    }

    var velocity = - f * t_sec + impactVelocity;
                   //摩擦減速  //切片: 初めの速度

    //velocity は angle を微分したもの。
    var angle = 
      -1/2*f*t_sec*t_sec +    //2次項  摩擦減速
      impactVelocity*t_sec + //1次項  慣性
      impactAngle;           //定数項 初めの角度

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
  this.angle.set(this.recentFunction()(timestamp).angle);
  return this.angle.get();
};


Roulette.prototype.calcAngle = function(timestamp){
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
  return this.angle.get();
};
