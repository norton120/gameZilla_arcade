# README #

This is the **Arcade Cabinet Specific** version of our game.
Some of the things that make it Arcade Specific include:
* 1024 X 768 hard-coded game resolution (matches our CRT)
* Hard-coded position and height values (not responsive)
* CGI bash scripts to interface with the arcade hardware - coin slot, sound and play mode toggle switches
* API calls for game_config, coin_dropped and high_score files, all managed by the CGI scripts
* Uncaught references to arcade-specific variables (coinCount, coinMode etc)
* Assumed 3 gamepad controllers, with hard-coded button and axis values to match specific hardware

## APACHE NOTE ##
Apache globally accessible mod utility is {{a2enmod}} so just run a2enmod cgi as root (and restart apache).

Also need to give apache a shell in etc/passwd, since it is set as nologin by default. Set it to /bin/bash. 

give www-data write and execute permissions for /usr/lib/cgi-bin/ or the script won't be able to reset the coin count (capture the coins). 

**Version**: *0.0.1*

## Game Structure ##
 The game is structured as a single script with the global object *game* persisting throughout. Levels / stages are broken into [states](http://phaser.io/docs/2.4.4/Phaser.State.html) which are simply objects with an expected set of functions. 

The basic level structure is a 2.5D side-scroller - that is, a side scroller where characters can move along the y-axis in a limited section, adding the illusion of basic depth. There is no perspective (things don't get smaller or bigger), and the physics are dumbed down a bit from real 3D physics - hence the term "2.5D". 

Since our game is a 2.5D side-scroller, the baseline setup for each level is a bit more in-depth than a traditional side-scroller; to combat this, we have the **LevelLoadState**. This is a base foundation for creating additional 2.5D side-scrolling levels. So... to create a new level, simply create the new state and set it's value to levelLoadState to start. Use the *extend* functions (covered later) to add your level-specific code.

### Gotchas ###
* **DON'T USE GROUPS!** - forget all about Phaser.group for this application. Adding an object to one group removes it from another group, a major weak spot in Phaser. We are using a group *actors* to sort all the players on the y-axis (so lower sits on top, giving the illusion of depth) - standard 2.5D fare. If you use groups, you will most likely pull the object out of the depth sort and brake it; try using arrays instead, they work almost everywhere that groups will work and there is no limit to how many arrays an object can be in. 

* **Beware of scope** - to contain things on a level-by-level basis, scope everything you can with *this*. Exceptions are things that need to be game-wide, which should belong to the *game* object.