var levelOneLoadState = {

preload: function(){	

// 'loading' text and spinner
game.add.text(50, 200, 'loading', {font: '2rem Press Start 2P', fill: '#fefefe'});
	
/*Base prototypes*/
  /*Weapon base prototype*/
  Weapon = function(game,origin,directionOwner,sprite){
    this.weaponStore = game.add.group();
    
    this.weaponStore.createMultiple(200,sprite,0,false);
    game.physics.enable(this.weaponStore,Phaser.Physics.ARCADE); 

    this.nextFire = 0;
    this.fireRate = 200;
    this.projectileSpeed = 500;
    this.projectileLifespan = 2500;
    
    this.fire = function(){
      if(this.nextFire < game.time.time){
        
	var projectile = this.weaponStore.getFirstExists(false); 
	projectile.reset(((directionOwner.direction == 'left')? origin.world.x : origin.world.x + origin.width), origin.world.y + (origin.height /2.5));
	projectile.exists = true;
	projectile.lifeSpan = this.projectileLifespan;
	projectile.body.velocity.x = (directionOwner.direction == 'left')? (this.projectileSpeed * -1):this.projectileSpeed;
	this.nextFire = game.time.time + this.fireRate;	
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
    this.avatar = game.add.sprite(0,0, spriteSheet);
    this.addChild(this.avatar);
    game.physics.enable(this.avatar, Phaser.Physics.ARCADE);
    game.camera.follow(this);

    // Base props
    this.isFiring = false;
    this.actionSpeed = 150*speed;
    this.direction = 'right';
    this.jumpTimer = 0;
    this.jumping = false;

    // Calculated Props
    this.feet = function(){return(this.avatar.world.y + this.avatar.height);}

    // animations11
    this.avatar.animations.add('runRight',[13,14,15],8, true);
    this.avatar.animations.add('runLeft',[16,17,18],8, true);
    this.avatar.animations.add('shootRight', [0,1,2,3],8, true);
    this.avatar.animations.add('shootLeft', [5,6,7,8],8, true);
    this.avatar.animations.add('powerUp', [10,11,12],10, true);
  
    // actions

    this.run =function(direction, shooting){
      this.direction = direction;
      animation = (shooting? 'shoot' : 'run') + direction.charAt(0).toUpperCase() + direction.slice(1);
      this.avatar.animations.play(animation);	
      this.body.velocity.x = (direction == 'right'? this.actionSpeed : this.actionSpeed*-1);
    }
    
    this.moveDown = function(){
      this.body.velocity.y = 100;
    }

    this.moveUp = function(){
      this.body.velocity.y = -100;
    }

    this.jump = function(){
      if(!this.jumping){
	this.jumping = true;
	start = this.avatar.body.y;   
        this.shadow.visible = true;
	
	jUp = game.add.tween(this.avatar.body).to({y: (this.avatar.body.y -155)}, 105, Phaser.Easing.Linear.In);
	jDown = game.add.tween(this.avatar.body).to({y: start}, 135, Phaser.Easing.Linear.Out);

	game.time.events.add(650, function(){this.jumping = false;}, this);
	game.time.events.add(550, function(){this.shadow.visible = false;},this);

	resetStart = function(){this.avatar.body.y= start;}

	jDown.onComplete.add(resetStart, this);
	
	jUp.chain(jDown).start();

      }
    }

    this.standStill = function(){
      this.avatar.animations.stop();
      this.avatar.frame = 4;
    }

    this.fire = function(){
      this.primaryWeapon.fire();
    }


    // weapons
    this.primaryWeapon = new Weapon(game,this.avatar,this,'sprocket'); 
    

  }
  Hero.prototype = Object.create(Phaser.Sprite.prototype);
  Hero.prototype.constructor = Hero;

	/* extended prototypes*/
  	  
	  


	  // Heros
		/*Booch*/  
		  Booch = function(game, x, y){
		    Hero.call(this, game, x, y, 'booch',1);
		  }
		  Booch.prototype = Object.create(Hero.prototype);
		  Booch.prototype.constructor = Booch;

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
},

create: function(){
	game.state.start('levelOne');
}	

}
  
