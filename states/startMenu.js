var startMenuState = {

create: function(){
	game.bgMusic = this.add.audio('rainbow_in_the_dark');
        game.bgMusic.play(null,10);	
        var menuBackground = game.add.tileSprite(0,0, game.world.width, game.world.height, 'diamondPlate');
	var menuBody = game.add.tileSprite(game.world.width/6, game.world.height/6, game.world.width/1.5, game.world.height/1.5, 'blackFill');
	var gameLogo = game.add.image((menuBody.x + Math.floor(menuBody.x*.4)), (menuBody.y + Math.floor(menuBody.y*.15)) , 'revzillaLogo');	

	var logoScale = (menuBody.width*.8)/gameLogo.width;
	gameLogo.scale.setTo(logoScale,logoScale);
	var Subtitle = game.add.text(0, gameLogo.y + gameLogo.height + 25, 'The Battle For Philadelphia', {font: ' 2rem Press Start 2P', fill: '#fefefe', wordWrap: true, wordWrapWidth: menuBody.width, textAlign: 'center' });
	Subtitle.setShadow(3,3,'#DB4605');
	
	// need to reposition Subtitle after we know the rendered width
	Subtitle.x = menuBody.x + (Math.floor((menuBody.width - Subtitle.width)/2));
	
	var startInstructions = game.add.text(0, Subtitle.y + Subtitle.height + 25, (game.hardwareInterface.coinMode.freePlay? 'press enter to start': 'insert coin'), {font: '20px Press Start 2P', fill: '#fefefe'});

	// same as Subtitle; let it render, then position based on the width
	startInstructions.x = menuBody.x + (Math.floor((menuBody.width - startInstructions.width)/2));

	// listen for the coin drop
	game.time.events.loop(500,game.checkForCoins,this);
       
},

update: function(){	

	if(game.hardwareInterface.coinMode.freePlay){
		var enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
	        enter.onDown.addOnce(this.start, this);
	}
	else if (game.coinCredit > 0){
	    game.coinCredit--;
	    this.start();	  
	}
},

start: function(){ 
	game.state.start('playerSelect');
}

};
