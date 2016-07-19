var gameOverState = {

create: function(){
  
  game.world.setBounds(0,0,1024,768);
  game.stage.backgroundColor = "#000";  
  this.over = game.add.text(0,0, "GAME OVER", game.setFont("5rem", "#fefefe"));
  this.over.x = (game.camera.width - this.over.width)/2;
  this.over.y = (game.camera.height - this.over.height)/2;

  for(x=1;x<4;x++){
    game.players['player'+x].active = false; 
  }

  game.time.events.add(2000, function(){game.state.start('load')},this);
}

};
