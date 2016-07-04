var levelOneState = {
  create: function(){ 
    

    game.world.setBounds(0,0,4000,768);
    game.stage.backgroundColor = "#7EC0EE";
    
/*Platforms*/
    this.street = game.add.tileSprite(0,468, 4000, 300, 'concrete');
    game.physics.enable(this.street, Phaser.Physics.ARCADE);

    this.street.enableBody = true;

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
      
/*Listeners*/
    if(!game.hardwareInterface.coinMode.freePlay){
      	    
      game.time.events.loop(500,game.checkForCoins,this);
      game.time.events.loop(500,function(){console.log(game.coinCredit)},this);
    }

/*triggers for baddies to drop in*/
  // note: I'm making baddies on the fly, since we need
  // the actors group for depth sorting, and sprites can only
  // be in one group.

    // 2 trolls initially
    this.trolls = [];
    for(x=0;x<2;x++){
      troll = new Troll(game, 750, 400+(x*170));
      this.actors.add(troll);
      this.trolls.push(troll);
    }
  },
  update: function(){
    // create the array of active players
    this.activePlayers =[];
    for(x=1;x<4;x++){
      if(game.players['player'+x].active){
        this.activePlayers.push(game.players['player'+x]);
      }		
    }    
    // normalize the gamepad inputs	  
    game.updateInputKeyStates();	  
    
    // depth sort the players
    this.actors.sort('y',Phaser.Group.SORT_ASCENDING);

/*collisions*/
    // depth sort
    game.physics.arcade.collide(this.actors);
    // create an array of heros for collisions
    this.activePlayerHeros = [];
    for(x=0;x<this.activePlayers.length; x++){
      this.activePlayerHeros.push(this.activePlayers[x].hero.avatar);
    }
    for(x=0;x<this.trolls.length;x++){
      game.physics.arcade.overlap(this.activePlayerHeros, this.trolls[x].avatar,function(h,b){this.hitPlayer(h.parent, 1);},null,this);

    }
    // adjust camera for multiplayers
    (function(){
      var players = [];
      for (x=1;x<4; x++){
 	if(game.players['player'+x].active){players.push(game.players['player'+x]);}      
      }	      

      var heros = [];	    
      // follow player to the right
      for(x=0;x<players.length;x++){
        heros.push(players[x].hero);
      }  
      game.moveCamera(heros);
     
      if(players.length > 1){
	players.map(function(p){p.hero.rightFreeze = false;p.hero.leftFreeze = false;}); 
	// more room before scrolling for play      
        game.camera.deadzone = new Phaser.Rectangle(20,20,800,700);
        // set movement freeze to keep all players inbounds
	game.freezePlayers(heros); 
      }

    })();

    

/*Player Controls and apperance*/
    for(x=1; x<4; x++){
      var player = game.players['player'+x];    
      if(player.active && !player.hero.isHit){
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
        this.addPlayerToGame(game,player,player.displayName, game.camera.target.x, 348); 
	game.coinCredit--;
      }
      // update the top bar HUD's
      player.hud.update();      
    }

/*Baddie AI*/
     this.trolls.map(function(troll){
      var players = [];
      for(x=1;x<3;x++){if(game.players['player'+x].active){players.push(game.players['player'+x].hero);}}	     
      if(troll.exists){ troll.AI('left',true,players);}
     });
  },

insertHero: function(player, x, y){
  player.hero.health = 5;
  player.ghost = true;
  player.exists = true;
  player.reset(x,y);
},  

addPlayerToGame: function(game,player, character, x, y){
  player.active = true;
  var hudX;	
  switch (character){
    case 'Anthony':
     player.hero = new Anthony(game,x, y);
     player.hero.visible = false;
     game.add.existing(player.hero);
     hudX = 2;
     break;
      
    case 'Matt':
     player.hero = new Matt(game,x,y);
     game.add.existing(player.hero);
     hudX =0;   	
     break;

    case 'Nick':
     player.hero = new Matt(game,x,y);
     game.add.existing(player.hero);
     hudX =1;
     break;
  }
 this.actors.add(player.hero); 
 player.hud = new HUD(game, player.displayName, player.hero, (hudX)*340+10 ,10);
 this.ghostIn(player.hero);
 game.time.events.add(400, function(){player.hero.visible = true;},this); 
},
ghostIn: function(hero){
  var time = 100;	
  game.time.events.add(1500, function(){game.time.events.repeat(time,15,function(){hero.ghost= !hero.ghost; time=Math.floor(time*.5);},this)},this);
  game.time.events.add(3500, function(){hero.ghost=false;});
},
hitPlayer: function(player,damage){
 if(!player.ghost){
 player.hit(damage);
 } 
}


};
