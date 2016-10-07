
riot.tag2('roulette-canvas', '<canvas name="thecanvas" onclick="{impact}"></canvas>', '', '', function(opts) {
    var canvas = this.thecanvas;

    canvas.width = 800;
    canvas.height = 800;

    var c = canvas.getContext("2d");

    var roulette = new RouletteView(Math.PI);

    var toggle = 1;
    this.impact = function(e){
      toggle = -toggle;
      roulette.impact(Date.now(), toggle * 10);
    }.bind(this)

    function drawFrame(ms_from_opened){

      c.clearRect(0,0,canvas.width, canvas.width);

      roulette.calcCurrentAngle(Date.now());
      roulette.draw(c);
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