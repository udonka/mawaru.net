
riot.tag2('labels-textarea', '<textarea class="labels-text" rows="5" cols="40" name="labels_text" onkeyup="{labelsChange}">{joined_labels}</textarea>', '', '', function(opts) {
    this.roulette = opts.roulette;

    this.on("update", function(){
      this.joined_labels = this.roulette.getLabels().join("\n");
    });

    this.labelsChange = function(e){
      var textArea = e.target;

      var labels_string = textArea.value;

      this.roulette.setLabels(labels_string.split("\n"));
    }.bind(this)
});