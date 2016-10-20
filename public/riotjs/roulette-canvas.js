
riot.tag2('roulette-canvas', '<canvas name="thecanvas"></canvas>', '', '', function(opts) {
    this.roulette = opts.roulette;
    var canvas = this.thecanvas;

    var c = canvas.getContext("2d");

    this.on("mount",function(){
      var parent = this.root.parentNode;

      var parentWidth = parent.offsetWidth;
      var windowHeight = window.innerHeight;

      var width = Math.min(windowHeight - 100, parentWidth);
      var height= width;

      canvas.width  = width ;
      canvas.height = height ;

      var opts = {
        center: new Vec2(width* 0.5, height*  0.5),
        radius: width * 0.48
      };

      this.rouletteFinger = new RouletteFinger(roulette, opts);

      this.rouletteView = new RouletteView(roulette, this.rouletteFinger, opts);

      this.rouletteFinger.setEventListener(canvas);

      this.roulette.serverConnected().then(function(){
        console.log("server connected");
        animationSettings();
      });

    });

    this.impact = function(e){
      var now = Date.now();
      console.log("impact Now :" + now);
      this.roulette.impact(now, 5);

    }.bind(this)

    this_tag = this;

    function drawFrame(ms_from_opened){

      var roulette = this_tag.roulette;

      roulette.calcCurrentAngleWithBack(Date.now());

      if(!this_tag.rouletteView.haveToDraw()){

        return;
      }

      c.clearRect(0,0,canvas.width, canvas.width);
      this_tag.rouletteView.draw(c);
    }

    function animationSettings(){

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
      },0);
    }
});