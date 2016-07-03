var levelOneLoadState = {

preload: function(){	

// 'loading' text and spinner
game.add.text(50, 200, 'loading', {font: '2rem Press Start 2P', fill: '#fefefe'});
	
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
	projectile.lifeSpan = this.projectileLifespan;
	projectile.body.velocity.x = (direction == 'left')? (this.projectileSpeed * -1):this.projectileSpeed;
	this.nextFire = game.time.time + this.fireRate;	
      }  
    }
    return this;
  } 


/*HUD prototype*/
  HUD = function(game, name, player, x, y){
    this.container = game.add.sprite(x,y);	   
    this.health = game.add.sprite(10,30,'health_bar',player.health);
    this.container.addChild(this.health);
    this.name = game.add.text(12,10, name.toUpperCase(), {font:'1rem Press Start 2P', fill: '#fefefe'});
    this.lives = game.add.text(this.name.width+10,10, " X"+player.lives, {font:'1.25rem Press Start 2P', fill:"#fefefe"});
    
    this.scoreText = function(score){
      var result = "00000000"+score;
      return result.substr(result.length-8);
    }

    this.score = game.add.text(12,60, this.scoreText(player.points), {font:'1rem Press Start 2P', fill:"#fefefe"});
    this.container.addChild(this.score);
    this.container.addChild(this.lives);
    this.container.addChild(this.name);
    this.container.fixedToCamera = true;   
    
    this.update = function(){
      this.health.frame = player.health;
      this.lives.setText(" X"+player.lives);      
      this.score.setText(this.scoreText(player.points));
    } 
    

    return this;   
  }

/*HUD placeholder prototype*/
  HUDPlaceholder = function(game, name, x,y){
    this.container = game.add.sprite(x,y);
    this.name = game.add.text(15,0, name.toUpperCase(), game.setFont('1rem','#fefefe'));
    var message = game.hardwareInterface.coinMode.freePlay? " PRESS START":(game.coinCredit > 0? " PRESS START":" INSERT COIN");
    this.message = game.add.text(0,20,message, game.setFont('1rem','#fefefe'));
    this.container.addChild(this.name);
    this.container.addChild(this.message);
    this.container.fixedToCamera = true;
    this.flashTimer = 0;
    this.update = function(){
      if(!game.hardwareInterface.coinMode.freePlay){
        var text = "INSERT COIN";
	var flashing = false;
        if(game.coinCredit > 0){
	  text = "PRESS START";
	  flashing = true;
        }		
        this.message.setText(text);
        if(flashing){
	  if (game.time.time > this.flashTimer){
	    this.message.alpha = this.message.alpha == 0? 1:0;
	    this.flashTimer = game.time.time+300;
	  }
	}  
	else{
	  this.message.alpha = 1;	  
	}	  
      }
    }

    return this;
  }

/*Hero base prototype*/
  // @param {obj} game the game object
  // @param {int} x the starting x coordinate of the sprite
  // @param {int} y the starting y coordinate of the sprite
  // @param {string} spriteSheet the name of a loaded sprite sheet
  // @param {float} speed, relitive to Anthony. 1 is full speed, 0 stopped.  
  Hero = function(game, x, y, spriteSheet, speed){
    Phaser.Sprite.call(this, game, x, y);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
    this.shadow = game.add.sprite(30,125, 'shadow');
    this.addChild(this.shadow);
    this.shadow.scale.setTo(.5,.5);
    this.shadow.visible = false;
    this.avatar = game.add. sprite(0,0, spriteSheet);
    this.addChild(this.avatar);
    game.physics.enable(this.avatar, Phaser.Physics.ARCADE);
    game.camera.follow(this);

    // Base props
    this.points = 0;
    this.health = 5;
    this.lives = 3; 
    this.ghost = true;
    this.isFiring = false;
    this.actionSpeed = 170*speed;
    this.direction = 'right';
    this.jumping = false;
    this.leftFreeze = false;
    this.rightFreeze = false;

    // Calculated Props
    this.feet = function(){return(this.avatar.world.y + this.avatar.height);}

    // animations11
    //this.avatar.animations.add('runRight',[13,14,15],8, true);
    this.avatar.animations.add('runRight', Phaser.Animation.generateFrameNames('run_right_', 1,8), 12, true);
    this.avatar.animations.add('runLeft', Phaser.Animation.generateFrameNames('run_left_', 1,8), 12, true);
    this.avatar.animations.add('jumpStartRight', Phaser.Animation.generateFrameNames('jump_right_', 1,2), 16, false);
    this.avatar.animations.add('jumpLandRight', Phaser.Animation.generateFrameNames('land_right_', 1,5), 18, false);
    this.avatar.animations.add('jumpStartLeft', Phaser.Animation.generateFrameNames('jump_left_', 1,2), 16, false);
    this.avatar.animations.add('jumpLandLeft', Phaser.Animation.generateFrameNames('land_left_', 1,5), 18, false);
    // keep a reference to these, since they need callbacks
    var fireLeft = this.avatar.animations.add('fireLeft', Phaser.Animation.generateFrameNames('fire_left_',1,4),18,false);
    var fireRight = this.avatar.animations.add('fireRight', Phaser.Animation.generateFrameNames('fire_right_',1,4),18,false);
  
    // actions

    this.run =function(direction, shooting, frozen){
      this.direction = direction;
      animation = (shooting? 'shoot' : 'run') + direction.charAt(0).toUpperCase() + direction.slice(1);
      this.avatar.animations.play(animation);	
      if(!frozen){this.body.velocity.x = (direction == 'right'? this.actionSpeed : this.actionSpeed*-1);}
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
      if(!this.jumping){
	var dir = this.direction.charAt(0).toUpperCase() + this.direction.slice(1);      
	this.avatar.animations.play('jumpStart'+dir);      
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

      }
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
        anim.onComplete.add(function(){this.primaryWeapon.fire(this.direction); this.isFiring = false;},this);	    
      }	
    }


    // weapons
    this.primaryWeapon = new Weapon(game,this.avatar,'sprocket'); 

  }
  Hero.prototype = Object.create(Phaser.Sprite.prototype);
  Hero.prototype.constructor = Hero;

	/* extended prototypes*/
  	  
	  


	  // Heros
		/*Booch*/  
		  Anthony = function(game, x, y){
		    Hero.call(this, game, x, y, 'booch',1);
		  }
		  Anthony.prototype = Object.create(Hero.prototype);
		 Anthony.prototype.constructor = Anthony;

		/*Matt*/
		  Matt = function(game, x, y){
		    Hero.call(this,game,x,y, 'booch', 1.2);
		  }
		  Matt.prototype = Object.create(Hero.prototype);
		  Matt.prototype.constructor = Matt;

		/*Nick*/
		  Nick = function(game, x, y){
		    Hero.call(this,game,x, y, 'booch', .8);
		  }	  
		  Nick.prototype = Object.create(Hero.prototype);
		  Nick.prototype.constructor = Nick;


/* Camera follow for multiple players */		  
game.moveCamera = function(players){
  var following = players[0];
  for(x=0; x<players.length; x++){ 
    if(players[x].x > following.x){ following = players[x]; }
  }

 game.camera.follow(following);
}
/* Freeze players when they get to far apart for camera */
game.freezePlayers = function(players){
  var leftPlayer = players[0];
  var rightPlayer = players[0];
  for(x=0;x<players.length; x++){
    if(players[x].world.x > rightPlayer.world.x){rightPlayer = players[x];}
    if(players[x].world.x < leftPlayer.world.x){leftPlayer = players[x];}
  }
  if(rightPlayer.world.x - leftPlayer.world.x >800){
    rightPlayer.rightFreeze = true;
    leftPlayer.leftFreeze = true;
  }
}

},

create: function(){
	game.state.start('levelOne');
}	

}
  
