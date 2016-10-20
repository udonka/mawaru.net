function RouletteView(roulette,finger, opts){
  this.model = roulette;
  this.finger = finger;

  this.center = opts.center || new Vec2(0,0);
  this.radius = opts.radius || 200;

  var this_roulette = this;
  roulette.on("changed",function(){
    this_roulette.cacheWheel(this_roulette.radius,this_roulette.model.getLabels());
  });
}


RouletteView.prototype.haveToDraw = function(c){
  //いまのところめんどくさいからいつでも描画しちゃう
  
  /* 
  var moving = this.model.getVelocity() != 0;
  var changed = this.model.isChanged();
  var timerMoving = this.model.currentState(Date.now()) === "counting";

  console.log(timerMoving);

  return moving || changed || timerMoving;
  */

  return true;
}

RouletteView.prototype.draw = function(c){
  this.model.drawn();//書いたから安心していいよ

  var theta = this.model.getAngle();
  var labels = this.model.getLabels();
  var currentLabel = this.model.getCurrentLabel();

  var now = Date.now();
  var leftSec = this.model.leftSec(now);

  var state = this.model.currentState(now);
  var leftTime =  this.model.leftRate(now); //[0,1]

  this.drawWheelWithShadow(c, theta, labels);

  this.drawTimer(c, labels,  currentLabel, leftSec ,state,leftTime);

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


RouletteView.prototype.drawTimer = function(c, labels, currentLabel, leftSec ,state, leftTime){
  var center_x = this.center.x;
  var center_y = this.center.y;
  var radius = this.radius;

  var label_num = labels.length;
  console.log("label numb = " + labels.length);

  var label_size = Math.PI * 2 / label_num;
  var label_angle= 0;

  var hue_size  = 360 / label_num;
  var hue_angle = 0;

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

    c.shadowBlur = radius * 0.01;
    c.shadowColor = "rgba(0,0,0,0)";
    c.shadowOffsetY = radius*0.01;


    var hue_angle = (hue_size * currentLabel.index  + hue_size/2) % 360;

    c.fillStyle = hsva(hue_angle, 0.5, 0.95, 1);
    c.fillRect(0, - h/2 , radius, h);

    c.font = "" + radius * 0.1 +"px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle="#000";
    c.fillText(currentLabel.text, radius /2, 0);



    //drawTimer

    c.shadowBlur = radius*0.02;
    c.shadowColor = "rgba(0,0,0,0)";
    c.beginPath();
      c.moveTo(0,0);
      c.arc(0, 0, radius*0.24, 0 , 2*Math.PI, true);
    c.closePath();

    c.fillStyle = hsva(0,1,0.8,1);
    c.fill();


    if(state != "locked"){

      if(state=="counting"){
        var leftTime =  leftTime;

        c.fillStyle = hsva(180,1,0.8,1);
      }
      else{ //standby
        var leftTime = 1;
        c.fillStyle = hsva(180,1,0.8,1);

      }

      c.shadowColor = "transparent";

      c.beginPath();
        c.moveTo(0,0);
        c.arc(0, 0, radius*0.24, 0 , leftTime*2*Math.PI, false);
      c.closePath();
      c.fill();
    }



    c.beginPath();
      c.arc(0, 0, radius*0.2, 0 , Math.PI * 2, false);
    c.closePath();
    c.shadowColor = "transparent";
    c.shadowOffsetY = radius*0.02;
    c.fillStyle = "#fff";
    c.fill();

    c.fillStyle ="#000";


    if(state == "locked"){
      var w = radius * 0.1;

      c.fillStyle = "#ddd";
      c.fillRect(-w,-w,w*2,w*2);

      var fontsize = radius * 0.1;
      c.fillStyle="#000";
      c.font = "" + fontsize +"px sans-serif";
      c.fillText("locked", 0,0);
    }
    else{
      if(state=="counting"){
        var h = radius * 0.12;
        var w = radius * 0.1;

        c.beginPath();
        c.moveTo(w,h);
        c.lineTo(-w,h);
        c.lineTo(w,-h);
        c.lineTo(-w,-h);
        c.closePath();
        c.fillStyle = "#ddd";
        c.fill();

      }
      else{//standby
        var h = radius * 0.1;
        var w = radius * 0.12;
        var wa = radius * 0.02;
        

        c.beginPath();
        c.moveTo(-w+wa,-h);
        c.lineTo(w+wa,0);
        c.lineTo(-w+wa,h);
        c.closePath();
        c.fillStyle = "#ddd";
        c.fill();

      }

      c.fillStyle="#000";
      c.font = "" + radius * 0.2 +"px sans-serif";
      c.fillText(leftSec, 0,0);
    }

  c.restore();
}

RouletteView.prototype.drawWheelWithShadow= function(c, theta, labels){
  c.lineWidth = 5;
  c.strokeStyle= "#000";
  c.fillStyle= "#f00";

  var center_x = this.center.x;
  var center_y = this.center.y;
  var radius = this.radius;

  c.save();
    c.translate(center_x, center_y);
    c.rotate(theta);

    c.shadowBlur = radius*0.01;
    c.shadowColor = "rgba(0,0,0,0)";
    c.shadowOffsetY = radius*0.01;
    c.beginPath();
      c.arc(0, 0, radius, 0 , Math.PI * 2, false);
    c.closePath();
    c.fill();


    var wheelCanvas = this.getCachedWheel();
    c.translate(-radius, -radius);
    c.drawImage(wheelCanvas, 0,0, radius*2, radius*2);

    //c.lineWidth = 5;
    //c.strokeStyle="#e00"
    //c.strokeRect(0,0,100,0);

  c.restore();

};

RouletteView.prototype.getCachedWheel= function(){
  if(!this.cachedWheel){
    
    this.cacheWheel(this.radius,this.model.getLabels());
  }
  return this.cachedWheel;
}

RouletteView.prototype.cacheWheel= function(radius, labels){
  var canvas = document.createElement("canvas");
  canvas.width = radius * 2;
  canvas.height = radius * 2;
  var c = canvas.getContext("2d");

  c.translate(radius,radius);
  this.drawWheel(c,radius,labels);

  this.cachedWheel = canvas;
}

RouletteView.prototype.drawWheel = function(c, radius, labels){

  var label_num = labels.length;

  var label_size = Math.PI * 2 / label_num;
  var label_angle= 0;

  var hue_size  = 360 / label_num;
  var hue_angle = 0;


  c.shadowColor = "transparent";
  c.save();
    for(i in labels){
      var label = labels[i];
      label_angle = label_size * i ;
      hue_angle = (hue_size * i  + hue_size/2) % 360;


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
}

