var startMenuState = {

create: function(){
	
	this.activePlayers= 0;
	this.waitingCount=10;
        this.startPause=0;

	game.bgMusic = this.add.audio('rainbow_in_the_dark');
        game.bgMusic.play(null,10);	

        var menuBackground = game.add.tileSprite(0,0, game.world.width, game.world.height, 'diamondPlate');
	this.menuBody = game.add.tileSprite(game.world.width/6, game.world.height/8, game.world.width/1.5, game.world.height/1.3, 'blackFill');
	var gameLogo = game.add.image((this.menuBody.x + Math.floor(this.menuBody.x*.4)), (this.menuBody.y + Math.floor(this.menuBody.y*.15)) , 'revzillaLogo');	

	var logoScale = (this.menuBody.width*.8)/gameLogo.width;
	gameLogo.scale.setTo(logoScale,logoScale);
	var Subtitle = game.add.text(0, gameLogo.y + gameLogo.height + 25, 'The Battle For Philadelphia', {font: ' 2rem Press Start 2P', fill: '#fefefe', wordWrap: true, wordWrapWidth: this.menuBody.width, textAlign: 'center' });
	Subtitle.setShadow(3,3,'#DB4605');
	
	// need to reposition Subtitle after we know the rendered width
	Subtitle.x = this.menuBody.x + (Math.floor((this.menuBody.width - Subtitle.width)/2));

	this.startInstructions = game.add.text(0, Subtitle.y + Subtitle.height + 25,"", game.setFont('20px','#fefefe'));


	this.heroIcons = game.add.group();
	this.heroIcons.create(425,600,'booch').addChild(game.add.text(10,160,'Matt',{font:'1rem Press Start 2P', fill: '#fefefe'}));
	this.heroIcons.create(625,600,'booch').addChild(game.add.text(10,160,'Nick',{font:'1rem Press Start 2P', fill:'#fefefe'}));
	this.heroIcons.create(825,600,'booch').addChild(game.add.text(-10,160,'Anthony', {font:'1rem Press Start 2P', fill:'#fefefe'}));
	this.heroIcons.setAll('frameName',"stand_right");
	this.heroIcons.scale.setTo(.75,.75);
	this.heroIcons.setAll('visible', false);


        this.waitingMessage = game.add.text(210, 630, "Waiting for Players :"+this.waitingCount, game.setFont('25px','#db4605'));       
	this.waitingMessage.visible =false;

        // make start message flash
	game.time.events.loop(350, function(){this.startInstructions.visible = !this.startInstructions.visible;},this);

	// listen for the coin drop
	game.time.events.loop(500,game.checkForCoins,this);

},

update: function(){	
  game.updateInputKeyStates();
	

	// determine instruction message
	var instructions;
	if(game.hardwareInterface.coinMode.freePlay){
	  var instructions = this.activePlayers > 0? 'press start to join' : 'press start to play';
	}
	else{
	  if(this.activePlayers > 0){
	    var instructions = game.coinCredit >0? 'press start to join' : 'insert coin to join';
	  }
	  else{
	    var instructions = game.coinCredit > 0? 'press start to play' : 'insert coin to play';  
	  }	  
	}  	  
	this.startInstructions.setText(instructions);
	
	// position message
	this.startInstructions.x = this.menuBody.x + (Math.floor((this.menuBody.width - this.startInstructions.width)/2));

	// update waiting timer
	this.waitingMessage.setText('Waiting for Players :'+(this.waitingCount < 10? "0":"")+this.waitingCount);

        // start the game on timeout
	if(this.waitingCount < 1){this.start();}

	if(game.hardwareInterface.coinMode.freePlay){
	  this.addPlayer();	
	}
	else if (game.coinCredit > 0){
  	  this.addPlayer();	  
	}
	
	for(x=1;x<4;x++){
	 var player = game.players['player'+x];
  	 if(player.active && (game.time.time > this.startPause) && player.controls.startPressed){
	   this.start();
	 }	 
	}

},

addPlayer: function(){
  for(x=1;x<4;x++){
    player =game.players['player'+x];
    if(!player.active){
      if(player.controls.startPressed){
        player.active = true;
	this.startPause = game.time.time +500;
	this.heroIcons.getChildAt(x-1).visible = true;
	if(this.activePlayers <1){game.time.events.repeat(1000,10,function(){this.waitingCount--},this);}
	this.activePlayers++;
	this.waitingMessage.visible = true;
	if(game.coinCredit > 0){game.coinCredit--;}
      }	      
    }
  }
},	

start: function(){ 
  game.state.start('levelOneLoad');
}
};
