
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
	    game.load.spritesheet('hudPlayer1', 'assets/images/hud_player_1.png',340,100);
	    game.load.spritesheet('hudPlayer2', 'assets/images/hud_player_2.png',340,100);
	    game.load.spritesheet('hudPlayer3', 'assets/images/hud_player_3.png',340,100);
	},

 create: function(){
   // load the Phaser world physics, create the world space, set world constants	
   game.physics.startSystem(Phaser.Physics.ARCADE);
   game.time.desiredFps = 30;

   // these can all go. create on level, stage and character levels 
            // Create the global sound effects
	    game.boochShootSound = game.add.audio('shoot');
	    game.boochJuggernautSound = game.add.audio('juggernaut');
	    game.boochApexPreditorSound =game.add.audio('apexPreditor');
	    game.boochJumpSound = game.add.audio('jump');
	    game.boochHeySound = game.add.audio('hey');

/*PLAYERS*/
	
	// Create the game player containers
	game.players = [];

	// Test controllers for connections
  	for(x=1; x < 5; x++){
            game.players['player'+x] = {};
	}	

/*CONTROLS*/


	// detect if the gamepad was able to connect and is supported and active
	game.padConnected = game.input.gamepad.supported && game.input.gamepad.active && (game.input.gamepad.pad1.connected || game.input.gamepad.pad2.connected || game.input.gamepad.pad3.connected || game.input.gamepad.pad4.connected);
        
	// normalized player input values
	for(x=1; x<5; x++){
	  var player = game.players['player'+x];	
	  player.active = false;	
	  player.hero ={};
	  player.playerSelected = "";
	  player.controls = {};    
	  player.controls.rightPressed = false;
	  player.controls.leftPressed = false;
	  player.controls.upPressed = false;
	  player.controls.downPressed = false;
	  player.controls.jumpPressed = false;
	  player.controls.firePressed = false;
	  player.controls.specialPressed = false;
	  player.controls.playerStartPressed = false;
	}

        // default keyboard controls - always available
	game.cursors = game.input.keyboard.createCursorKeys();
	game.jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
	game.fireKey = game.input.keyboard.addKey(Phaser.Keyboard.X);
	game.specialKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
	game.playerStartKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
	game.startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
	   
	
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
	    	player.controls.playerStartPressed = (game.input.gamepad[pad]._rawPad.buttons[4].pressed);
	      }
	    }
	  }  
	  else
	  {
	    game.players.player1.controls.leftPressed = (game.cursors.left.isDown);
  	    game.players.player1.controls.rightPressed = (game.cursors.right.isDown);
	    game.players.player1.controls.upPressed = (game.cursors.up.isDown);
  	    game.players.player1.controls.downPressed = (game.cursors.down.isDown);
	    game.players.player1.controls.firePressed = (game.fireKey.isDown);
	    game.players.player1.controls.jumpPressed = (game.jumpKey.isDown);	    
	  }
	};	

	// start the intro story
	game.state.start('introStory');
 }
};
