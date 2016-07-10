var highScoreState = {

create: function(){
  game.world.setBounds(0,0,1024,768);
  game.stage.backgroundColor = "#000";

  game.time.events.add(5000,function(){game.state.start('startMenu');});
}

};
