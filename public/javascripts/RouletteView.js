function RouletteView(roulette,finger, opts){
  this.model = roulette;
  this.finger = finger;

  this.center = opts.center || new Vec2(0,0);
  this.radius = opts.radius || 200;

}


RouletteView.prototype.draw = function(c){
  this.model.drawn();//書いたから安心していいよ

  var theta = this.model.getAngle();
  var labels = this.model.getLabels();
  var currentLabel = this.model.getCurrentLabel();

  this.drawWheel(c, theta, labels, currentLabel);

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

RouletteView.prototype.drawWheel = function(c, theta, labels, currentLabel){
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

    c.save();
      for(i in labels){
        var label = labels[i];
        label_angle = label_size * i ;
        hue_angle = (hue_size * i ) % 360;


        c.beginPath();
          c.moveTo(0,0);
          c.fillStyle = hsva(hue_angle, 0.4, 0.9, 1);
          c.arc(0, 0, radius, 
              - label_size /2 ,
              + label_size /2, false);
        c.closePath();
        c.fill();
        
        c.fillStyle="#000";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = "" + radius * 0.1 +"px sans-serif";

        c.fillText(label, radius /2, 0);

        c.rotate(label_size);
      }
    c.restore();


    c.lineWidth = 5;
    c.strokeStyle="#e00"

    c.strokeRect(0,0,100,0);



  c.restore();

  c.save();
    c.translate(center_x, center_y);

    /*
    var h = radius*0.1*0.9 * 2;
    c.fillStyle="rgba(0,0,0,0.7)";
    c.fillRect(0, - h/2 , radius, h);

    c.font = "" + radius * 0.1 +"px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle="#fff";
    c.fillText(this.model.getCurrentLabel(), radius /2, 0);
    */

    var h = radius*0.1*0.9 * 2;

    c.shadowBlur = radius*0.01;
    c.shadowColor = "rgba(0,0,0,0.3)";
    c.shadowOffsetY = radius*0.01;


    var hue_angle = (hue_size * currentLabel.index ) % 360;

    c.fillStyle = hsva(hue_angle, 0.5, 0.95, 1);
    c.fillRect(0, - h/2 , radius, h);

    c.font = "" + radius * 0.1 +"px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle="#000";
    c.fillText(currentLabel.text, radius /2, 0);



    c.beginPath();
      c.arc(0, 0, radius*0.1, 0 , Math.PI * 2, false);
    c.closePath();
    c.shadowBlur = radius*0.01;
    c.shadowColor = "rgba(0,0,0,0.3)";
    c.shadowOffsetY = radius*0.01;
    c.fillStyle="#fff";
    c.fill();

    c.fillStyle ="#000";
  c.restore();
};

