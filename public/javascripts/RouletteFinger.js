function RouletteFinger(roulette, opts){
  this.roulette = roulette;

  this.center = opts.center || new Vec2(0,0);
  this.radius = opts.radius || 200;

  this.downPoint = null;
  this.upPoint = null;
  this.currentPoint = null;
  this.downTime = null;
}

RouletteFinger.prototype.setEventListener = function(canvas){

  var this_finger = this;

  canvas.addEventListener("pointerdown",function(e){
    //e.preventDefault();
    this_finger.pointerDown(e);
  });

  canvas.addEventListener("pointerup",function(e){
    //e.preventDefault();
    this_finger.pointerUp(e);
  });

  canvas.addEventListener("pointerout",function(e){
    //e.preventDefault();
    this_finger.pointerUp(e);
  });



  canvas.addEventListener("pointermove",function(e){
    //e.preventDefault();
    this_finger.pointerMove(e);
  });
}


RouletteFinger.prototype.pointerDown = function(e){

  var downPoint = new Vec2(e.offsetX, e.offsetY)
                   .sub(this.center).div(this.radius);

  var range = downPoint.getLength();
  //真ん中をクリック
  if(range < 0.2){

    this.roulette.toggleTimer(Date.now());

    return;
  }
  else if(range > 1 ){


    return;
  }

  this.downPoint = downPoint;

  this.downTime = Date.now();

}

RouletteFinger.prototype.pointerMove= function(e){
  if(!this.downPoint){
    return;
  }

  this.currentPoint = new Vec2(e.offsetX, e.offsetY)
                      .sub(this.center).div(this.radius);

  var startAngle = new Angle(this.downPoint.getTheta());
  var endAngle = new Angle(this.currentPoint.getTheta());
  var diffAngle = endAngle.calcDiff(startAngle);
  var now = Date.now();
  var diffTime = (now - this.downTime )/ 1000;
  var impactForce = diffAngle.get() / diffTime;

  this.currentImpact = impactForce;


  e.preventDefault();
}


RouletteFinger.prototype.pointerUp = function(e){

  if(!this.downPoint){
    return;
  }

  this.upPoint = new Vec2(e.offsetX, e.offsetY)
                 .sub(this.center).div(this.radius);

  var startAngle = new Angle(this.downPoint.getTheta());

  var endAngle = new Angle(this.upPoint.getTheta());

  var diffAngle = endAngle.calcDiff(startAngle);

  var now = Date.now();

  var diffTime = (now - this.downTime )/ 1000;

  var impactForce = diffAngle.get() / diffTime;

  if(!isNaN(impactForce) && impactForce != 0){

    //このrouletteは実はRouletteClientなので、
    this.roulette.impact(now, impactForce);
  }


  this.downPoint = null;
  this.upPoint = null;
  this.currentPoint = null;
  this.downTime = null;
}




