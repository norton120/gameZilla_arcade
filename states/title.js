var titleState = function(){}

titleState.prototype = {

init: function(level){
 console.log(level);	
  this.title = "";
  this.level = level;
  switch(level){
    case "levelOne":
      this.title = "LEVEL ONE: JACKSON STREET";
      break;
    case "levelOneBoss":
      this.title =  "DEFEAT LEFT SHARK!";
      break;
    case "levelTwo":
      this.title = "LEVEL TWO: REVZILLA HQ";
      break;
    case "levelTwoBoss":
      this.title = "STOP KEYBOARD CAT!";
      break;
  }
},
create: function(){
  game.bgMusic.stop();
  var displayedText = game.add.text(200,200,this.title,game.setFont("1.5rem", "#fefefe"));
  displayedText.x = (game.camera.width - displayedText.width)/2;
	  
  game.time.events.add(2000, function(){game.state.start(this.level);},this);
}
};

