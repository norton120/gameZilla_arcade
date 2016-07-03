var introStoryState = {

create: function(){
 
  // Add the typing sound	
  this.typeWriterSound = game.add.audio('typeWriter');

  var gameZilla = game.add.text(game.world.width/2, game.world.height/3, '8GameZilla presents', {font:'1.5rem Press Start 2P', fill:'#fefefe'});	
  gameZilla.x = (game.world.width/2) - (gameZilla.width/2);
  game.time.events.add(2000, function() { 
    game.add.tween(gameZilla).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true)});

  game.time.events.add(11500, this.toMenu);

  game.time.events.add(3000, function(){
  
  var partners = game.add.image(game.world.width/2, game.world.height/4, 'storyPartners');

  var textOne = game.add.text(50, game.world.height/3, '', {font: '1.5rem Press Start 2P', fill: "#fefefe", wordWrap:true, wordWrapWidth:game.world.width*.4});
  this.typeText(textOne, 'In 2007, three friends set off to change the motorcycle industry - and the world.');
  }, this);


  

},
update:function(){
 game.updateInputKeyStates();

  for(x=1; x<4; x++){
    var player = game.players['player'+x];
    if(player.controls.startPressed){this.toMenu();}    
  }	  
},

toMenu: function(){
  game.state.start('startMenu');
},

typeText: function(target, text){
  var text = text.split("");	
  for(x=0; x<text.length; x++)
  {	  
    (function(t, sound){
	    
      game.time.events.add(100*x, function(){
        if(t != " "){sound.play();}	    
        target.setText(target.text+t);
      });
    })(text[x],this.typeWriterSound);
    
  }	    
}


};
