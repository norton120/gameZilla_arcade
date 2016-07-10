var gameOverState = {

create: function(){
  
  game.world.setBounds(0,0,1024,768);
  game.stage.backgroundColor = "#000";  
  this.over = game.add.text(0,0, "GAME OVER", game.setFont("5rem", "#fefefe"));
  this.over.x = (game.camera.width - this.over.width)/2;
  this.over.y = (game.camera.height - this.over.height)/2;
}

};
