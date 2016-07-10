var levelOneState = sideScrollLevelState;

levelOneState.createExtendBefore = function(){
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
  this.addBaddy("trolls",820,448);
  this.addBaddy("trolls",1500,490);
  this.addBaddy("trolls",1200,399);
  this.addBaddy("trolls",1050,600);
}

levelOneState.updateExtendBefore = function(){
}

levelOneState.updateExtendAfter = function(){
}

levelOneState.levelCompleteBefore = function(){
}

levelOneState.levelCompleteAfter = function(){
}
