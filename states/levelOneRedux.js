var levelOneState = {
  create: function(){ 
    

    game.world.setBounds(0,0,4000,768);
    game.stage.backgroundColor = "#7EC0EE";
    
    /*create Platforms*/
    this.street = game.add.tileSprite(0,468, 4000, 300, 'concrete');
    game.physics.enable(this.street, Phaser.Physics.ARCADE);

    this.street.enableBody = true;

    //TODO:replace this shim with actual player selection from the previous state
    game.players.player1.active =true;
    game.players.player1.playerSelected = 'booch';
    
/*Players*/

    // cycle through players, if active set character
    for(x=1; x<4; x++){
      var player = game.players['player'+x];
      if(player.active){
              
        switch (player.playerSelected){
        case 'booch':
          player.hero = new Booch(game,100, 568);
          game.add.existing(player.hero);
        break;
      
        case 'matt':
          player.hero = new Matt(game,100,568);
          game.add.existing(player.hero);
        break;

        case 'nick':
          player.hero = new Matt(game,100,568);
          game.add.existing(player.hero);
        break;

        default:
          alert('hero failed to load');
        break;
        }

	player.hud = new HUD(game, player.playerSelected, player.hero, 10,10);


      }	      

    }	

  },
  update: function(){

    // normalize the gamepad inputs	  
    game.updateInputKeyStates();	  
    
/*Player Controls*/
    for(x=1; x<4; x++){
      if(game.players['player'+x].active){
        var player = game.players['player'+x];	    
      
        // start each pass 0 velocity
        // so hero stops if no keys pressed  	  
        player.hero.body.velocity.x = 0;
        if(!player.hero.jumping){player.hero.body.velocity.y = 0;}

        // fire key
        if(player.controls.firePressed){player.hero.isFiring; player.hero.fire();} 
    
        // jump key
        if(player.controls.jumpPressed){player.hero.jump();}	

        // Z-axis cursors
        if(player.controls.downPressed && !player.hero.jumping && (player.hero.feet() < (this.street.bottom -30))){player.hero.moveDown();}
   
        if(player.controls.upPressed && !player.hero.jumping && (player.hero.feet() > (this.street.top +30))){player.hero.moveUp();}

        // X-axis cursor keys
        if(player.controls.rightPressed){
          player.hero.run('right',player.hero.isFiring);	    
        }
        else if(player.controls.leftPressed){
          player.hero.run('left',player.hero.isFiring);	    
        } 
        else
        {
          player.hero.standStill();	    
        }

        // update HUD
	player.hud.update();
      }      
    }

  }   
	  


};
