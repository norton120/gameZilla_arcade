var highScoreState = {

create: function(){
  game.world.setBounds(0,0,1024,768);
  game.stage.backgroundColor = "#000";
  this.hsTitle = game.add.text(0,100, "HIGH SCORES", game.setFont("2rem","#fefefe"));
  this.hsTitle.x = (game.camera.width - this.hsTitle.width)/2;
  
  // print the scores
  for(x=0;x<game.highScores.length;x++){
    var score = game.highScores[x];	  
    game.add.text(335, 200 + (50*x), score.name, game.setFont("1.5rem","#fefefe"));
    game.add.text(600, 200 + (50*x), score.score, game.setFont("1.5rem", "#fefefe"));    
  }
  game.time.events.add(5000,function(){game.state.start('startMenu');});
}

};
