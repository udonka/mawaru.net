function RouletteView(angle){
  var self = this;
  self.angle = new Angle(angle);

  this.labels = ["taro", "fuji", "hoge" ];

  //とりあえず最初はいつでも0の位置
  this.currentFunction = function(){ 
    return {angle : 0, velocity:0}
  }
  this.friction = 1; // rad / sec^2
}

RouletteView.prototype.setAngle = function(angle){
  this.angle.set(angle);
  return this.angle.get();
}


RouletteView.prototype.impact = function(timestamp, impactValue){
  var impactTime = timestamp;

  console.log("impact");

  this.currentFunction = this.generateMoveFunction(impactTime, impactValue);
}

RouletteView.prototype.generateMoveFunction = function(impactTime, impactValue){
  console.log("impact! " + impactTime + " " + impactValue);

  //今までどおりの関数で、角度と角速度を計算
  var obj = this.currentFunction(impactTime);

  var impactVelocity = obj.velocity + impactValue;
  var impactAngle = obj.angle;

  //impactTimeは保存される

  //impactTime, impactVelocity, impactAngle を束縛するクロージャを返す
  //impactValueは、impactVelocityの中に入っている。
  return function(timestamp){
    //impactTimeを基準にした時間に変換
    //これにより、計算が非常に楽になる。
    var t_ms = timestamp - impactTime; 

    var t_sec = t_ms / 1000;

    console.log(t_sec);
    //摩擦力は、速度の方向とは逆方向
    var f = - this.friction * (impactVelocity>0 ? 1 : -1);

    var velocity = f * t_sec + impactVelocity;
                   //摩擦減速  //切片: 初めの速度

    //velocity は angle を微分したもの。
    var angle = 
      1/2*f*t_sec*t_sec +     //2次項  摩擦減速
      impactVelocity*t_sec + //1次項  慣性
      impactAngle;           //定数項 初めの角度
                


    //基準速度と速度が逆になった場合:減衰による停止
    if(impactVelocity * velocity < 0){ 
      //これ以降は位置は固定で速度は0のはず
      this.currentFunction = function(){
        return {
          angle:angle,
          velocity:0
        };
      }
      //早速↑の関数を使う  
      return this.currentFunction();
    }

    //位置と速度を返す
    return {
      angle:angle,
      velocity:velocity
    };
  };
};

RouletteView.prototype.calcCurrentAngle = function(timestamp){
  this.angle.set(this.currentFunction(timestamp).angle);

};


RouletteView.prototype.draw = function(c){
  var theta = this.angle.get();
  
  c.lineWidth = 5;
  c.strokeStyle= "#000";
  c.fillStyle= "#f00";

  var center_x = 200;
  var center_y = 200;
  var radius = 400;



  var label_num = this.labels.length;

  var label_size = Math.PI * 2 / label_num;
  var label_angle= 0;

  var hue_size  = 360 / label_num;
  var hue_angle = 0;


  c.save();
    c.translate(center_x, center_y);
    c.rotate(theta);

    for(i in this.labels){
      var label = this.labels[i];
      label_angle = label_size * i ;
      hue_angle = (hue_size * i ) % 360;

      c.beginPath();
        c.moveTo(0,0);
        c.fillStyle = hsva(hue_angle, 0.7, 0.8, 1);
        c.arc(0, 0, radius, label_angle , label_angle + label_size, false);
      c.closePath();
      c.fill();

      c.beginPath();
        c.arc(0, 0, radius*0.1, 0 , Math.PI * 2, false);
      c.closePath();

      c.fillStyle="#fff";

      c.fill();

    }

    c.strokeRect(0,0,radius,0);

  c.restore();

  c.fillStyle ="#000";
  c.fillText(this.angle.get(), 50,50);
};

