
riot.tag2('label-textboxes', '<ul class="labelTextBoxes"> <li class="labelTextBoxes__item" each="{label,index in labels}"> <div class="labelTextBoxes__grip">=</div> <input class="labelTextBoxes__labelText" type="textbox" value="{label}" onchange="{labelChanged}" onfocus="{labelFocused}" onkeypress="{labelKeyPressed}"> <input class="labelTextBoxes__deleteButton" type="button" value="X" onclick="{labelDeleted}"> </li> </ul>', '', '', function(opts) {
    this.labels =opts.labels;
    this.currentLabelIndex = 0;
    this.onChangeFunc = opts.onchange;

    var this_tag= this;

    this.on("update", function(){
      this.changed(this.labels);

    });

    this.getCurrentLabelIndex = function(){
      return this.currentLabelIndex;
    }.bind(this)

    this.setCurrentLabelIndex = function(index){
      if(typeof index != "number"){
        throw new Error("index must be number");
      }

      if(index < 0 || index >= this.labels.length){
        throw new Error("index outof range");
      }

      this.currentLabelIndex = index;

      return this.currentLabelIndex;
    }.bind(this)

    this.labelKeyPressed = function(e){

      var index = e.item.index;

      if(e.charCode == 13){

        console.log("kaigyo")
        console.log(e)
        this.labels.splice(index+1,0,"");
        console.log(this.labels);

        this.setCurrentLabelIndex(this.getCurrentLabelIndex() + 1);

        return false;

      }
      else{
        return true;
      }

    }.bind(this)

    this.labelChanged = function(e){
      console.log(e);
      var input       = e.target;
      var label_index = e.item.index;
      this.labels[label_index] = input.value;
    }.bind(this)

    this.labelDeleted = function(e){
      var index = e.item.index;
      this.labels.splice(index, 1);

    }.bind(this)

    this.labelFocused = function(e){
      var labelIndex = e.item.index;
      this.setCurrentLabelIndex(labelIndex);
      e.preventUpdate = true;
    }.bind(this)

    this.changed = function(labels){
      if(typeof this.onChangeFunc  =="function"){
        this.onChangeFunc(labels);
      }
      else{
        console.log("there's no callback function");
      }
    }.bind(this)
});