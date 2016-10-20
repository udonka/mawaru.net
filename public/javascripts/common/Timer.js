'use strict';

var isServer = function(){
  return (typeof window == "undefined")
}


class Timer{
  constructor(count_time){

    this.startTime = null;
    this.stopTime = null;
    this.countTime = count_time || 3000; //in ms

    this.state = "standby";
  }

  setCountTime(count_time){
    this.countTime = count_time; //in ms
  }

  currentState(time){

    if(this.startTime === null ||  this.stopTime === null)
    {
      return "standby";
    }

    if(time < this.startTime){
      return "standby";
    }


    if(time >= this.startTime && time < this.stopTime){
      return "counting";
    }
    else if(time >= this.stopTime){
      return "locked";
    }
    else{
      throw new Error("ありえない状況。 startTime: "+this.startTime+", time:"+time+", stopTime:"+this.stopTime)
    }
  }

  leftRate(time){
    return this.leftTime(time)/this.countTime;

  }

  leftTime(time){

    var state = this.currentState(time);

    if(state === "counting"){
      return this.stopTime - time;
    }
    else if(state === "standby"){
      return this.countTime ;
    }
    else{ //state == locked
      return 0;
    }

  }

  leftSec(time){
    return Math.ceil(this.leftTime(time) / 1000);
  }

  start(time, fn){
    if(!time){
      throw new Error("please input current ms time");
    }
    this.startTime = time;
    this.stopTime = time + this.countTime;

    
    var this_timer = this;

    if(fn && typeof fn ==="function"){
      setTimeout(function(){
        fn();
      },this.countTime);
    }

  }

  release(){
    this.startTime = this.stopTime = null;
  }

}


if(isServer()){
  module.exports = Timer;
}
