
riot.tag2('roulette-canvas', '<canvas name="thecanvas"></canvas> <ul> <li each="{this.forceHistory}">time:{this.time} value:{this.value}</li> </ul> <input type="submit" onclick="{replay}" value="再生">', '', '', function(opts) {
    var canvas = this.thecanvas;

    var width  = canvas.width  = 800;
    var height = canvas.height = 800;

    var c = canvas.getContext("2d");

    var roulette = new Roulette(Math.PI);

    var rouletteFinger = new RouletteFinger(roulette, {
      center: new Vec2(width/2, height/2),
      radius: width * 0.9 /2
    });

    var rouletteView = new RouletteView(roulette, rouletteFinger, {

      center: new Vec2(width/2, height/2),
      radius: width * 0.9 /2
    });

    canvas.addEventListener("pointerdown",function(e){
      e.preventDefault();
      rouletteFinger.pointerDown(e);
    });

    canvas.addEventListener("pointerup",function(e){
      e.preventDefault();
      rouletteFinger.pointerUp(e);
    });

    canvas.addEventListener("pointermove",function(e){
      e.preventDefault();
      rouletteFinger.pointerMove(e);
    });

    this.impact = function(e){
      var now = Date.now();
      console.log("impact Now :" + now);
      roulette.impact(now, 5);

      this.forceHistory = roulette.forceHistory;
    }.bind(this)

    function drawFrame(ms_from_opened){

      c.clearRect(0,0,canvas.width, canvas.width);

      roulette.calcCurrentAngle(Date.now());
      rouletteView.draw(c);
    }

    (function animationSettings(){

      (function() {
        var requestAnimationFrame =
          window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.msRequestAnimationFrame;

        window.requestAnimationFrame = requestAnimationFrame;
      }());

      function frame( timestamp ){
        drawFrame( timestamp );
        requestAnimationFrame(frame);
      }

      setTimeout(function(){
        requestAnimationFrame(frame);
      },1000);
    }());
});