
var loadState = {

 preload: function(){

        /* load the game config variables into the game */
	var loadHardwareInterface = new XMLHttpRequest();
	loadHardwareInterface.onreadystatechange = function()
	{
 	  if (loadHardwareInterface.readyState == 4 && loadHardwareInterface.status == 200){
	    game.hardwareInterface = JSON.parse(loadHardwareInterface.responseText);
          }
        }
	loadHardwareInterface.open("GET",'/cgi-bin/game_config',true);
	loadHardwareInterface.send();

	game.coinCredit= 0;

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


	game.isTouchscreen = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
	
	// attempt to start the gamepad(s) 
	game.input.gamepad.start();
        
	// before loading, add the 'loading' text
	
/*LOAD ASSETS*/


/*sound effects*/	
	    game.load.audio('shoot', 'assets/sounds/sprocket.mp3');  	
	    game.load.audio('apexPreditor','assets/sounds/apex_preditor.mp3');
	    game.load.audio('juggernaut', 'assets/sounds/juggernaut.mp3');
	    game.load.audio('black_betty','assets/sounds/black_betty.mp3');	
	    game.load.audio('rainbow_in_the_dark', 'assets/sounds/rainbow_in_the_dark.mp3');
	    game.load.audio('jump','assets/sounds/jump.mp3');
	    game.load.audio('hey', 'assets/sounds/hey.mp3');
	    game.load.audio('typeWriter','assets/sounds/type.mp3');
	    
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
	    game.load.image('sprocket','assets/images/sprocket.png',56,56);
	    game.load.image('concrete','assets/images/concrete.png',400,600);
	    game.load.image('x_button','assets/images/x_button.png',75,75);
	    game.load.image('z_button','assets/images/z_button.png',75,75);
	    game.load.image('shadow','assets/images/shadow.png');
	    game.load.image('cursor_button','assets/images/cursor_button.png',58,58);
	    game.load.spritesheet('health_bar', 'assets/images/health_bar.png',123.8,25);
	    game.load.spritesheet('booch', 'assets/images/anthony_sprite.png',119.5,140);
	    game.load.spritesheet('troll', 'assets/images/troll_sprite.png',95.5,119);
	    game.load.spritesheet('all_the_things', 'assets/images/all_the_things.png', 129, 120);
	},

 create: function(){
   // load the Phaser world physics, create the world space, set world constants	
   game.physics.startSystem(Phaser.Physics.ARCADE);
   game.time.desiredFps = 30;

            // Create the global sound effects
	    game.boochShootSound = game.add.audio('shoot');
	    game.boochJuggernautSound = game.add.audio('juggernaut');
	    game.boochApexPreditorSound =game.add.audio('apexPreditor');
	    game.boochJumpSound = game.add.audio('jump');
	    game.boochHeySound = game.add.audio('hey');

/*CONTROLS*/
	
	// normalized player input values
	game.controls = {};    
	game.controls.rightPressed = false;
	game.controls.leftPressed = false;
	game.controls.upPressed = false;
	game.controls.downPressed = false;
	game.controls.jumpPressed = false;
	game.controls.firePressed = false;
	game.controls.fakeCoinPressed = false;

	// detect if the gamepad was able to connect and is supported and active
	game.padConnected = game.input.gamepad.supported && game.input.gamepad.active && game.input.gamepad.pad1.connected;
     

        // default to keyboard controls - always available
	game.cursors = game.input.keyboard.createCursorKeys();
	game.jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
	game.fireKey = game.input.keyboard.addKey(Phaser.Keyboard.X);
	game.startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
	   
	// this lets us simulate dropping a coin with the "c" key
	game.fakeCoin = game.input.keyboard.addKey(Phaser.Keyboard.C);
	
	game.updateInputKeyStates = function(){
	  // if gamepad detected, listen for gamepad input
	  if(game.padConnected)
	  {
	    game.controls.leftPressed = (game.input.gamepad.pad1._rawPad.axes[0] == -1);  	  
	    game.controls.rightPressed = (game.input.gamepad.pad1._rawPad.axes[0] == 1);  	  
	    game.controls.upPressed = (game.input.gamepad.pad1._rawPad.axes[1] == -1);  	  
	    game.controls.downPressed = (game.input.gamepad.pad1._rawPad.axes[1] == 1);  	  
	    game.controls.firePressed = (game.input.gamepad.pad1._rawPad.buttons[1].pressed);
	    game.controls.jumpPressed = (game.input.gamepad.pad1._rawPad.buttons[2].pressed);
	  }
	  else
	  {
	    game.controls.leftPressed = (game.cursors.left.isDown);
  	    game.controls.rightPressed = (game.cursors.right.isDown);
	    game.controls.upPressed = (game.cursors.up.isDown);
  	    game.controls.downPressed = (game.cursors.down.isDown);
	    game.controls.firePressed = (game.fireKey.isDown);
	    game.controls.jumpPressed = (game.jumpKey.isDown);	    
	  }
	  game.controls.fakeCoinPressed = (game.fakeCoin.isDown); 
	};	

/*MOBILE CONTROLS*/
game.enableMobileControls = function(){

  var createMobileButton = function(direction, x, y, image){
    key = direction+'Key';
    game[key] = game.add.button(x,y,image,null,this,0,1,0,1);
    game[key].fixedToCamera = true;
    game[key].onInputDown.add(function(){game.controls[direction+'Pressed'] = true;});
    game[key].onInputUp.add(function(){game.controls[direction+'Pressed'] = false;});
  }

  createMobileButton('jump',game.camera.width -125, game.camera.height -110, 'z_button');
  createMobileButton('fire',game.camera.width -250, game.camera.height -110, 'x_button');
  createMobileButton('up', 125, game.camera.height -155, 'cursor_button');
  createMobileButton('down', 125, game.camera.height -75, 'cursor_button');
  createMobileButton('left', 90, game.camera.height -115, 'cursor_button');
  createMobileButton('right',160, game.camera.height -115, 'cursor_button');
  
};

	// start the intro story
	game.state.start('introStory');
 }
};
