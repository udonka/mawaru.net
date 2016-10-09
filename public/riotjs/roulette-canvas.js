
riot.tag2('roulette-canvas', '<canvas name="thecanvas"></canvas>', '', '', function(opts) {
    this.roulette = opts.roulette;
    var canvas = this.thecanvas;

    var width  = canvas.width  = 500;
    var height = canvas.height = 300;
    var c      = canvas.getContext("2d");

    var opts = {
      center: new Vec2(width* 0.5, height*  0.5),
      radius: width * 0.5
    };

    var rouletteFinger = new RouletteFinger(roulette, opts);

    var rouletteView = new RouletteView(roulette, rouletteFinger, opts);

    rouletteFinger.setEventListener(canvas);

    canvas.addEventListener("pointerdown",function(e){

      rouletteFinger.pointerDown(e);
    });

    canvas.addEventListener("pointerup",function(e){

      rouletteFinger.pointerUp(e);
    });

    canvas.addEventListener("pointermove",function(e){

      rouletteFinger.pointerMove(e);
    });

    this.impact = function(e){
      var now = Date.now();
      console.log("impact Now :" + now);
      roulette.impact(now, 5);

    }.bind(this)

    function drawFrame(ms_from_opened){

      roulette.calcCurrentAngle(Date.now());

      if(roulette.getVelocity() == 0 && !roulette.isChanged()){

        return;
      }

      c.clearRect(0,0,canvas.width, canvas.width);
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