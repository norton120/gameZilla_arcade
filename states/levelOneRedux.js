var levelOneState = {
  create: function(){ 
    

    game.world.setBounds(0,0,4000,768);
    game.stage.backgroundColor = "#7EC0EE";
    
    /*create Platforms*/
    this.street = game.add.tileSprite(0,468, 4000, 300, 'concrete');
    game.physics.enable(this.street, Phaser.Physics.ARCADE);

    this.street.enableBody = true;

    /* Create our hero */
    switch (game.playerSelected){
      case 'booch':
        this.hero = new Booch(game,100, 568);
        game.add.existing(this.hero);
      break;
      
      case 'matt':
        this.hero = new Matt(game,100,568);
        game.add.existing(this.hero);
      break;

      case 'nick':
        this.hero = new Matt(game,100,568);
        game.add.existing(this.hero);
      break;

      default:
        alert('hero failed to load');
      break;
    } 


  },
  update: function(){

    // normalize the gamepad inputs	  
    game.updateInputKeyStates();	  
    
    // start each pass 0 velocity
    // so hero stops if no keys pressed  	  
    this.hero.body.velocity.x = 0;
    if(!this.hero.jumping){this.hero.body.velocity.y = 0;}

    // fire key
    if(game.players.player1.controls.firePressed){this.hero.isFiring; this.hero.fire();} 
    
    // jump key
    if(game.players.player1.controls.jumpPressed){this.hero.jump();}	

    // Z-axis cursors
    if(game.players.player1.controls.downPressed && !this.hero.jumping && (this.hero.feet() < (this.street.bottom -30))){this.hero.moveDown();}
   
    if(game.players.player1.controls.upPressed && !this.hero.jumping && (this.hero.feet() > (this.street.top +30))){this.hero.moveUp();}

    // X-axis cursor keys
    if(game.players.player1.controls.rightPressed){
      this.hero.run('right',this.hero.isFiring);	    
    }
    else if(game.players.player1.controls.leftPressed){
      this.hero.run('left',this.hero.isFiring);	    
    } 
    else
    {
      this.hero.standStill();	    
    }	    
  }
  
	  
};
