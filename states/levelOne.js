var levelOneState = {
	create: function() {

/* set level dimensions and gravity */		
            game.world.setBounds(0,0, 3000, window.innerHeight);
	    game.physics.arcade.gravity.y = 1000;


/*background*/		
	    this.background = game.add.sprite(0,(game.world.height*-.3), 'zla');
	    var backgroundScale = (game.world.height/256)*1.4 ;
	    this.background.scale.setTo(backgroundScale, backgroundScale);

	    /*create physical platforms (ground and ledges)*/
            this.platforms = game.add.group();
	    this.platforms.enableBody = true;

	    var maxPlatformHeight = game.world.height - ((game.world.height - (game.world.height*.9) < 100)? game.world.height - game.world.height*.9 : 100);
	    this.street = this.platforms.create(0,maxPlatformHeight, 'concrete');
	    this.street.scale.setTo(30,1);
	    
	    // make all platforms static and immovable
	    this.platforms.forEach(function(p){
	      p.body.allowGravity = false;
	      p.body.immovable = true;
	    });

            /*create level-specific sounds*/
	    this.music = game.add.audio('black_betty');
	    this.music.play(null, 10);
	   


/*BOOCH*/
	    // Create our hero
	    this.booch = game.add.sprite(100,((window.innerWidth > 768)? game.world.height*.6 :game.world.height*.1),'booch');

	    // camera follows booch
	    game.camera.follow(this.booch);

	    // Add additional needed props to Booch
	    this.booch['direction'] = 'right';	    
	    this.booch['ghostTimer'] = game.time.now + 1000; 
	    this.booch['hitTimer'] = 0;
	    this.booch.health = 5;

	    // give Booch ability to powerup
	    this.booch['powerMoves'] = {'poweredUp':false, 'timer':0, 'buffer':0};
	    this.booch['jump'] = {'jumpTimer':0};
	    
	    // set booch defaults
	    this.booch.frame = 4;
	    game.physics.enable(this.booch, Phaser.Physics.ARCADE);
	    this.booch.body.collideWorldBounds = true;
	    
	    // add booch movements
	    this.booch.animations.add('right_run', [13,14,15],8, true);
	    this.booch.animations.add('left_run', [16,17,18],8,true);
	    this.booch.animations.add('right_shoot',[0,1,2,3],8, true);
	    this.booch.animations.add('left_shoot',[5,6,7,8],8,true);	
	    this.booch.animations.add('powerUp',[10,11,12],10, true);


	    // Create the sprockets that booch throws,
	    // along with the needed vars for timing and fire state
	    this.sprockets = game.add.group();
	    this.sprockets.createMultiple(500,'sprocket',0,false);  
	    this.sprockets['fireRate'] = 300;
	    this.sprockets['nextFire'] = 0;
	    this.sprockets['fire'] = false;
	    this.sprockets['areFiring'] = false;

	    // Create the apex stickers 
	    this.apexStickers = game.add.emitter();
            this.apexStickers.makeParticles('zla_sticker');
            this.apexStickers.minParticleSpeed.setTo(-400, -400);
            this.apexStickers.maxParticleSpeed.setTo(400, 400);
	    this.apexStickers.minParticleScale = 0.5;
	    this.apexStickers.maxParticleScale = 1.5;
            this.apexStickers.gravity = 0;
	    this.apexStickers.bounce = 1;

	    // display booch health bar
	    this.healthBar = game.add.sprite(20,20, 'health_bar',0);
	    this.healthBar.frame = 0; 
	    this.healthBar.fixedToCamera = true;

/*TROLL*/
	    // Create the trolls
	    this.troll = game.add.sprite(500,this.street.body.y -150, 'troll');
	    this.troll.health = 2;
	    this.troll.animations.add('moveLeft', [0,1,2],7, true);
	    this.troll.animations.add('moveRight', [3,4,5],12, true);
	    game.physics.enable(this.troll, Phaser.Physics.ARCADE);
	    this.troll.body.collideWorldBounds = true;
	    this.trolls = game.add.group();
	    
/*ALL_THE_THINGS*/

	    // Create the 'all the things!' guys
	    this.all_the_things = game.add.sprite(1600, this.street.body.y -150, 'all_the_things');
	    this.all_the_things.health = 4;
	    this.all_the_things.animations.add('moveLeft', [0,1],10, true);
	    game.physics.enable(this.all_the_things, Phaser.Physics.ARCADE);
	    this.all_the_things.body.collideWorldBounds = true;
            this.allTheCreeping();
        },

update: function(){

        // Check to see if booch is a ghost, if not full alpha
	if(this.booch.ghostTimer < game.time.now){this.booch.alpha = 1;} 

        // Update the health bar
	this.healthBar.frame = this.booch.health;

        // Keep apexPreditor emulator on booch
        this.apexStickers.x = this.booch.x + (this.booch.width/2); 
        this.apexStickers.y = this.booch.y + (this.booch.height/2);	

/*Collisions*/
	
	game.physics.arcade.collide(this.booch,this.platforms);
	game.physics.arcade.collide(this.troll, this.platforms);
	game.physics.arcade.collide(this.all_the_things, this.platforms);
	
	game.physics.arcade.overlap(this.booch,this.troll, this.baddyTouchesBooch, null, this);
	game.physics.arcade.overlap(this.booch,this.all_the_things, this.baddyTouchesBooch, null, this);

	game.physics.arcade.overlap(this.sprockets,this.troll, this.sprocketTouchesBaddy, null, this); // weaponize the sprocket
	game.physics.arcade.overlap(this.sprockets, this.all_the_things, this.sprocketTouchesBaddy,null, this);
        
	game.physics.arcade.overlap(this.apexStickers, this.all_the_things, this.stickerTouchesBaddy, null, this);
        game.physics.arcade.overlap(this.apexStickers, this.troll, this.stickerTouchesBaddy, null, this);

        this.booch.body.velocity.x = 0;
	    
	    
	    // Fire button
	    if (game.fireKeyPressed || game.fireKey.isDown && this.booch.hitTimer < game.time.now)
	    {

              if(this.booch.powerMoves.poweredUp)
	      {
		this.sprockets.areFiring = false;
		this.booch.powerMoves.buffer = game.time.now + 500;
		this.booch.powerMoves.poweredUp = false;
	        this.booch.powerMoves.timer = 0;	
		this.apexPreditor();
	      }
	      else if(this.booch.powerMoves.buffer < game.time.now)
	      {
		this.sprockets.areFiring = true;
	        this.fire_now();      
	      }
	      
            }
	    

             // Jump button 
	     if (game.jumpKey.isDown || game.jumpKeyPressed && this.booch.hitTimer < game.time.now)
	     {	    
	       if(this.booch.powerMoves.poweredUp)
	       {
		 this.booch.powerMoves.buffer = game.time.now + 500;
	         this.booch.powerMoves.poweredUp = false;
	         this.booch.powerMoves.timer = 0;
		 this.juggernaut();
	       }
	       else if(this.booch.powerMoves.buffer < game.time.now && this.booch.body.touching.down && game.time.now > this.booch.jump.jumpTimer)
               {
		game.boochJumpSound.play();       
		this.booch.body.velocity.y = -500;
	        this.booch.jump.jumpTimer = game.time.now + 750;
	       }
	     }
	     
	     //Cursor arrows
	     game.cursors.down.onUp.add(function(){this.booch.powerMoves.timer = 0; this.booch.powerMoves.poweredUp = false;});	  
	     game.cursors.down.onDown.add(function()
	     {
	       this.booch.animations.stop();
	       this.booch.powerMoves.timer = game.time.now + 1000
	     });

	    // If booch is hit, kick him away from the direction he was going and make him wince. 
	    if(this.booch.hitTimer > game.time.now)
	    {
	       this.booch.body.velocity.x = (this.booch.direction == 'left'? 40: -40);
	       this.booch.frame = 19;
	    }	    
	    else if(game.cursors.down.isDown)   
            {
	       if(this.booch.powerMoves.timer != 0 && game.time.now > this.booch.powerMoves.timer)
	       {
		     this.booch.animations.play('powerUp');
		     this.booch.powerMoves.poweredUp = true;
	       }
	       else{ 
	        this.booch.frame = 9;
	       }  
            }
	    else if (game.cursors.right.isDown)
	    {
	      this.booch.animations.play(this.sprockets.areFiring? 'right_shoot' : 'right_run');
	      this.booch.body.velocity.x = 150;
              this.booch.direction = 'right';
	    }
	    else if (game.cursors.left.isDown)
	    {
              this.booch.animations.play(this.sprockets.areFiring? 'left_shoot' : 'left_run');
	      this.booch.body.velocity.x = -150;
	      this.booch.direction = 'left';
	    }
	    else
            {
              this.booch.animations.stop();
	      if(this.sprockets.areFiring){
	         this.booch.frame = (this.booch.direction == 'left')? 5:0;
	      }
	      else
	      { 
	      this.booch.frame = 4;
	      }
	    }
        

/*Baddies*/

	// Trolls! 
	if(this.troll.body.x >  this.booch.body.x)
	{
	  this.troll.body.velocity.x = -80;
	  this.troll.animations.play('moveLeft');
	}
	else
	{	
	 
	  this.troll.body.velocity.x =80;
   	  this.troll.animations.play('moveRight');	  
	}
	
},
       // 'all the things!' guy creeps, and spits all the things.
        allTheCreeping : function(){
	    this.all_the_things.animations.play('moveLeft');
	    this.all_the_things.body.velocity.x = -200;
	    setTimeout(function(){this.all_the_things.body.velocity.x = 0; this.all_the_things.animations.stop(); this.all_the_things.frame = 2;}, 1500, setTimeout(function(){this.allTheCreeping()}, 2500)) ;
	},	    



	// Booch can power leap. 
juggernaut: function() {
	  game.boochJuggernautSound.play();
	  this.booch.body.velocity.y = -1400;
	},
        
	// Booch makes it rain (deadly) ZLA stickers on the bad guys. 
apexPreditor: function(){
	  game.boochApexPreditorSound.play();

	  this.apexStickers.start(false, 3000, 20, 105);
	},	

		
        // Booch throws sprockets 
fire_now: function() {
          if (game.time.now > this.sprockets.nextFire)
	  {
            this.sprockets.nextFire = game.time.now + this.sprockets.fireRate;
            var sprocket = this.sprockets.getFirstExists(false);

	    if (sprocket)
	    {
              sprocket.exists = true;
              game.boochShootSound.play();
              sprocket.lifespan = 2500; 

	      if(this.booch.direction == 'left')
	      { 
                sprocket.reset(this.booch.x -25, (Math.floor(this.booch.y + this.booch.height / 2) - Math.floor(sprocket.height / 2) ));
                game.physics.enable(sprocket, Phaser.Physics.ARCADE);
                sprocket.body.allowGravity = false;
                sprocket.body.velocity.x = -500;
              }
              else
	      {
                sprocket.reset(this.booch.x +95, (Math.floor(this.booch.y + this.booch.height / 2) - Math.floor(sprocket.height / 2) ));
	        game.physics.enable(sprocket, Phaser.Physics.ARCADE);
                sprocket.body.allowGravity = false;
		sprocket.body.velocity.x = 500;
	      }
	      
	      sprocket.body.setCircle(10);
	    }
	  }
        },
/*Collision functions*/

baddyTouchesBooch: function(booch, baddy)
      {
	  if(booch.ghostTimer < game.time.now)
	  {    	  
	    this.hey.play();
	    booch.damage(1);
            booch.alpha = .4;
            booch.ghostTimer = game.time.now + 1000;	    
	    booch.hitTimer = game.time.now + 400;
	  }
 
      },	       

sprocketTouchesBaddy: function(baddy, sprocket)
      {
      	  sprocket.destroy();  
	  baddy.damage(1);
      },
      
stickerTouchesBaddy: function(baddy, sticker)
      {
	  sticker.destroy();
	  baddy.damage(2);
      }	  

};
