
let canvas = document.getElementById('gamearea');

let ctx = canvas.getContext('2d');
const gamewidth = 800;
const gameheight = 600;
const gamestate = {
  pause:0,
  running:1,
  menu:2,
  gameover:3
}

class Paddle {
  constructor(game) {
    this.gamewidth = game.gamewidth;
    this.height = 20;
    this.width = 150;
    this.maxspeed = 7;
    this.speed = 0;
    this.position = {
      x: game.gamewidth / 2 - this.width / 2,
      y: game.gameheight - this.height - 10
    };
  }
  moveleft() {
    this.speed = -this.maxspeed;
  }
  moveright() {
    this.speed = this.maxspeed;
  }
  stop() {
    this.speed = 0;
  }
  draw(ctx) {
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {

    this.position.x += this.speed;
    if (this.position.x < 0) {
      this.position.x = 0;
    }
    if (this.position.x + this.width > this.gamewidth) {
      this.position.x = this.gamewidth - this.width;
    }
  }
}
//class keybord inputs
class Inputhandle {
  constructor(paddle,game) {
    document.addEventListener('keydown', event => {

      switch (event.keyCode) {
        case 37:
          paddle.moveleft()
          break;
        case 39:
          paddle.moveright()
          break;
        case 27:
        game.togglepause();
        break;
        case 32:
        game.start();
        break;
      }
    })
    document.addEventListener('keyup', event => {

      switch (event.keyCode) {
        case 37:
          if (paddle.speed < 0) paddle.stop()
          break;
        case 39:
          if (paddle.speed > 0) paddle.stop()
          break;


      }
    })
  }
}
//ball constructor
class Ball {
  constructor(game) {
    this.gamewidth = game.gamewidth;
    this.gameheight = game.gameheight;
    this.image = document.getElementById('ball');
    this.game = game;
    this.position = {
      x: 10,
      y: 400,
    }
    this.speed = {
      x: 2,
      y: -2
    }
    this.size = 16
  }
  draw(ctx) {
    ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size)
  }
  update(deltatime) {
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
    if (this.position.x + this.size > this.gamewidth || this.position.x < 0) {
      this.speed.x = -this.speed.x;
    }
    if(this.position.y < 0){
     this.speed.y = -this.speed.y;
    }
    if (this.position.y + this.size > this.gameheight ){
      this.game.lives--;
    }
    if(detectcollision(this,this.game.paddle)){
      this.speed.y = -this.speed.y;
      this.position.y = this.game.paddle.position.y - this.size;
    }


  }
}

//brick constructor
class Brick{
  constructor(game,position){
    this.image = document.getElementById('brick');
    this.position = position;
    this.game = game;
    this.height = 24;
    this.width = 80;
    this.markfordeletion = false;
  }
  update(){
if(detectcollision(this.game.ball,this)){
  this.game.ball.speed.y =  -this.game.ball.speed.y;
  this.markfordeletion = true;
}
  }
  draw(ctx){
    ctx.drawImage(this.image,this.position.x,this.position.y,this.width,this.height)
  }
}
//level1
function buildlevel(game,level){
  let bricks = [];
  level.forEach((row,rowindex) =>{
    row.forEach((brick,brickindex) => {
      if(brick === 1){
        let position = {
          x: 80 * brickindex,
          y: 75 + 24 * rowindex
        };
        bricks.push(new Brick(game,position))
      }

    })
  })
  return bricks;
}
let level1 = [
  [0,1,0,1,0,1,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1]
]
function detectcollision(ball,gameobj){
  let topofball = ball.position.y ;
  let bottofball = ball.position.y + ball.size;
  let topofobj = gameobj.position.y;
  let leftofobj = gameobj.position.x;

  let rightofobj = gameobj.position.x + gameobj.width
  let bottomofobj = gameobj.position.y + gameobj.height;
  if(
    bottofball >= topofobj &&
    topofball <= bottomofobj &&
    ball.position.x >= leftofobj &&
    ball.position.x  + ball.size <= rightofobj
  ){
    return true;
  } else {
    return false;
  }
}




//game constructor
class Game {
  constructor(gamewidth,gameheight){
    this.gamewidth = gamewidth;
    this.gameheight = gameheight;
    this.paddle = new Paddle(this);
    this.ball = new Ball(this);
      new Inputhandle(this.paddle,this);
      this.gamestate = gamestate.menu;
      this.gameobjs = [];
      this.lives = 1;

  }
  start(){
if(this.gamestate !== gamestate.menu)return;

    let bricks = buildlevel(this,level1) ;


    this.gameobjs = [this.paddle,this.ball,...bricks];
    this.gamestate = gamestate.running
  }
  update(deltatime){
    if(this.lives == 0){
      this.gamestate = gamestate.gameover
    }
    if(this.gamestate === gamestate.pause || this.gamestate === gamestate.menu || this.gamestate === gamestate.gameover)return;
    this.gameobjs.forEach(obj => obj.update(deltatime));
    this.gameobjs = this.gameobjs.filter(obj => !obj.markfordeletion)
  }
  draw(ctx){
    this.gameobjs.forEach(obj => obj.draw(ctx));
    if(this.gamestate == gamestate.pause){
    ctx.rect(0,0,this.gamewidth,this.gameheight);
    ctx.fiilStyle = 'rgba(10,0,10,0.5)';
    //ctx.fill();
    ctx.font = " 60px Ariel";
    ctx.fillStyle = 'black';
    ctx.textAlign= 'center';
    ctx.fillText("paused",this.gamewidth/2,this.gameheight/2)
  }
  if(this.gamestate == gamestate.menu){
  ctx.rect(0,0,this.gamewidth,this.gameheight);
  ctx.fiilStyle = 'rgba(0,0,0,0.1)';
  //ctx.fill();
  ctx.font = " 30px Ariel";
  ctx.fillStyle = 'black';
  ctx.textAlign= 'center';
  ctx.fillText("press SPACE BAR to start",this.gamewidth/2,this.gameheight/2)
}
if(this.gamestate == gamestate.gameover){
ctx.rect(0,0,this.gamewidth,this.gameheight);
ctx.fiilStyle = 'rgba(0,0,0,0.1)';
//ctx.fill();
ctx.font = " 30px Ariel";
ctx.fillStyle = 'black';
ctx.textAlign= 'center';
ctx.fillText("gameover",this.gamewidth/2,this.gameheight/2)
}
  }
  togglepause(){
    if(this.gamestate == gamestate.pause){
      this.gamestate = gamestate.running;
    }else{
      this.gamestate = gamestate.pause
    }
  }

}

let game = new Game(gamewidth,gameheight);

  let lasttime = 0;

  function gameloop(timestamp) {

    let deltatime = timestamp - lasttime;
    lasttime = timestamp
    ctx.clearRect(0, 0, 800, 600);
    game.update(deltatime);
    game.draw(ctx);

    requestAnimationFrame(gameloop)
  }
  requestAnimationFrame(gameloop)
