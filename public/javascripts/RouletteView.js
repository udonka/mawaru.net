function RouletteView(angle){
  var self = this;
  self.angle = new Angle(angle);

  this.labels = ["taro", "fuji", "hoge" ];

  //とりあえず最初はいつでも0の位置
  this.currentFunction = function(){ 
    return {position : new Angle(0)}
  }
  this.friction = 0.5;
}

RouletteView.prototype.setAngle = function(angle){
  this.angle.set(angle);
  return this.angle.get();
}


RouletteView.prototype.impact = function(timestamp){
  var impactTime = timestamp;
  var impactValue = 10;

  console.log("impact");

  this.currentFunction = this.generateMoveFunction(impactTime, impactValue);
}

RouletteView.prototype.generateMoveFunction= function(impactTime, impactValue){

  console.log("impact! " + impactTime + " " + impactValue);
  var obj = this.currentFunction(impactTime);
  var currentAngle = obj.position.get();
  
  var stoppedAngle = null;
  //impactTimeは保存される

  return function(timestamp){
    var t_ms = timestamp - impactTime; //impactTimeを基準にした時間に変換

    var t_sec = t_ms / 1000;

    var f = this.friction;

    var velocity = - f *t_sec + 1;
    console.log( "velocity " + velocity );

    var position =  -1/2 * f *t_sec*t_sec + t_sec + currentAngle;

    if(velocity <= 0){ //基準速度と逆になった唖
      if(stoppedAngle == null){
        stoppedAngle =  position;
      }

      return {
        position:new Angle(stoppedAngle),
      }
    }


    return {
      position:new Angle(position),
    }
  };
};

RouletteView.prototype.calcCurrentAngle = function(timestamp){
  this.angle = this.currentFunction(timestamp).position;
  console.log(this.angle);

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

