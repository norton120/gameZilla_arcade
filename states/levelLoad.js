var sideScrollLevelState = {

create: function(){ 

/* Defaults. Override in game level states*/

// platform is the tileSprite to be used as the ground.	
this.platform = 'concrete';
	
this.createExtendBefore();

/*Coin Listener*/
    if(!game.hardwareInterface.coinMode.freePlay){
      game.time.events.loop(500,game.checkForCoins,this);
    }

    this.street = game.add.tileSprite(0,468, 4000, 300, this.platform);
    game.physics.enable(this.street, Phaser.Physics.ARCADE);
    this.street.enableBody = true;
    
/*Action Groups*/
  /* these can be phaser groups or arrays, since phaser
   * only supports a single group per sprite
   */  
    // group for the depth sorting
    this.actors = game.add.group();

/*Players*/
    
    // cycle through players, if active set character
    for(x=1; x<4; x++){
      var player = game.players['player'+x];
      if(player.active){
        this.addPlayerToGame(game,player,player.displayName,100,308+(x*100));            
      }
      else{
        player.hud = new HUDPlaceholder(game, player.displayName, (x-1)*340+10, 25);
      }	      
    }	

/*Baddies*/
  
  this.baddies = [];  

  this.createExtendAfter();
},

update: function(){

this.updateExtendBefore();
/*Setup*/	

    // quick reference variables
    this.activePlayers = this.getActivePlayers();
    this.heros = this.getNestedSprites("hero",this.activePlayers);
    this.playerAvatars = this.getNestedSprites(["hero","avatar"],this.activePlayers);
    this.leftPlayer = this.getPlayerFarthest(this.heros, "left");
    this.rightPlayer = this.getPlayerFarthest(this.heros, "right");

this.bg.tilePosition.x = this.leftPlayer.world.x*(-.1);      
    // normalize the gamepad inputs	  
    game.updateInputKeyStates();	  
    
    // depth sort the players
    this.actors.sort('y',Phaser.Group.SORT_ASCENDING);

/*camera*/
    // always follow the right player
    game.camera.follow(this.rightPlayer);  
    
    // freeze players that venture too far in multi-player mode
    if(this.heros.length > 1){
      this.heros.map(function(p){p.rightFreeze = false; p.leftFreeze = false;});
      game.camera.deadzone = new Phaser.Rectangle(20,20,800,700);
      if(this.rightPlayer.world.x - this.leftPlayer.world.x > 800){
        this.rightPlayer.rightFreeze = true;
	this.leftPlayer.leftFreeze = true;
      }
    }

/*collisions*/
    // collide all characters that are depth sorted
    game.physics.arcade.collide(this.actors);

    // baddy-player basic hit collisions
    for(x=0; x<this.baddies.length; x++){
	baddy = this.baddies[x].avatar;
        if(baddy.exists){	
          game.physics.arcade.overlap(this.playerAvatars,baddy,function(p,b){this.hitPlayer(p.parent,1);},null,this);	      
	}  
    }

    // baddy-weapon collisions
    for(x=0; x<this.baddies.length; x++){
      var baddy = this.baddies[x].avatar;	    
      this.heros.map(function(h){
        game.physics.arcade.overlap(h.primaryWeapon.weaponStore,baddy,function(b,w){h.addPoints(50);w.exists = false;b.parent.hit(1);},null,this);
      });	
    }
    

/*Player Controls and apperance*/
    for(x=1; x<4; x++){
      var player = game.players['player'+x];    
      if(player.active && !player.hero.isHit && !player.isDying){
	player.hero.alpha = player.hero.ghost? .4 : 1;	
 
        // start each pass 0 velocity
        // so hero stops if no keys pressed  	  
        player.hero.body.velocity.x = 0;
        if(!player.hero.jumping){player.hero.body.velocity.y = 0;}

        // fire key
        if(player.controls.firePressed && !player.hero.jumping){player.hero.fire();} 
    
        // jump key
        if(player.controls.jumpPressed && !player.hero.isFiring){player.hero.jump();}	

        // Z-axis cursors
        if(player.controls.downPressed  && (player.controls.rightPressed || player.controls.leftPressed) && !player.hero.jumping && (player.hero.feet() < (this.street.bottom -30))){player.hero.moveDown();}
   
        if(player.controls.upPressed &&(player.controls.rightPressed || player.controls.leftPressed) && !player.hero.jumping && (player.hero.feet() > (this.street.top +30))){player.hero.moveUp();}

        // X-axis cursor keys
        if(player.controls.rightPressed){
	  if(player.hero.jumping){
 	    player.hero.moveRight();	  
	  }
	  else{	  
            player.hero.run('right',player.hero.isFiring, player.hero.rightFreeze);	    
          }	
	}
        else if(player.controls.leftPressed){
	  if(player.hero.jumping){
	    player.hero.moveLeft();	  
	  }
	  else{	  
            player.hero.run('left',player.hero.isFiring, player.hero.leftFreeze);	    
        
	  }
	}  
        else if(!player.hero.jumping && !player.hero.isFiring)
        {
          player.hero.standStill();	    
        }
      }
      else if(player.controls.startPressed && (game.hardwareInterface.coinMode.freePlay || game.coinCredit>0)){
	player.hud.container.destroy();
        this.addPlayerToGame(game,player,player.displayName, this.leftPlayer.world.x, 348); 
	game.coinCredit--;
      }
      // update the top bar HUD's
      player.hud.update();      
    }

/* Trigger baddies and update AI */
  for(b=0;b<this.baddies.length;b++){
    if(this.baddies[b].avatar.exists && ((this.baddies[b].world.x - this.rightPlayer.world.x) < 750)){
      this.baddies[b].active = true;	
    }
    
    if(this.baddies[b].active){this.baddies[b].AI('left',true,this.heros);}    
  }
this.updateExtendAfter();
},
	
// Apply damage to a player, if dead call death, if game over call continue / game over
// @param {object} player the player object to be hit
// @param {integer} damage the damage to apply 	
hitPlayer: function(player,damage){
     
   // hit in the same life
   if(player.health > 0){
     player.hit(1);
   }
   // new life 
   else if(player.lives > 1){
     player.death();
     player.addHealth(5);
   }
   // continue in coin mode
   else if (!game.hardwareInterface.coinMode.freePlay){	   
     this.continue(player);
   }
   // players can re-join other players in free mode multi-player games, but loose all points.
   else if (this.activePlayers.length >1){
     var gameP = game.players['player'+player.gamePad];   
     gameP.hero.kill();
     var oldHudX = gameP.hud.x;
     gameP.hud.container.destroy();
     gameP.hud = new HUDPlaceholder(game, gameP.displayName,oldHudX,10);
     gameP.active = false;
     player.points = 0;
   }
   // free mode solo games cannot be continued
   else{
     this.gameOver(); 
   }
},

// Continue option on coin mode games
continue: function(player){
	//TODO: should have a solo and multi-player solution
},

gameOver: function(){
  game.state.start('gameOver');	
},

//TODO: why are we passing the character? why can't we reference that from the player? 
// Introduces a player to the game
// @param {object} game the game object
// @param {object} player  the player to be added
// @param {string} character the game character for that player
// @param {integer} x the x coordinate to insert the player
// @param {integer} y the y coordinate to insert the player	
addPlayerToGame: function(game,player, character, x, y){
  player.active = true;
  var hudX;	
  switch (character){
    case 'Anthony':
     player.hero = new Anthony(game,x, y);
     game.add.existing(player.hero);
     hudX = 2;
     break;
      
    case 'Matt':
     player.hero = new Matt(game,x,y);
     game.add.existing(player.hero);
     hudX =0;   	
     break;

    case 'Nick':
     player.hero = new Nick(game,x,y);
     game.add.existing(player.hero);
     hudX =1;
     break;
  }
 this.actors.add(player.hero); 
 player.hud = new HUD(game, player.displayName, player.hero, (hudX)*340+10 ,10);
 this.ghostIn(player.hero);
 game.time.events.add(400, function(){player.hero.visible = true;},this); 
},

// That cool effect where a player goes from transparent, to flashing, to solid on game entry.
// @param {object} the object to 'ghost in' 	
ghostIn: function(hero){
  var time = 100;	
  game.time.events.add(1500, function(){game.time.events.repeat(time,15,function(){hero.ghost= !hero.ghost; time=Math.floor(time*.5);},this)},this);
  game.time.events.add(3500, function(){hero.ghost=false;});
},

// returns an array of active players	
getActivePlayers: function(){
  var players = [];
  for(x=1;x<4;x++){
    if(game.players['player'+x].active){players.push(game.players['player'+x]);}	  }	
  return players;   
},

// returns an array of sprites matching the sprite name
// @param {string}|| {array} spriteName the object name of the sprite. if an array, flattened
//      and nested in array order. so top.middle.target would be ["middle","target"]
// @param {array} collection the array to traverse	
getNestedSprites(spriteName, players){
  var result = [];
  for(x=0;x<players.length;x++){
    if(Array.isArray(spriteName)){
      var path= players[x]; 
      for(y=0;y<spriteName.length;y++){
        path = path[spriteName[y]];
      }
      result.push(path);
    }
    else{
      result.push(players[x][spriteName]);  	    
    }
  }
  return result;
},	

// returns the player furthest to the one side of the game screen
// @param {array} players the players to compare
// @param {string} side which side of the screen. Options ["left","right"]	
getPlayerFarthest: function(players, side){
  var farthest = players[0];
  for(x=0; x<players.length;x++){
    if(side == "right"){
      if(players[x].world.x > farthest.world.x){farthest = players[x];}	    
    }
    else{
      if(players[x].world.x < farthest.world.x){farthest = players[x];}	    
    }
  }
  return farthest;  
},

// Inserts a baddy at the location specified
// @param {string} baddy the name of the baddy array to pull from
// @param {integer} x the x coordinate to add the baddy at
// @param {integer} y the y coordinate to add the baddy at
addBaddy: function(baddies, x, y){
  var baddy = (function(){
    for(b=0;b<this[baddies].length;b++){
      if(!this[baddies][b].avatar.exists){
        return this[baddies][b];
      }
    }
  }).bind(this)();  
  baddy.reset(x,y);
  baddy.avatar.exists = true;
},

// when level has been completed
levelComplete: function(){
  this.levelCompleteBefore();
  this.levelCompleteAfter();
},	

/*Extend functions for building levels*/	
createExtendBefore: function(){
},
createExtendAfter: function(){
},
updateExtendBefore: function(){
},
updateExtendAfter: function(){
},
levelCompleteBefore: function(){
},
levelCompleteAfter: function(){
}

};