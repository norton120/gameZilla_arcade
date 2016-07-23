var highScoreEnterState = function(){}

highScoreEnterState.prototype = {

init: function(highScorePlayers){
  this.player = highScorePlayers[0];
  this.name = [" "," "," "," "," "]; 
},

create: function(){
  this.directions = game.add.text(0,50, this.player.name.toUpcase()  + " enter name", game.setFont("1.25rem", "#fefefe"));
  this.directions.x = (game.camera.width - this.directions.width)/2; 
  this.nameDisplay = game.add.group();
  
  // name display
  for(x=0;x<this.name.length;x++){
    var letter = game.add.text(x*30, 0, this.name[x], game.setFont("1.25rem", "#fefefe"));
    this.nameDisplay.add(letter);
  } 

  // keyboard
  this.keyboard = game.add.goup();
  var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
  
  for(x=0;x<keys.length;x++){
    
  }


}
