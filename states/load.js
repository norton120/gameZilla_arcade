
var loadState = {

 preload: function(){

        /* load the game config variables into the game */
/* this read from a bash interface to a coin machine in RL. Here we just ghetto the vars 'cus I don't have time to fix it.
	var loadHardwareInterface = new XMLHttpRequest();
	loadHardwareInterface.onreadystatechange = function()
	{
 	  if (loadHardwareInterface.readyState == 4 && loadHardwareInterface.status == 200){
	    game.hardwareInterface = JSON.parse(loadHardwareInterface.responseText);
          }
        }
	loadHardwareInterface.open("GET",'usr/lib/cgi-bin/game_config',true);
	loadHardwareInterface.send();
*/
    game.hardwareInterface ={};
    game.hardwareInterface.coinMode = {} 
    game.hardwareInterface.coinMode.freePlay = true;
    game.hardwareInterface.quietMode = false;
	game.coinCredit= 0;

	/*load the high scores*/
	var loadHighScores = new XMLHttpRequest();
	loadHighScores.onreadystatechange = function()
	{
	  if(loadHighScores.readyState == 4 && loadHighScores.status == 200){
	    var highScores = JSON.parse(loadHighScores.responseText);
   	    game.highScores = highScores.highScores;	    
	  }
	}
	loadHighScores.open("GET",'high_scores.json',true);
	loadHighScores.send();

	/* polling function to collect coin balance as they are inserted */	
	game.checkForCoins = function(){
	
	  var poll = new XMLHttpRequest();
	  poll.onreadystatechange = function()
	  {
 	    if (poll.readyState == 4 && poll.status == 200){
	      if(JSON.parse(poll.responseText).coinDropped){game.coinCredit++;}
            }
          }
	  poll.open("GET",'/cgi-bin/capture_coins',true);
	  poll.send();
        }
	
	// attempt to start the gamepad(s) 
	game.input.gamepad.start();
        
	// before loading, add the 'loading' text
	
/*LOAD ASSETS*/


/*sound effects*/	
	    game.load.audio('jump','assets/sounds/jump.mp3');
	    game.load.audio('blade','assets/sounds/blade.mp3');
	    game.load.audio('booch_theme','assets/sounds/booch_theme.wav');
	    game.load.audio('menu','assets/sounds/MKup.mp3');
	    game.load.audio('hey', 'assets/audio/HEY.wav');
	    game.load.audio('nickHit','assets/audio/nickHit.mp3');
	    game.load.audio('typeWriter','assets/sounds/type.mp3');
	    game.load.audio('laptopWack','assets/audio/laptopWack.wav');
	    game.load.audio('mattHit','assets/audio/mattHit.mp3');
	    game.load.audio('lazer','assets/audio/lazer.wav');
	    
/*sprites*/
	    game.load.image('blackFill', 'assets/images/black.png');
	   
	    game.load.image('playerBooch', 'assets/images/player_select_booch.png');
	    game.load.image('playerNick', 'assets/images/player_select_nick.png');
	    game.load.image('playerMatt', 'assets/images/player_select_matt.png');
	    game.load.image('storyPartners', 'assets/images/story_partners.png');
	    game.load.image('diamondPlate', 'assets/images/diamond_plate.png');
	    game.load.image('zla','assets/images/longstreet.gif');
	    game.load.image('revzillaLogo', 'assets/images/revzilla_logo.png');
	    game.load.image('zla_sticker', 'assets/images/zla.png');

	    game.load.image('concrete','assets/images/concrete.png',400,600);
	    game.load.image('x_button','assets/images/x_button.png',75,75);
	    game.load.image('z_button','assets/images/z_button.png',75,75);
	    game.load.image('shadow','assets/images/shadow.png');
	    game.load.image('cursor_button','assets/images/cursor_button.png',58,58);
	    game.load.image('keyboardCat', 'assets/images/keyboardCat.png');

	    game.load.spritesheet('sprocket','assets/images/gear.png',60,60);
	    game.load.spritesheet('health_bar', 'assets/images/health_bar.png',123.8,25);
	    game.load.spritesheet('troll', 'assets/images/troll_sprite.png',95.5,119);
	    game.load.spritesheet('all_the_things', 'assets/images/all_the_things.png', 129, 120);
	
	    game.load.image('fgCity','assets/images/38JacksonForeground.png');
	    game.load.image('bgCity', 'assets/images/bgCity.png');
	    game.load.atlasJSONHash('booch','assets/images/textureAtlas/booch.png','assets/images/textureAtlas/booch.json');
            game.load.atlasJSONHash('nick','assets/images/textureAtlas/nick.png','assets/images/textureAtlas/nick.json');
	},

 create: function(){
   // load the Phaser world physics, create the world space, set world constants	
   game.physics.startSystem(Phaser.Physics.ARCADE);
   game.time.desiredFps = 30;

/*PLAYERS*/
	
	// Create the game player containers
	game.players = [];
  	for(x=1; x < 4; x++){
            game.players['player'+x] = {};
	}	

	// name them
	game.players.player1.displayName = 'Matt';
	game.players.player2.displayName = 'Nick';
	game.players.player3.displayName = 'Anthony';

/*CONTROLS*/


	// detect if the gamepad was able to connect and is supported and active
	game.padConnected = game.input.gamepad.supported && game.input.gamepad.active && (game.input.gamepad.pad1.connected || game.input.gamepad.pad2.connected || game.input.gamepad.pad3.connected);
        
	// normalized player input values
	for(x=1; x<4; x++){
	  var player = game.players['player'+x];	
	  player.active = false;	
	  player.health = 5;
	  player.lives = 3;
	  player.points = 0;
	  player.continueTimer = 0;
	  player.hero ={};
	  player.controls = {};    
	  player.controls.rightPressed = false;
	  player.controls.leftPressed = false;
	  player.controls.upPressed = false;
	  player.controls.downPressed = false;
	  player.controls.jumpPressed = false;
	  player.controls.firePressed = false;
	  player.controls.specialPressed = false;
	  player.controls.startPressed = false;
	}

        // default keyboard controls - always available
	game.cursors = game.input.keyboard.createCursorKeys();
	game.jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
	game.fireKey = game.input.keyboard.addKey(Phaser.Keyboard.X);
	game.specialKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
	game.debugKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
	game.p1StartKey = game.input.keyboard.addKey(Phaser.Keyboard.M);
	game.p2StartKey = game.input.keyboard.addKey(Phaser.Keyboard.N);
	game.p3StartKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
	   
	   
	   
	
	game.updateInputKeyStates = function(){
	  
	  // if gamepad detected, listen for gamepad input
	  if(game.padConnected)
	  {
	    for(x=1; x<5; x++){	  
	      if(game.input.gamepad['pad'+x].connected){	    
	        var player = game.players['player'+x];
	        var pad = 'pad'+x;
	        player.controls.leftPressed = (game.input.gamepad[pad]._rawPad.axes[0] == -1);  	  
	        player.controls.rightPressed = (game.input.gamepad[pad]._rawPad.axes[0] == 1);  	  
	        player.controls.upPressed = (game.input.gamepad[pad]._rawPad.axes[1] == -1);  	  
	        player.controls.downPressed = (game.input.gamepad[pad]._rawPad.axes[1] == 1);  	  
	        player.controls.firePressed = (game.input.gamepad[pad]._rawPad.buttons[1].pressed);
	        player.controls.jumpPressed = (game.input.gamepad[pad]._rawPad.buttons[2].pressed);
	        player.controls.specialPressed = (game.input.gamepad[pad]._rawPad.buttons[3].pressed);
	    	player.controls.startPressed = (game.input.gamepad[pad]._rawPad.buttons[4].pressed);
	      }
	    }
	  }  
	  else
	  {
	    var testPlayer = "player3";
	    game.players[testPlayer].controls.leftPressed = (game.cursors.left.isDown);
  	    game.players[testPlayer].controls.rightPressed = (game.cursors.right.isDown);
	    game.players[testPlayer].controls.upPressed = (game.cursors.up.isDown);
  	    game.players[testPlayer].controls.downPressed = (game.cursors.down.isDown);
	    game.players[testPlayer].controls.firePressed = (game.fireKey.isDown);
	    game.players[testPlayer].controls.jumpPressed = (game.jumpKey.isDown);	 
	    game.players[testPlayer].controls.debugPressed = (game.debugKey.isDown);

 	    // add fake start keys for the 3 players
	    game.players.player1.controls.startPressed = (game.p1StartKey.isDown);
	    game.players.player2.controls.startPressed = (game.p2StartKey.isDown);
	    game.players.player3.controls.startPressed = (game.p3StartKey.isDown);
	    
	  }
	};	

/*Game Utilites */
	

	// global font setter 
	game.setFont = function(size,color){
	  return({font: size+' Press Start 2P',fill: color});
	}

/************************************************************************************************************************	
 *															*
 *															*
 *                                                  CHARACTER PROTOTYPES 						*
 *                                                  									*
 *															*
 ************************************************************************************************************************/	

/* Asset Prototypes */

/*Weapon base prototype*/
  Weapon = function(game,origin,sprite){
    this.weaponStore = game.add.group();
    this.weaponStore.createMultiple(200,sprite,0,false);
    game.physics.enable(this.weaponStore,Phaser.Physics.ARCADE); 
    this.nextFire = 0;
    this.fireRate = 200;
    this.projectileSpeed = 500;
    this.projectileLifespan = 2500;
    this.fire = function(direction){
      if(this.nextFire < game.time.time){
	var projectile = this.weaponStore.getFirstExists(false); 
	projectile.reset(((direction == 'left')? origin.world.x - 50 : origin.world.x + origin.width), origin.world.y + (origin.height /2.5));
	projectile.exists = true;
	projectile.animations.add('spin',null,10,true);
	projectile.animations.play('spin');
	// oversize the hitbox so it's less of a 'thread the needle' to hit bad guys
	projectile.body.setSize(projectile.width,projectile.height+20,0,0);	
	projectile.lifeSpan = this.projectileLifespan;
	projectile.body.velocity.x = (direction == 'left')? (this.projectileSpeed * -1):this.projectileSpeed;
	this.nextFire = game.time.time + this.fireRate;	
      }  
    }
    return this;
  } 

/*HUD prototype*/
  // @param {object} game the game object
  // @param {string} name the display name of the player
  // @param {object} player the player parent object
  // @param {integer} x the x coordiate to insert the HUD at
  // @param {integer} y the y coordiate to insert the HUD at
  // @param {string} state the state of the HUD
  HUD = function(game, name, player, x, y, state){
    this.container = game.add.sprite(x,y);
    this.container.fixedToCamera = true;
    this.flashing = false;
    this.flashTimer = 0;
    this.state =  "";

    this.makeActive =function(){	
      this.state = "active";	   
      this.flashing = false; 

      this.container.removeChildren();
      this.health = game.add.sprite(10,30,'health_bar',player.health);
      this.name = game.add.text(12,10, name.toUpperCase(), {font:'1rem Press Start 2P', fill: '#db4605'});
      this.lives = game.add.text(this.name.width+10,10, " X"+player.lives, {font:'1.25rem Press Start 2P', fill:"#db4605"});
      this.score = game.add.text(12,60, this.scoreText(player.points), {font:'1rem Press Start 2P', fill:"#db4605"});
       this.container.addChild(this.health);
       this.container.addChild(this.score);
       this.container.addChild(this.lives);
       this.container.addChild(this.name);
    }	

    this.makeInactive = function(){
      this.state = "inactive";	    
      this.container.removeChildren();
      this.name = game.add.text(12,10, name.toUpperCase(), game.setFont('1rem','#db4605'));
      var message = game.hardwareInterface.coinMode.freePlay? " PRESS START":(game.coinCredit > 0? " PRESS START":" INSERT COIN");
      this.message = game.add.text(0,30,message, game.setFont('1rem','#db4605'));
      this.container.addChild(this.name);
      this.container.addChild(this.message);
    }
    
    this.makeContinue = function(){
      this.state = "continue";
      this.flashing = true;
      this.container.removeChildren();
      this.name = game.add.text(12,10, name.toUpperCase(), game.setFont('1rem','#db4605'));      
      var message = game.coinCredit > 0? "PRESS START":"INSERT COIN :"+player.continueTimer;	
      this.message = game.add.text(0,20, message, game.setFont('1rem',"#db4605"));
      this.container.addChild(this.name);
      this.container.addChild(this.message);
    }
    
    // formats the score with leading zeros
    // @param {integer} score the score to format
    this.scoreText = function(score){
      var result = "00000000"+score;
      return result.substr(result.length-8);
    }

      
    switch(state){
      case "active":
        this.makeActive();
      break;
      case "continue":
        this.makeContinue();
      break;
      case "inactive":
        this.makeInactive();
      break;
    }

    this.update = function(){
      if(this.flashing){
        if(game.time.time > this.flashTimer){
          this.container.alpha = this.container.alpha == 0? 1:0;
	  this.flashTimer = game.time.time +500;
	}  
      }
      else{
        this.container.alpha =1;
      }	

      switch(this.state){
        case "active":
          this.health.frame = player.health;
          this.lives.setText(" X"+player.lives);
          this.score.setText(this.scoreText(player.points));
	break;
        
        case "continue":
	  this.message.setText((game.coinCredit > 0)? "PRESS START" : "INSERT COIN :"+(player.continueTimer< 10? "0"+player.continueTimer : player.continueTimer));
        break;
        
        case "inactive":
	  if(!game.hardwareInterface.coinMode.freePlay){
	    this.flashing = game.coinCredit > 0;
    	    this.message.setText((game.coinCredit > 0)? "PRESS START":"INSERT COIN");	    
          }
        break;
      }	
    } 
    

    return this;   
  }

/*Hero base prototype*/
  // @param {obj} game the game object
  // @param {int} x the starting x coordinate of the sprite
  // @param {int} y the starting y coordinate of the sprite
  // @param {string} spriteSheet the name of a loaded sprite sheet
  // @param {int} gamePad the global player associated with this hero
  // @param {float} speed, relitive to Anthony. 1 is full speed, 0 stopped.  
  Hero = function(game, x, y, spriteSheet, gamePad, speed){
    Phaser.Sprite.call(this, game, x, y);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
    this.shadow = game.add.sprite(30,125, 'shadow');
    this.addChild(this.shadow);
    this.shadow.scale.setTo(.5,.5);
    this.shadow.visible = false;
    this.avatar = game.add.sprite(0,0, spriteSheet);
    this.addChild(this.avatar);
    game.physics.enable(this.avatar, Phaser.Physics.ARCADE);
    // make the bounding box much smaller for the 2.5D
    this.avatar.body.setSize(this.avatar.width,20,0,this.avatar.height-20);
    // Base props
    this.gamePad = gamePad;
    
    // Reference the parent player object
    this.parentPlayer = game.players['player'+this.gamePad];
    
    this.isDying = false;
    this.ghost = true;
    this.isFiring = false;
    this.actionSpeed = 170*speed;
    this.direction = 'right';
    this.jumping = false;
    this.leftFreeze = false;
    this.rightFreeze = false;
    this.isHitTimer = 0;
    this.pacedFire = 0;
    this.isFiringTimer = 0;
    this.hitSound = 'hey';
    this.jumpSound = 'jump';
    this.fireSound = 'blade';

    this.SFX = {};
    this.SFX.hit = game.add.audio(this.hitSound);
    this.SFX.jump = game.add.audio(this.jumpSound);
    this.SFX.fire = game.add.audio(this.fireSound);

    // Calculated Props
    this.feet = function(){return(this.avatar.world.y + this.avatar.height);}

    // animations
    this.avatar.animations.add('jumpStartRight', Phaser.Animation.generateFrameNames('jump_right_', 1,2), 16, false);
    this.avatar.animations.add('jumpLandRight', Phaser.Animation.generateFrameNames('land_right_', 1,5), 18, false);
    this.avatar.animations.add('jumpStartLeft', Phaser.Animation.generateFrameNames('jump_left_', 1,2), 16, false);
    this.avatar.animations.add('jumpLandLeft', Phaser.Animation.generateFrameNames('land_left_', 1,5), 18, false);
    
    // keep a reference to these, since they need callbacks
    var runRight = this.avatar.animations.add('runRight', Phaser.Animation.generateFrameNames('run_right_', 1,8), 12, true);
    var runLeft = this.avatar.animations.add('runLeft', Phaser.Animation.generateFrameNames('run_left_', 1,8), 12, true);
    var runShootRight = this.avatar.animations.add('runShootRight', Phaser.Animation.generateFrameNames('run_shoot_right_',1,8),12, true);
    var runShootLeft = this.avatar.animations.add('runShootLeft', Phaser.Animation.generateFrameNames('run_shoot_left_',1,8),12, true);
    var dieRight = this.avatar.animations.add('deathRight', Phaser.Animation.generateFrameNames('death_right_',1,6),8, false);
    var dieLeft = this.avatar.animations.add('deathLeft', Phaser.Animation.generateFrameNames('death_left_',1,6),8,false);
    var fireLeft = this.avatar.animations.add('fireLeft', Phaser.Animation.generateFrameNames('fire_left_',1,4),18,false);
    var fireRight = this.avatar.animations.add('fireRight', Phaser.Animation.generateFrameNames('fire_right_',1,4),18,false);
  
    // actions

    this.run =function(direction, shooting, frozen){
      try {
      if(shooting){this.pacedFire = game.time.time + 400;}
      var firing = shooting || this.pacedFire > game.time.time; 		
      this.direction = direction;
      var animation = 'run'+(firing? "Shoot":"")+this.direction.charAt(0).toUpperCase() + this.direction.slice(1);
  if(!this.avatar.animations.currentAnim.isPlaying || animation != this.avatar.animations.currentAnim.name){
     this.avatar.animations.play(animation);	
  }
      if(!frozen){this.body.velocity.x = (direction == 'right'? this.actionSpeed : this.actionSpeed*-1);}
      if(shooting){this.isFiring = true; this.primaryWeapon.fire(this.direction); this.isFiring = false;}
      }
      catch(e){ }
    }
    
    this.moveDown = function(){
      this.body.velocity.y = 100;
    }

    this.moveUp = function(){
      this.body.velocity.y = -100;
    }

    this.moveLeft = function(){
      if(!this.leftFreeze){	    
        this.body.velocity.x = this.actionSpeed * -1;
        this.direction = 'left';
      }      
    }

    this.moveRight = function(){
      if(!this.rightFreeze){
        this.body.velocity.x = this.actionSpeed;
        this.direction = 'right';
      }
    }

    this.jump = function(){
      try{
      if(!this.jumping){      
	var dir = this.direction.charAt(0).toUpperCase() + this.direction.slice(1);      
	this.avatar.animations.play('jumpStart'+dir); 
	this.SFX.jump.play();     
	this.jumping = true;
	start = this.avatar.body.y;   
        this.shadow.visible = true;
	
	jUp = game.add.tween(this.avatar.body).to({y: (this.avatar.body.y -155)}, 105, Phaser.Easing.Linear.In);
	jDown = game.add.tween(this.avatar.body).to({y: start}, 135, Phaser.Easing.Linear.Out);

	game.time.events.add(850, function(){this.jumping = false;}, this);
	game.time.events.add(550, function(){this.shadow.visible = false;},this);
        game.time.events.add(450, function(){this.avatar.animations.play('jumpLand'+dir);},this);
	resetStart = function(){this.avatar.body.y= start;}

	jDown.onComplete.add(resetStart, this);
	
	jUp.chain(jDown).start();
        this.isFiring = false;
      }
      }catch(e){}
    }

    this.standStill = function(){
      this.avatar.animations.stop();
      this.avatar.frameName = this.direction == 'right'? "stand_right": "stand_left";
    }

    this.fire = function(){
      if(!this.isFiring){	    
	this.isFiring = true;	    
        var anim = this.direction == 'right'? fireRight:fireLeft;
	anim.play();
	this.SFX.fire.play();
        anim.onComplete.add(function(){this.primaryWeapon.fire(this.direction); this.isFiring = false;},this);
      }
    }

    this.hit = function(damage){
      try{
      this.ghost = true;
      this.avatar.animations.stop();	    
      game.time.events.add(2000,function(){this.ghost =false;},this);
      this.isHitTimer = game.time.time +400;	
      this.avatar.frameName = "land_"+this.direction+"_5";
      this.SFX.hit.play();
      var damage = damage || 1;
      this.body.velocity.x = this.direction == "right"? -150:150; 
      this.parentPlayer.health = (this.parentPlayer.health-damage > -1)? this.parentPlayer.health-damage: 0;
      // if a collision stops the fire or jump animations, players get 'stuck'
      // this will unstick them.
      this.isFiring = false;
      this.jumping = false;
      }catch(e){}
    }

    this.death = function(){
      try{
      this.isDying =true;
      var anim = (this.direction == "right")? dieRight: dieLeft;
      this.avatar.body.velocity.x=0;
      this.avatar.body.velocity.y=0;
      anim.play();
      this.parentPlayer.lives = (this.parentPlayer.lives-1 >0)? this.parentPlayer.lives-1 : 0;	 
      anim.onComplete.add(function(){game.time.events.add(1000,function(){
	  this.avatar.visible = false;    
          this.reset(game.camera.x+300, 450);
	  this.avatar.visible = true;
	  this.isDying = false;    
	  this.ghost = true;    
	  game.time.events.add(1000,function(){this.ghost = false;},this);
        },this);	
      },this);
      }catch(e){}	 
    }

    this.addHealth = function(points){
      this.parentPlayer.health = (this.parentPlayer.health+points < 6)? this.parentPlayer.health+points : 5;
    }
    this.addPoints = function(points){
      this.parentPlayer.points += points;
    }

    // weapons
    this.primaryWeapon = new Weapon(game,this.avatar,'sprocket'); 

  }
  Hero.prototype = Object.create(Phaser.Sprite.prototype);
  Hero.prototype.constructor = Hero;



/* Baddy prototype */

  // @param {obj} game the game object
  // @param {int} x the starting x coordinate of the sprite
  // @param {int} y the starting y coordinate of the sprite
  // @param {string} spriteSheet the name of a loaded sprite sheet
  Baddy = function(game, x,y,spriteSheet){
    var honeOn = honeOn || []; 
    Phaser.Sprite.call(this,game,x,y);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.checkWorldBounds =true;
    this.body.outOfBoundsKill = true;
    this.avatar = game.add.sprite(0,0,spriteSheet);
    this.addChild(this.avatar);
    game.physics.enable(this.avatar, Phaser.Physics.ARCADE);
    this.avatar.body.setSize(this.avatar.width,20,0,this.avatar.height-20);

    this.speed = 100;
    this.active = false;
    this.isHitTimer = 0;
    this.health = 1;

    // a very basic AI. Override this at the
    // extended baddy level to match the character.
    // @param {string} direction the default direction of travel
    // @param {boolean} honing determines if the baddy should move toward players
    // @param {array} honeOn an array of player objects to move toward
    this.AI = function(direction, honing,honeOn){
      this.avatar.body.velocity.x = 0;
      this.avatar.body.velocity.y = 0;      
      if(this.active){	    

        if(honing && honeOn.length > 0){
          var target = honeOn[0];
          for(a=0;a<honeOn.length;a++){
	    var dist = (this.avatar.world.x - target.world.x)+(this.avatar.world.y - target.world.y);
	    var nDist = (this.avatar.world.x - honeOn[a].world.x) +(this.avatar.world.y - honeOn[a].world.y);
	    if(nDist < dist){
	      target = honeOn[a];
	    }
	  }  
	  this.avatar.body.velocity.x = (target.world.x > this.avatar.world.x? this.speed : this.speed*-1);
	  this.avatar.body.velocity.y = (target.world.y > this.avatar.world.y?this.speed : this.speed*-1);
        }
        else{
	  this.avatar.body.velocity.y = 0;	
          this.avatar.body.velocity.x = direction == 'right'? this.speed : this.speed*-1;	      
	}	
      }	
    }
 

    this.stopHoning = function(){
      this.avatar.body.velocity.x =0;
      this.avatar.body.velocity.y = 0;
    }

    this.hit = function(damage){
      if(this.isHitTimer < game.time.time){
	this.health -=damage;      
        if(this.health < 1){this.avatar.exists = false;}
	this.isHitTimer = game.time.time + 100;
      }	
    }    
  }
  Baddy.prototype = Object.create(Phaser.Sprite.prototype);
  Baddy.prototype.constructor = Baddy;

	/* extended prototypes*/
  	  
	  


	  // Heros
		/*Booch*/  
		  Anthony = function(game, x, y){
		    Hero.call(this, game, x, y, 'booch',3,1);
		  }
		  Anthony.prototype = Object.create(Hero.prototype);
		 Anthony.prototype.constructor = Anthony;

		/*Matt*/
		  Matt = function(game, x, y){
		    Hero.call(this,game,x,y, 'booch',1, 1.2);
		    this.SFX.hit = game.add.audio('mattHit');
		    this.SFX.fire = game.add.audio('lazer');
		  }
		  Matt.prototype = Object.create(Hero.prototype);
		  Matt.prototype.constructor = Matt;

		/*Nick*/
		  Nick = function(game, x, y){

		    Hero.call(this,game,x, y, 'nick',2, .8);
		    // Nick's collision roles reverse when firing, 
		    // so we don't need to fire a weapon. 
		    this.primaryWeapon.fire = function(){};	

		    this.SFX.hit = game.add.audio('nickHit');
		    this.SFX.fire = game.add.audio('laptopWack');
		  }	  

		  Nick.prototype = Object.create(Hero.prototype);
		  Nick.prototype.constructor = Nick;

		    	
	
	  // Baddies
	  	/*Troll*/
		  Troll = function(game,x,y){
		    Baddy.call(this,game,x,y,'troll');
		  }
		  Troll.prototype = Object.create(Baddy.prototype);
		  Troll.prototype.constructor = Troll;

	// start the intro story
	game.state.start('introStory');
 }

};


/************************************************************************************************************************	
 *															*
 *															*
 *                                                  LEVEL PROTOTYPES 							*
 *                                                  									*
 *															*
 ************************************************************************************************************************/
/*Side Scroller prototype level (to be extended)*/
var sideScroller = function(){};
sideScroller.prototype ={
create: function(){ 

/* Defaults. Override in game level states*/

// platform is the tileSprite to be used as the ground.	
this.platform = 'concrete';
this.createExtendBefore();

/*Coin Listener*/
    if(!game.hardwareInterface.coinMode.freePlay){
      game.time.events.loop(500,game.checkForCoins,this);
    }

    this.street = game.add.tileSprite(0,568, 4000, 200, this.platform);
    game.physics.enable(this.street, Phaser.Physics.ARCADE);
    this.street.enableBody = true;
    this.street.alpha = 0;
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
        this.addPlayerToGame(game,player,player.displayName,100,568+(x*10));            
      }
      else{
        player.hud = new HUD(game, player.displayName, player, (x-1)*340+10, 10,"inactive");
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
    game.physics.arcade.collide(this.heros);
    game.physics.arcade.collide(this.baddies);
    
    // set ghost status before collisions
    this.activePlayers.map(function(p){
     // p.hero.ghost = p.hero.isHitTimer+1500 > game.time.time || p.hero.isGhostIn;
      
    });

    // baddy-player basic hit collisions
    for(b=0; b<this.baddies.length; b++){
	baddy = this.baddies[b].avatar;
	if(baddy.exists){
	  for(p=0;p<this.playerAvatars.length;p++){
	    if(baddy.overlap(this.playerAvatars[p])&& !this.playerAvatars[p].parent.ghost){
		if(this.playerAvatars[p].parent.gamePad == 2 && this.playerAvatars[p].parent.isFiring){ 
	      baddy.parent.hit(4);
	      }
	      else{
	        this.hitPlayer(this.playerAvatars[p].parent,1);
	      }
	    }
	  }
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
      if(player.controls.debugPressed){console.log(player);}
      if(player.active && player.hero.isHitTimer < game.time.time && !player.hero.isDying){
	// Set players alpha lower when a ghost      
	player.hero.alpha = player.hero.ghost? .4 : 1;	
 
        // start each pass 0 velocity
        // so hero stops if no keys pressed  	  
        player.hero.body.velocity.x = 0;
	

        if(!player.hero.jumping){player.hero.body.velocity.y = 0;}

        // standing fire 
	if(player.displayName == "Nick" && (player.hero.isFiring || player.controls.firePressed) && !player.hero.jumping){
	console.log(player.hero.isFiring);
	player.controls.leftPressed = false;
	player.controls.rightPressed = false;
	player.controls.upPressed = false;
	player.controls.downPressed = false;
	player.hero.fire();
	}
        else if(player.controls.firePressed && !(player.hero.jumping || player.controls.leftPressed || player.controls.rightPressed)){player.hero.fire();} 
    
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
            player.hero.run('right', player.controls.firePressed, player.hero.rightFreeze);	    
          }	
	}
        else if(player.controls.leftPressed){
	  if(player.hero.jumping){
	    player.hero.moveLeft();	  
	  }
	  else{	  
            player.hero.run('left', player.controls.firePressed, player.hero.leftFreeze);	    
        
	  }
	}
        else if(!player.hero.jumping && !player.hero.isFiring)
        {
          player.hero.standStill();	    
        }
      }
      // Add new player during play
      else if(!player.active && player.controls.startPressed && (game.hardwareInterface.coinMode.freePlay || game.coinCredit>0)){
        this.addPlayerToGame(game,player,player.displayName, game.camera.x+300, 348); 
	game.coinCredit--;
      }
      // update the top bar HUD's
      player.hud.update();      
    }

/* If no active players and no continue countdowns, end game */
  (function(){
    var continuing = 0;
    for(x=1; x<4; x++){
      if(game.players['player'+x].continueTimer > 0){
        continuing +=1;
      } 	  
    }
    if(continuing <1 && this.activePlayers.length < 1){
      this.gameOver();	    
    }   
  }).bind(this)();	

/* Trigger baddies and update AI */
  for(b=0;b<this.baddies.length;b++){
    if(this.rightPlayer){	    
      if(this.baddies[b].avatar.exists && ((this.baddies[b].world.x - this.rightPlayer.world.x) < 750)){
        this.baddies[b].active = true;	
      }
      if(this.baddies[b].active){this.baddies[b].AI('left',true,this.heros);}    
    }
    else{
      this.baddies[b].stopHoning();	    
    }
  }  

this.updateExtendAfter();
},
	
// Apply damage to a player, if dead call death, if game over call continue / game over
// @param {object} player the player object to be hit
// @param {integer} damage the damage to apply 	
hitPlayer: function(player,damage){
 if(!(player.isDying || player.ghost)){
     // we need the game.players.player parent object for 
     // a few functions, so create that first.
     var playerParent = game.players['player'+player.gamePad];	
	
     // hit in the same life
     if(playerParent.health > 1){
       player.hit(damage);

     }
     // new life 
     else if(playerParent.lives > 1){
       player.death();
       player.addHealth(5);
     }
     // continue in coin mode
     else if (!game.hardwareInterface.coinMode.freePlay){	   
       if(playerParent.active){this.continue(playerParent);}
     }
     // players can re-join other players in free mode multi-player games, but loose all points.
     else if (this.activePlayers.length >1){
       playerParent.hero.kill();
       playerParent.hud.makeInactive();
       playerParent.active = false;
       player.points = 0;
     }
     // free mode solo games cannot be continued
     else{
       this.gameOver(); 
     }
 }   
},

  // Continue option on coin mode games
continue: function(playerParent){

  var points = playerParent.points;
  playerParent.hud.makeContinue();
  playerParent.continueTimer =10;
  playerParent.active = false;
  playerParent.hero.kill();
  
  // countdown
  game.time.events.repeat(1000,11, function(){
    if(!playerParent.active){
      if(playerParent.continueTimer == 0){
        playerParent.hud.makeInactive();
      }
      else{      
        playerParent.continueTimer -=1;
      }	
    }
    // apply points to the continued player
    else{
      if(playerParent.continueTimer > 0){
        playerParent.points += points;
	playerParent.continueTimer = 0; 
      }  
    }
  }); 
},

gameOver: function(){
  game.state.start('gameOver');	
},

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
 if(player.hud && player.hud.state!="active"){	   
   player.hud.makeActive();	 
 }
 else{  
   player.hud = new HUD(game, player.displayName, player, (hudX)*340+10 ,10, "active");
 }
 this.ghostIn(player.hero);
 game.time.events.add(400, function(){player.hero.visible = true;},this); 
},

// That cool effect where a player goes from transparent, to flashing, to solid on game entry.
// @param {object} the object to 'ghost in' 	
ghostIn: function(hero){
  var time = 100;	
  game.time.events.add(1500, function(){game.time.events.repeat(time,15,function(){hero.ghost = !hero.ghost; time=Math.floor(time*.5);},this)},this);
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
// @param {integer} health the health points the baddy should start with
addBaddy: function(baddies, x, y, health){
  var baddy = (function(){
    for(b=0;b<this[baddies].length;b++){
      if(!this[baddies][b].avatar.exists){
        return this[baddies][b];
      }
    }
  }).bind(this)();  
  baddy.reset(x,y);
  baddy.health = health;
  baddy.avatar.exists = true;
},

// when level has been completed
levelComplete: function(){
  this.levelCompleteBefore();
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

render: function(){
}	
};
