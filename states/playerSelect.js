var playerSelectState = {

create: function(){

  var title = game.add.text(0, game.world.height/6, 'Select Your Hero', {font: '2rem Press Start 2P', fill:'#DB4605'});
  title.x = (game.world.width - title.width) / 2;
  
  // set the scale, based on the screen
  var playerSelectScale = ((game.world.width*.6)/3)/400;

  // add nick
  var playerSelectNick = game.add.button((playerSelectScale*400)/2, game.world.height/4, 'playerNick', function(){this.selectPlayer('nick');}.bind(this));

  // add booch button
  var playerSelectBooch = game.add.button((playerSelectScale*400)*2, game.world.height/4, 'playerBooch', function(){this.selectPlayer('booch');}.bind(this));

  // and matt
  var playerSelectMatt = game.add.button((playerSelectScale*400)*3.5, game.world.height/4,'playerMatt', function(){this.selectPlayer('matt');}.bind(this)); 


  // scale them all
  [playerSelectBooch,playerSelectMatt,playerSelectNick].map(function(p){
	  p.scale.setTo(playerSelectScale,playerSelectScale);
  });
  
  // add text and position once the buttons are scaled
  var selectPlayerButtonTextBooch = game.add.text(playerSelectBooch.x, (playerSelectBooch.y + playerSelectBooch.height) - (playerSelectBooch.height*.2), 'Anthony', {font: '1.5rem Press Start 2P', fill: '#DB4605'});
  selectPlayerButtonTextBooch.x = playerSelectBooch.x + ((playerSelectBooch.width - selectPlayerButtonTextBooch.width)/2);
  
  var selectPlayerButtonTextNick = game.add.text(playerSelectNick.x, (playerSelectNick.y + playerSelectNick.height) - (playerSelectNick.height*.2), 'Nick', {font: '1.5rem Press Start 2P', fill: '#DB4605'});
  selectPlayerButtonTextNick.x = playerSelectNick.x + ((playerSelectNick.width - selectPlayerButtonTextNick.width)/2);

  var selectPlayerButtonTextMatt = game.add.text(playerSelectMatt.x, (playerSelectMatt.y + playerSelectMatt.height) - (playerSelectMatt.height*.2), 'Matt', {font: '1.5rem Press Start 2P', fill: '#DB4605'});
  selectPlayerButtonTextMatt.x = playerSelectMatt.x + ((playerSelectMatt.width - selectPlayerButtonTextMatt.width)/2);


},

selectPlayer:function(player){
  game['playerSelected'] = player;	
  game.bgMusic.stop();  
  game.state.start('levelOneLoad');
}

};
