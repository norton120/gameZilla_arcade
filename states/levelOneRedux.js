var levelOneState = new sideScroller();

levelOneState.createExtendBefore = function(){
  game.bgMusic.stop();	
  game.bgMusic = this.add.audio('booch_theme');
  game.bgMusic.play(null,10);
  game.world.setBounds(0,0,4000,768);
  this.bg = game.add.tileSprite(0,-250,2048,767,'bgCity');
  this.bg.fixedToCamera=true;

}

levelOneState.createExtendAfter = function(){
  this.trolls = [];
  for(x=0;x<20;x++){
    troll = new Troll(game,0,0);
    troll.avatar.exists = false;
    this.actors.add(troll);
    this.trolls.push(troll);
    this.baddies.push(troll); 
  }

/* time to add the bad guys!*/  
  this.addBaddy("trolls",820,448,4);
  this.addBaddy("trolls",1500,490,4)
  this.addBaddy("trolls",1200,399,4);
  this.addBaddy("trolls",1050,600,4);

/* add the exit*/
  this.exitDoor = game.add.sprite(3800,350,'playerBooch');
  
}

levelOneState.updateExtendBefore = function(){		
}

levelOneState.updateExtendAfter = function(){
  
  // player contact with the exit advances to the boss level  
  for(x=0;x<this.heros.length;x++){
    if(this.heros[x].overlap(this.exitDoor)){this.levelComplete();}
  }

  // scroll the far background	  
  if(this.leftPlayer){this.bg.tilePosition.x = this.leftPlayer.world.x*(-.1);}
}

levelOneState.levelCompleteBefore = function(){
  game.state.start('title',true,false,'levelOneBoss');
}

