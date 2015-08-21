/*
  variable declarations
  Description:
   the global variables we need access to in order to change the velocity of our character and a few others. 
  author: Alex Leonetti
*/

var SPEED = 200;
var GRAVITY = 1;
var LOAD_PLAYER_BOL = false;
var DEAD_PLAYER_X = 1;
var POS_X = 0;
var ANGLE = [];
var RAD_ANGLE = [];
var POS_Y = 0;
var DECELERATE = [];
var ACCELERATE = [];
var RESET = false;
var RESETGAMEOVER = false;
var GAMECONTEXT;
var PLAYERS_ARRAY = [];


/*
  variable declarations
  Description:
   These global variables are necessary in order to clear intervals and timeouts when a level is over, as well as 
   when a player dies. 
  author: Alex Leonetti
*/

var players;

var water;
var waterInterval;
var waterTimeout;

var platforms;
var platformInterval;
var platformFallingInterval;
var platformNegativeInterval;
var platformFloatingInterval;

var groundTimeout;

var flyTimeout;

var orangeDinos;
var orangeDinoInterval;

var purpleDinos;
var purpleDinoInterval;

var laser;
var laserInterval;

var fishes;
var fishInterval;


var music;
var musicArray = ['fox', 'gorillaz', 'lucky'];
var randomSong = Math.floor(Math.random()*3);
var musicReset = false;
var musicLoop = true;
var jumpEffect;
var deadEffect;

/*
  updatePosition
  Description:
   This is what constantly updates POS_X and POS_Y allowing our player to move 
  author: Alex Leonetti
*/

var updatePosition = function(positionArray) {

  for(var i=0; i<positionArray.length; i++) {
    if(positionArray && positionArray[i]) {
      ANGLE[i] = positionArray[i].data.yAngle;
      RAD_ANGLE[i] = ANGLE*(Math.PI / 180)
      DECELERATE[i] = positionArray[i].data.decelerate;
      ACCELERATE[i] = positionArray[i].data.accelerate;
      if(RESET && ACCELERATE[i]) {
        GAMECONTEXT.move();
      }
      if(RESETGAMEOVER && ACCELERATE[i]) {
        GAMECONTEXT.reset();
      }
    }
  }
};

/*
  display
  Description:
   Creates a new display object, connects it to the server, and sets up the updatePosition function
   as the handler for every communciation event 
  author: Alex Leonetti
*/
var display = new Display();
display.connect();
display.setInformationHandler(updatePosition);


/*
  state
  Description:
   The state object of a phaser game typically holds a preload, create, and update function. 
  author: Alex Leonetti
*/
var state = {

  /*
    preload
    Description:
     Loads our assets, spritesheets, and images 
    author: Alex Leonetti
  */
  preload: function() {
    console.log(this)
    this.load.image("platform", "assets/platform.png");
    this.load.image("falling", "assets/falling.png");
    this.load.image("negative", "assets/negative.png");
    this.load.image("ground", "assets/ground.png");
    this.load.image("background", "assets/background.jpg");
    this.load.image("floating", "assets/floating.png");
    // this.load.spritesheet("player", "assets/hero.png", 33.16, 49);
    this.load.image("player", "assets/spaceship.png");
    this.load.spritesheet("fish", "assets/fish.png", 30, 40);
    this.load.spritesheet("orangeDino", "assets/orange-dino.png", 34.5, 42);
    this.load.spritesheet("purpleDino", "assets/purple-dino.png", 118, 150);

    this.load.image("laser", "assets/laser.png");
    this.load.image('water', 'assets/water.png');
    this.load.audio('fox', ['assets/sounds/fox.mp3']);
    this.load.audio('gorillaz', ['assets/sounds/gorillaz.mp3']);
    this.load.audio('lucky', ['assets/sounds/lucky.mp3']);
    this.load.audio('dead', ['assets/sounds/dead.mp3']);
    this.load.audio('jump', ['assets/sounds/jump.mp3']);
  },

  /*
    create
    Description:
     Adds the assets into the game on load
    author: Alex Leonetti
  */
  create: function() {




  /*
    music
    Description:
     Adds one of the three songs from the array randomly.
     Loop starts when song ends.
    author: Brian Chu
  */

    music = game.add.audio(musicArray[randomSong]);
    music.play();
  
    music.onStop.add(function(){
      if(musicLoop === true) {
        music.play()
      }  
    }, this);
   

    /*
      physics
      Description:
       This statement allows the physics engine to be a part of our game
      author: Alex Leonetti
    */
    this.physics.startSystem(Phaser.Physics.ARCADE);

    /*
      background
      Description:
       Creates an autoscrolling world, however the assets in the world do not move automatically
      author: Alex Leonetti
    */
    this.background = this.add.tileSprite(0,0, this.world.width, this.world.height, 'background');
    this.background.autoScroll(-SPEED,0);

    /*
      players
      Description:
       Put the players in a group object for future optimization and multiplayer ability.
       Not being used now.
      author: Alex Leonetti
    */
    players = game.add.group();
    players.enableBody = true;

    /*
      player
      Description:
       Creates the player and adds the animations depending on the position in the sprite sheet
      author: Alex Leonetti
    */
    this.player = players.create(0,0,'player');
    this.player2 = players.create(0,0,'player');
    this.player.anchor.setTo(0.5, 0.5);
    // this.player.animations.add('left', [8,7,6,5], 10, true);
    // this.player.animations.add('right', [1,2,3,4], 10, true);
    // this.player.animations.add('still', [0], 10, true);
    this.physics.arcade.enableBody(this.player);
    this.physics.arcade.enableBody(this.player2);

    /*
      platforms
      Description:
       Object created that holds all types of platforms a player can jump on
      author: Alex Leonetti
    */
    platforms = game.add.group();
    platforms.enableBody = true;   


    water = game.add.group();
    water.enableBody = true; 

    purpleDinos = game.add.group();
    lasers = game.add.group();

    orangeDinos = game.add.group();

    fishes = game.add.group();


    /*
      text
      Description:
       This adds text to a phaser game
      author: Alex Leonetti
    */
    this.scoreText = this.add.text(
      this.world.centerX,
      this.world.height/2,
      "",
      {
          size: "32px",
          fill: "#FFF",
          align: "center"
      }
    );

    this.scoreText.anchor.setTo(0.5, 0.5);

    /*
      reset
      Description:
       Allows the game to load the reset state first when it is created
      author: Alex Leonetti
    */
    this.reset();
  },

  /*
    update
    Description:
     Constantly called by the phaser engine updating all aspects of the game
    author: Alex Leonetti
  */
  update: function() {

    /*
      collide
      Description:
       Phaser has collision detection already, here we declare what the players can collide with
       and what happens when you collide
      author: Alex Leonetti
    */
    this.physics.arcade.collide(players, platforms);
    this.physics.arcade.collide(players, orangeDinos, this.setGameOver, null, this);
    this.physics.arcade.collide(players, purpleDinos, this.setGameOver, null, this);


    this.physics.arcade.overlap(lasers, purpleDinos, function(){
      this.purpleDino.kill();
    }, null, this);

    this.physics.arcade.overlap(lasers, orangeDinos, function(){
      this.orangeDino.kill();
    }, null, this);


    this.physics.arcade.collide(players, fishes, this.setGameOver, null, this);

    /*
      kill()
      Description:
       Kill gets rid of the object in the game. Depending on the level we destroy all objects
       once they are off of the screen.
      author: Alex Leonetti
    */
    if(this.level === 'ground') {
      orangeDinos.forEach(function(o) {
        if(o && o.body.x < -100) {
          o.kill();
        }
      });
      purpleDinos.forEach(function(p) {
        if(p && p.body.x < -150) {
          p.kill();
        }
      });
      lasers.forEach(function(l) {
        if(l && l.body.x > 1000 || l.body.y > 1000 || l.body.y < -1000) {
          l.kill();
        }
      });
    }

    if(this.level === 'water') {
      water.forEach(function(w) {
        if(w.body.x < -350) {
          w.kill();
        }
      });
      platforms.forEach(function(p){
        if(p.body.x < -800 || p.body.y < -48 ) {
          p.kill();
        }
      });
      fishes.forEach(function(f) {
        if(f.body.x < - 100) {
          f.kill();
        }
      });
    }


    /*
      Velocity
      Description:
        Updates the character's velocity in game
      author: Alex Leonetti
    */
    // PLAYER 1
    if (this.player.body.x>1 && !this.player.dead){
      // This sets the player's angle smoothly
      this.player.angle = this.player.angle + (ANGLE[0] - this.player.angle)*.25;
    }
    
    // PLAYER 2
    if (this.player2.body.x>1 && !this.player2.dead){
      // This sets the player's angle smoothly
      this.player2.angle = this.player2.angle + (ANGLE[0] - this.player2.angle)*.25;
    }
    // PLAYER 1
    if(DECELERATE[0] && !this.player.dead) {
      this.player.body.velocity.x += Math.cos(RAD_ANGLE[0])*(-20);
      this.player.body.velocity.y += Math.sin(RAD_ANGLE[0])*(-20);
    } else if(ACCELERATE[0] && !this.player.dead){
      this.player.body.velocity.x += Math.cos(RAD_ANGLE[0])*20;
      this.player.body.velocity.y += Math.sin(RAD_ANGLE[0])*20;
    } else {
      this.player.body.velocity.x *= .9;
      this.player.body.velocity.y *= .9;
    }

    // PLAYER 2
    if(DECELERATE[1] && !this.player2.dead) {
      this.player2.body.velocity.x += Math.cos(RAD_ANGLE[0])*(-20);
      this.player.body.velocity.y += Math.sin(RAD_ANGLE[0])*(-20);
    } else if(ACCELERATE[1] && !this.player.dead){
      this.player.body.velocity.x += Math.cos(RAD_ANGLE[0])*20;
      this.player.body.velocity.y += Math.sin(RAD_ANGLE[0])*20;
    } else {
      this.player.body.velocity.x *= .9;
      this.player.body.velocity.y *= .9;
    }
    
 

    /*
      animations
      Description:
        Depending on the velocity of the character it will change character animations
      author: Alex Leonetti
    */
    if(this.gameStarted){
      if(this.player.body.velocity.x > 0 && this.player.body.x<770){
        // this.player.animations.play('still');
      } else if(this.player.body.velocity.x < -99 && this.player.body.x>10){
        // this.player.animations.play('still');
      } 

      if(this.player.body.x <= 10) {
        // this.player.animations.play('still');
        this.player.body.x = 10;
      } 


      if (this.player.body.y <= 25){
        this.player.body.y = 25;
        // this.player.animations.play('still');
      } 

      if (this.player.body.x >= 730) {
        this.player.body.x = 730
      }

    }
    

    // console.log(this.player.body.x);
    // console.log(this.player.body.y);



    /*
      GameOver
      Description:
        If player falls below the bottom of the world setGameOver. Do the same if the player is touching
        a platform above the world's top.
      author: Alex Leonetti
    */
    if(!this.gameOver){
      if(this.player.body.bottom >= this.world.bounds.bottom + 48){
        this.player.dead = true;
        this.setGameOver();
      }
      if(this.player.body.bottom <= this.world.bounds.top - 30 && this.player.body.touching.down) {
        this.player.dead = true;
        this.setGameOver();
      }
    }
  },

  /*
    Reset
    Description:
      The loading screen, must clear all intervals and timeouts in order for game to function correctly.
      Must also remove all group objects so the game starts from scratch.
    author: Alex Leonetti
  */

  reset:function() {
    DECELERATE = [];
    ACCELERATE = [];
    GAMECONTEXT = this;

    clearInterval(waterInterval);
    clearInterval(platformInterval);
    clearInterval(platformFallingInterval);
    clearInterval(platformNegativeInterval);

    clearInterval(platformFloatingInterval);
    clearInterval(purpleDinoInterval);
    clearInterval(orangeDinoInterval);
    clearInterval(fishInterval);

    clearTimeout(waterTimeout);
    clearTimeout(groundTimeout);
    clearTimeout(flyTimeout);

    

    this.player.dead = false;
    platforms.removeAll();
    water.removeAll();
    orangeDinos.removeAll();
    purpleDinos.removeAll();
    lasers.removeAll();
    fishes.removeAll();
    this.gameStarted = false;
    this.gameOver = false;

    /*
      Music Reset
      Description:
        musicReset set to false to prevent music.play() from being called again.
        Music plays from here on reset of the game.
      author: Brian Chu
    */

    if(musicReset === true) {
      musicLoop = true;
      musicReset = false;
      music.play();

      music.onStop.add(function(){
        if(musicLoop === true) {
          music.play()
        }  
      }, this);
    }


    this.player.reset(this.world.width / 4, 487);
    this.player.dead = true;
    // this.player.animations.play('right');

    this.ground = platforms.create(0, game.world.height-64, 'ground');
    this.ground.scale.setTo(20,2);
    this.ground.body.immovable = true;

    this.background.autoScroll(-SPEED * .30 ,0);

    this.scoreText.setText("PRESS + TO ADD PLAYER\n\nPRESS JUMP TO\nSTART GAME");

    setTimeout(function() {
      RESET = true;
    }, 1000);

  },

  /*
    Start / Move
    Description:
      When called will start the game,
      loads the first level, sets timeouts for each corresponding level,
      clears the timeouts on death
    author: Alex Leonetti
  */
  start: function() {  
    var context = this;

    this.player.dead = false;  
    this.player.body.gravity.y = GRAVITY;
    this.scoreText.setText("");
    this.gameStarted = true;
    this.background.autoScroll(-SPEED * .40 ,0);
    this.ground.body.velocity.x = -SPEED;

    this.levelGround();
    waterTimeout = setTimeout(function(){
      context.levelWater();
    }, 20000);

    groundTimeout = setTimeout(function(){
      context.levelGround();
    }, 38000);

    flyTimeout = setTimeout(function() {
      context.levelFly();
    }, 58000);
       
  },
  move: function(){
    if(!this.gameStarted){
      clearInterval(waterInterval);
      clearInterval(platformInterval);
      clearInterval(platformFallingInterval);
      clearInterval(platformNegativeInterval);

      clearInterval(platformFloatingInterval);
      clearInterval(purpleDinoInterval);
      clearInterval(orangeDinoInterval);

      clearTimeout(waterTimeout);
      clearTimeout(groundTimeout);
      clearTimeout(flyTimeout);

      RESET = false;
      RESETGAMEOVER = false;

      this.lastNum = 500;
      this.start();
    }

    if(this.gameOver){
      this.reset();
    }
  },

  /*
    setGameOver
    Description:
      Restores variables
    author: Alex Leonetti
  */
  setGameOver: function() {
    RESETGAMEOVER = true;

    this.gameOver = true;
    this.gameStarted = false;
    this.scoreText.setText("PRESS JUMP TO\nTRY AGAIN");
    this.background.autoScroll(0, 0);
    this.player.dead = true;
    this.player.body.x = (32 * DEAD_PLAYER_X);
    this.player.body.y = 0;
    this.player.body.gravity.y = 0;
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    // this.player.animations.play('still'); 

    deadEffect = game.add.audio('dead');
    deadEffect.play();

    /*
      Music Stop
      Description:
       Checks musicArray index, randomSong. Increases to the next song, or starts back at 0 if index is at the end.
      author: Brian Chu
    */
    if(randomSong === 2) {
      randomSong = 0;
    } else {
      randomSong++
    }

    /*
      musicReset
      Description:
       musicReset set to true to allow music to be played inside the "reset" function.
       musicLoop set to false to prevent music from playing music.onStop in the "create" function.
      author: Brian Chu
    */
    musicReset = true;
    musicLoop = false;
    music.stop();
    music = game.add.audio(musicArray[randomSong]);

    // this.input.onDown.removeAll();
    // this.input.onDown.add(this.reset, this);
  },

  /*
    spawnPlatforms / spawnFish / spawnDinos
    Description:
      These all generate the corresponding items
    author: Alex Leonetti
  */
  spawnPlatform: function() {
    this.ledge = platforms.create(800, this.generateRandomY(), 'platform');
    this.ledge.body.immovable = true;
    this.ledge.body.velocity.x = -SPEED;
    this.ledge.scale.setTo(2,1);
  },
  spawnFallingPlatform: function() {
    this.ledge = platforms.create(800, this.generateRandomY(), 'falling');
    this.ledge.body.immovable = false;
    this.ledge.body.velocity.x = -SPEED;
    this.ledge.scale.setTo(2,1);
  },
  spawnNegativePlatform: function() {
    this.ledge = platforms.create(800, 600, 'negative');
    this.ledge.body.immovable = true;
    this.ledge.body.velocity.x = -SPEED;
    this.ledge.body.velocity.y =  -(Math.random() * 200);
    this.ledge.scale.setTo(2,1);
  },
  spawnFloatingPlatform: function(y) {
    this.ledge = platforms.create(800, y || this.generateRandomGreaterY(), 'floating');
    this.ledge.body.immovable = true;
    this.ledge.body.velocity.x = -SPEED;
    this.ledge.scale.setTo(2,2);
  },
  spawnWater: function() {
    var context = this;
    waterInterval = setInterval(function(){
      context.water = water.create(800, 570, 'water');
      context.water.body.immovable = true;
      context.water.body.velocity.x = -SPEED;
    },3315/(SPEED/100));
    
  },

  /*
    generateRandomY
    Description:
      The function to spawn platforms within jumping range and able to fill entire screen
    author: Alex Leonetti
  */
  generateRandomY: function() {
    this.lastNum = this.lastNum || 500;
    this.lastNum = this.lastNum +  (Math.random() * 300 - 100);
    if(this.lastNum > 550) {
      this.lastNum = 400;
    }
    if(this.lastNum < 100) {
      this.lastNum = 300;
    }
    return this.lastNum;
  },

  /*
    generateRandomGreaterY
    Description:
      The function to spawn platforms within jumping range and stays on the upper part of the screen
    author: Alex Leonetti
  */
  generateRandomGreaterY: function() {
    this.lastGreaterNum = this.lastGreaterNum || 450;
    this.lastGreaterNum = this.lastGreaterNum +  (Math.random() * 200 - 100);
    if(this.lastGreaterNum > 500) {
      this.lastGreaterNum = 300;
    }
    if(this.lastGreaterNum < 100) {
      this.lastGreaterNum = 300;
    }
    return this.lastGreaterNum;
  },
  spawnOrangeDino: function() {
    this.orangeDino = orangeDinos.create(800, 495, 'orangeDino');
    this.orangeDino.animations.add('walk', [0,1,2,3], 10, true);
    this.orangeDino.animations.play('walk');
    this.physics.arcade.enableBody(this.orangeDino);
    this.orangeDino.body.immovable = true;
    this.orangeDino.body.velocity.x = -SPEED - 50;
  },
  spawnPurpleDino: function() {
    this.purpleDino = purpleDinos.create(1000, 390, 'purpleDino');
    this.purpleDino.animations.add('walk', [0,1,2,3], 10, true);
    this.purpleDino.animations.play('walk');
    this.physics.arcade.enableBody(this.purpleDino);
    this.purpleDino.body.immovable = true;
    this.purpleDino.body.velocity.x = -SPEED - 80;
  },

  spawnLaser: function(x,y) {
    this.laser = lasers.create(x, y, 'laser');
    this.physics.arcade.enableBody(this.laser);
    this.laser.body.immovable = true;
    this.laser.anchor.setTo(.5, .5);
    this.laser.body.velocity.x = Math.cos(RAD_ANGLE[0])*300;
    this.laser.body.velocity.y = Math.sin(RAD_ANGLE[0])*300;
    this.laser.angle = ANGLE[0];
  },
  spawnFish: function() {
    this.fish = fishes.create(700, 650, 'fish');
    this.fish.animations.add('fly', [0,1], 10, true);
    this.fish.animations.play('fly');
    this.physics.arcade.enableBody(this.fish);
    this.fish.body.immovable = true;
    this.fish.body.velocity.y = -900;
    this.fish.body.velocity.x = -SPEED;
    this.fish.body.gravity.y = GRAVITY;
  },


  /*
    levelWater
    Description:
      Everything spawned for the water level
    author: Alex Leonetti
  */
  levelWater: function() {
    this.level = 'water';

    clearInterval(platformFloatingInterval);
    clearInterval(purpleDinoInterval);
    clearInterval(orangeDinoInterval);

    this.ground = platforms.create(0, game.world.height-64, 'ground');
    this.ground.scale.setTo(2,2);
    this.ground.body.immovable = true;
    this.ground.body.velocity.x = -SPEED;


    this.spawnPlatform();
    this.water = water.create(800, 570, 'water');
    this.water.immovable = true;
    this.water.body.velocity.x = -SPEED;
    this.spawnWater();

    var context = this;
    if(this.gameStarted) {
      platformInterval = setInterval(function(){
        context.spawnPlatform();
      }, 3000/(SPEED/100));
      platformFallingInterval = setInterval(function(){
        context.spawnFallingPlatform();
      }, (2000)/(SPEED/100));
      platformNegativeInterval = setInterval(function(){
        context.spawnNegativePlatform();
      }, 8000/(SPEED/100));
      fishInterval = setInterval(function() {
        context.spawnFish();
      }, 4900/(SPEED/100));
    } 
  },



  /*
    levelGround
    Description:
      Everything spawned for the ground level
    author: Alex Leonetti
  */
  levelGround: function() {
    this.level = 'ground';
    var context = this;

    clearInterval(platformInterval);
    clearInterval(platformFallingInterval);
    clearInterval(platformNegativeInterval);
    clearInterval(waterInterval);
    clearInterval(fishInterval);
    clearInterval(laserInterval);


    this.ground = platforms.create(800, game.world.height-64, 'ground');
    this.ground.scale.setTo(20,2);
    this.ground.body.immovable = true;
    this.ground.body.velocity.x = -SPEED;


    this.spawnFloatingPlatform(350);

    platformFloatingInterval = setInterval(function() {
      context.spawnFloatingPlatform();
    }, 3000/(SPEED/100));

    purpleDinoInterval = setInterval(function() {
      context.spawnPurpleDino();
    }, 6000/(SPEED/100));

    laserInterval = setInterval(function() {
      var xPosition = context.player.body.x + context.player.body.halfWidth;
      var yPosition = context.player.body.y + context.player.body.halfHeight+10;
      var xOffset = Math.cos(RAD_ANGLE[0])*60;
      var yOffset = Math.sin(RAD_ANGLE[0])*60;
      context.spawnLaser(xPosition + xOffset, yPosition + yOffset);
    }, 200);

    orangeDinoInterval = setInterval(function() {
      context.spawnOrangeDino();
    }, 5000/(SPEED/100));

  },

  /*
    levelFly
    Description:
      Everything spawned for the water level and planning on adding other enemies
    author: Alex Leonetti
  */
  levelFly: function() {
    var context = this;
    this.levelWater();
  }
}

/*
  game
  Description:
    The creation of the actual game.
    Uses the state object within the phaser game.
  author: Alex Leonetti
*/
var game = new Phaser.Game(
  800,
  600,
  Phaser.AUTO,
  'game',
  state
)