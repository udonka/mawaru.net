function RouletteFinger(roulette, opts){
  this.roulette = roulette;

  this.center = opts.center || new Vec2(0,0);
  this.radius = opts.radius || 200;


  this.downPoint = null;
  this.upPoint = null;
  this.currentPoint = null;
  this.downTime = null;

}


RouletteFinger.prototype.pointerDown = function(e){

  this.downPoint = new Vec2(e.offsetX, e.offsetY)
                   .sub(this.center).div(this.radius);

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

  this.roulette.impact(now, impactForce);


  this.downPoint = null;
  this.upPoint = null;
  this.currentPoint = null;
  this.downTime = null;
}




