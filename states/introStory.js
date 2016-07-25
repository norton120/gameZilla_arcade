var introStoryState = {

create: function(){
  // Add the typing sound	
  this.typeWriterSound = game.add.audio('typeWriter');

  this.gameZilla = game.add.text(game.world.width/2, game.world.height/3, '8GameZilla presents', game.setFont("1.5rem","#fefefe"));	
  this.gameZilla.x = (game.world.width - this.gameZilla.width)/2;
  game.time.events.add(2000, function(){this.gameZilla.destroy(); this.firstSlide();},this); 
},
firstSlide: function(){
  this.partners = game.add.image(450,150, 'storyPartners');
  this.partners.scale.setTo(.75,.75);
  this.textOne = game.add.text(40, game.world.height/4, '', {font: '1.5rem Press Start 2P', fill: "#fefefe", wordWrap:true, wordWrapWidth:game.world.width*.4});
  this.typeText(this.textOne, 'In 2007, three friends set out to change the motorcycle industry - and the world.');
  game.time.events.add(10000,function(){this.partners.destroy();this.textOne.destroy();this.secondSlide();},this);
},
secondSlide: function(){
  this.keyboardCat = game.add.image(500,150,'keyboardCat');
  this.textTwo = game.add.text(40,game.world.height/4, "", {font: '1.5rem Press Start 2P', fill: "#fefefe", wordWrap:true, wordWrapWidth:game.world.width*.4});  
  this.typeText(this.textTwo, "However, not everyone was happy about RevZilla's success. Keyboard Cat, bitter from his rejection by the partners, swore revenge.");
  game.time.events.add(14000,function(){this.keyboardCat.destroy();this.textTwo.destroy();this.thirdSlide();},this);
},
thirdSlide: function(){
  this.toHighScore();	
},
update:function(){
 game.updateInputKeyStates();

  for(x=1; x<4; x++){
    var player = game.players['player'+x];
    if(player.controls.startPressed){this.toMenu();}    
  }	  
},

toHighScore: function(){
  game.state.start('highScore');
},

toMenu: function(){
  game.state.start('startMenu');	
},
// Types out text, like the old school games
// @param {object} target the text to update
// @param {string} the text to type out	
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
