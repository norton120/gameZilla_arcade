var levelOneBossState = sideScrollLevelState;

levelOneBossState.createExtendBefore = function(){
  game.bgMusic.stop();
  game.bgMusic = this.add.audio('nick_theme');
  game.bgMusic.play(null,10);
  game.world.setBounds(0,0,1024,768);
    
}

levelOneBossState.createExtendAfter = function(){};
levelOneBossState.UpdateExtendBefore = function(){};
levelOneBossState.UpdateExtendAfter = function(){};
levelOneBossState.levelCompleteBefore = function(){};





