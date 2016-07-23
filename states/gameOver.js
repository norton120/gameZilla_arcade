var gameOverState = {

create: function(){
  
  game.world.setBounds(0,0,1024,768);
  game.stage.backgroundColor = "#000";  
  this.over = game.add.text(0,0, "GAME OVER", game.setFont("5rem", "#fefefe"));
  this.over.x = (game.camera.width - this.over.width)/2;
  this.over.y = (game.camera.height - this.over.height)/2;

  // Determine if any players had high scores
  for(x=1;x<4;x++){
    this.highScores = [];	  
    player= game.players['player'+x];
    if(player.points > game.highScores[9].score){
      this.highScores.push({"character":player.displayName,"score":player.points});	    
    }
  }
  
  // Send high score players to the hS input
  if(this.highScores.length > 0){
    game.time.events.add(2000, function(){game.state.start('highScoreEnter', true, false, this.highScores)},this);
  }	  
  else{
    game.time.events.add(2000, function(){game.state.start('load')},this);
  }
}

};
