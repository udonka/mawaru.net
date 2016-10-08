function RouletteView(roulette,finger, opts){
  this.model = roulette;
  this.finger = finger;

  this.center = opts.center || new Vec2(0,0);
  this.radius = opts.radius || 200;
}


RouletteView.prototype.draw = function(c){

  var theta = this.model.getAngle();
  var labels = this.model.labels;

  this.drawWheel(c, theta, labels);

  this.drawFinger(c);
}


RouletteView.prototype.drawFinger = function(c){
  var startPoint = this.finger.downPoint;
  var endPoint = this.finger.currentPoint;
  var impact = Math.abs(this.finger.currentImpact);

  if(!startPoint || !endPoint || !impact){
    return;
  }
  else{
    console.log("draw");
  }

  c.save();
    c.translate(this.center.x, this.center.y)
    c.scale(this.radius, this.radius);

    c.beginPath();
    c.moveTo(startPoint.x, startPoint.y);
    c.lineTo(endPoint.x,   endPoint.y);
    c.strokeStyle = "#e00";
    c.lineWidth= impact / 100;

    c.stroke();

  c.restore();

}

RouletteView.prototype.drawWheel = function(c, theta, labels){
  c.lineWidth = 5;
  c.strokeStyle= "#000";
  c.fillStyle= "#f00";

  var center_x = this.center.x;
  var center_y = this.center.y;
  var radius = this.radius;


  var label_num = labels.length;

  var label_size = Math.PI * 2 / label_num;
  var label_angle= 0;

  var hue_size  = 360 / label_num;
  var hue_angle = 0;


  c.save();
    c.translate(center_x, center_y);
    c.rotate(theta);

    c.shadowBlur = radius*0.01;
    c.shadowColor = "rgba(0,0,0,0.3)";
    c.shadowOffsetY = radius*0.01;
    c.beginPath();
      c.arc(0, 0, radius, 0 , Math.PI * 2, false);
    c.closePath();
    c.fill();

    c.shadowColor = "transparent";

    for(i in labels){
      var label = labels[i];
      label_angle = label_size * i ;
      hue_angle = (hue_size * i ) % 360;

      c.beginPath();
        c.moveTo(0,0);
        c.fillStyle = hsva(hue_angle, 0.4, 1, 1);
        c.arc(0, 0, radius, label_angle , label_angle + label_size, false);
      c.closePath();
      c.fill();


    }


    c.beginPath();
      c.arc(0, 0, radius*0.1, 0 , Math.PI * 2, false);
    c.closePath();
    c.shadowBlur = radius*0.01;
    c.shadowColor = "rgba(0,0,0,0.3)";
    c.shadowOffsetY = radius*0.01;
    c.fillStyle="#fff";
    c.fill();


  c.restore();

  c.fillStyle ="#000";
  c.fillText(theta, 50, 50);
};

