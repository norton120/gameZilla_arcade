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

    this.makeActive =function(){	
      state = "active";	   
      this.flashing = false; 

      this.container.removeChildren();
      this.health = game.add.sprite(10,30,'health_bar',player.hero.health);
      this.name = game.add.text(12,10, name.toUpperCase(), {font:'1rem Press Start 2P', fill: '#db4605'});
      this.lives = game.add.text(this.name.width+10,10, " X"+player.hero.lives, {font:'1.25rem Press Start 2P', fill:"#db4605"});
      this.score = game.add.text(12,60, this.scoreText(player.hero.points), {font:'1rem Press Start 2P', fill:"#db4605"});
       this.container.addChild(this.health);
       this.container.addChild(this.score);
       this.container.addChild(this.lives);
       this.container.addChild(this.name);
    }	

    this.makeInactive = function(){
      state = "inactive";	    
      this.container.removeChildren();
      this.name = game.add.text(12,10, name.toUpperCase(), game.setFont('1rem','#db4605'));
      var message = game.hardwareInterface.coinMode.freePlay? " PRESS START":(game.coinCredit > 0? " PRESS START":" INSERT COIN");
      this.message = game.add.text(0,30,message, game.setFont('1rem','#db4605'));
      this.container.addChild(this.name);
      this.container.addChild(this.message);
    }
    
    this.makeContinue = function(){
      state = "continue";
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

      switch(state){
        case "active":
          this.health.frame = player.hero.health;
          this.lives.setText(" X"+player.hero.lives);
          this.score.setText(this.scoreText(player.hero.points));
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
    this.points = 0;
    this.health = 5;
    this.lives = 3; 
    this.isDying = false;
    this.isGhostIn = true;
    this.ghost = true;
    this.isFiring = false;
    this.actionSpeed = 170*speed;
    this.direction = 'right';
    this.jumping = false;
    this.leftFreeze = false;
    this.rightFreeze = false;
    this.isHitTimer = 0;
    this.isFiringTimer = 0;

    // Calculated Props
    this.feet = function(){return(this.avatar.world.y + this.avatar.height);}

    // animations
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

    this.hit = function(damage){
      this.avatar.animations.stop();	    
      this.isHitTimer = game.time.time +600;	
      this.avatar.frameName = "land_"+this.direction.toLowerCase()+"_5";
      var damage = damage || 1;
      this.body.velocity.x = this.direction == "right"? -150:150; 
      this.health = (this.health-damage > -1)? this.health-damage: 0;
      // if a collision stops the fire or jump animations, players get 'stuck'
      // this will unstick them.
      this.isFiring = false;
      this.jumping = false;
    }

    this.death = function(){
      //this.dying =true;
      this.lives = (this.lives-1 >0)? this.lives-1 : 0;	 
      this.exists = false;
      this.reset(game.camera.x+300, 450);
    }

    this.addHealth = function(points){
      this.health = (this.health+points < 6)? this.health+points : 5;
    }
    this.addPoints = function(points){
      this.points += points;
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
		  }
		  Matt.prototype = Object.create(Hero.prototype);
		  Matt.prototype.constructor = Matt;

		/*Nick*/
		  Nick = function(game, x, y){
		    Hero.call(this,game,x, y, 'booch',2, .8);
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

},

create: function(){
	game.state.start('levelOne');
}	

}
  
