const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RIGHT = 39;
const KEY_LEFT = 37;
const KEY_SPACE = 32;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const STATE = {
  x_pos : 0,
  y_pos : 0,
  move_right: false,
  move_left: false,
  shoot: false,
  lasers: [],
  enemyLasers: [],
  enemies : [],
  spaceship_width: 50,
  enemy_width: 50,
  cooldown : 0,
  number_of_enemies: 16,
  enemy_cooldown : 0,
  gameOver: false
}

// General purpose functions
function setPosition($element, x, y) {
  $element.style.transform = `translate(${x}px, ${y}px)`;
}

function setSize($element, width) {
  $element.style.width = `${width}px`;
  $element.style.height = "auto";
}

function bound(x){
  if (x >= GAME_WIDTH-STATE.spaceship_width){
    STATE.x_pos = GAME_WIDTH-STATE.spaceship_width;
    return GAME_WIDTH-STATE.spaceship_width
  } if (x <= 0){
    STATE.x_pos = 0;
    return 0
  } else {
    return x;
  }
}

function collideRect(rect1, rect2){
  return!(rect2.left > rect1.right || 
    rect2.right < rect1.left || 
    rect2.top > rect1.bottom || 
    rect2.bottom < rect1.top);
}

// Enemy 
function createEnemy($container, x, y){
  const $enemy = document.createElement("img");
  $enemy.src = "img/ufo.png";
  $enemy.className = "enemy";
  $container.appendChild($enemy);
  const enemy_cooldown = Math.floor(Math.random()*100);
  const enemy = {x, y, $enemy, enemy_cooldown}
  STATE.enemies.push(enemy);
  setSize($enemy, STATE.enemy_width);
  setPosition($enemy, x, y)
}

function updateEnemies($container){
  const dx = Math.sin(Date.now()/1000)*40;
  const dy = Math.cos(Date.now()/1000)*30;
  const enemies = STATE.enemies;
  for (let i = 0; i < enemies.length; i++){
    const enemy = enemies[i];
    var a = enemy.x + dx;
    var b = enemy.y + dy;
    setPosition(enemy.$enemy, a, b);
    enemy.cooldown = Math.random(0,100);
    if (enemy.enemy_cooldown == 0){
      createEnemyLaser($container, a, b);
      enemy.enemy_cooldown = Math.floor(Math.random()*150)+150 ;
    }
    enemy.enemy_cooldown -= 0.5;
  }
}

// Player
function createPlayer($container) {
  STATE.x_pos = GAME_WIDTH / 2;
  STATE.y_pos = GAME_HEIGHT - 50;
  const $player = document.createElement("img");
  $player.src = "img/spaceship.png";
  $player.className = "player";
  $container.appendChild($player);
  setPosition($player, STATE.x_pos, STATE.y_pos);
  setSize($player, STATE.spaceship_width);
}

function updatePlayer(){
  if(STATE.move_left){
    STATE.x_pos -= 3;
  } if(STATE.move_right){
    STATE.x_pos += 3;
  } if(STATE.shoot && STATE.cooldown == 0){
    createLaser($container, STATE.x_pos - STATE.spaceship_width/2, STATE.y_pos);
    STATE.cooldown = 30;
  }
  const $player = document.querySelector(".player");
  setPosition($player, bound(STATE.x_pos), STATE.y_pos-10);
  if(STATE.cooldown > 0){
    STATE.cooldown -= 0.5;
  }
}

// Player Laser
function createLaser($container, x, y){
  const $laser = document.createElement("img");
  $laser.src = "img/laser.png";
  $laser.className = "laser";
  $container.appendChild($laser);
  const laser = {x, y, $laser};
  STATE.lasers.push(laser);
  setPosition($laser, x, y);
}

function updateLaser($container){
  const lasers = STATE.lasers;
  for(let i = 0; i < lasers.length; i++){
    const laser = lasers[i];
    laser.y -= 2;
    if (laser.y < 0){
      deleteLaser(lasers, laser, laser.$laser);
    }
    setPosition(laser.$laser, laser.x, laser.y);
    const laser_rectangle = laser.$laser.getBoundingClientRect();
    const enemies = STATE.enemies;
    for(let j = 0; j < enemies.length; j++){
      const enemy = enemies[j];
      const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
      if(collideRect(enemy_rectangle, laser_rectangle)){
        deleteLaser(lasers, laser, laser.$laser);
        const index = enemies.indexOf(enemy);
        enemies.splice(index,1);
        $container.removeChild(enemy.$enemy);
      }
    }
  }
}

// Enemy Laser
function createEnemyLaser($container, x, y){
  const $enemyLaser = document.createElement("img");
  $enemyLaser.src = "img/enemyLaser.png";
  $enemyLaser.className = "enemyLaser";
  $container.appendChild($enemyLaser);
  const enemyLaser = {x, y, $enemyLaser};
  STATE.enemyLasers.push(enemyLaser);
  setPosition($enemyLaser, x, y);
}

function updateEnemyLaser($container){
  const enemyLasers = STATE.enemyLasers;
  for(let i = 0; i < enemyLasers.length; i++){
    const enemyLaser = enemyLasers[i];
    enemyLaser.y += 1;
    if (enemyLaser.y > GAME_HEIGHT-30){
      deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
    }
    const enemyLaser_rectangle = enemyLaser.$enemyLaser.getBoundingClientRect();
    const spaceship_rectangle = document.querySelector(".player").getBoundingClientRect();
    if(collideRect(spaceship_rectangle, enemyLaser_rectangle)){
      STATE.gameOver = true;
    }
    setPosition(enemyLaser.$enemyLaser, enemyLaser.x + STATE.enemy_width/2, enemyLaser.y+15);
  }
}

// Delete Laser
function deleteLaser(lasers, laser, $laser){
  const index = lasers.indexOf(laser);
  lasers.splice(index,1);
  $container.removeChild($laser);
}

// Key Presses
function KeyPress(event) {
  if (event.keyCode === KEY_RIGHT) {
    STATE.move_right = true;
  } else if (event.keyCode === KEY_LEFT) {
    STATE.move_left = true;
  } else if (event.keyCode === KEY_SPACE) {
    STATE.shoot = true;
  }
}

function KeyRelease(event) {
  if (event.keyCode === KEY_RIGHT) {
    STATE.move_right = false;
  } else if (event.keyCode === KEY_LEFT) {
    STATE.move_left = false;
  } else if (event.keyCode === KEY_SPACE) {
    STATE.shoot = false;
  }
}

// Main Update Function
function update(){
  updatePlayer();
  updateEnemies($container);
  updateLaser($container);
  updateEnemyLaser($container);

  window.requestAnimationFrame(update);
  
  if (STATE.gameOver) {
    document.querySelector(".lose").style.display = "block";
  } if (STATE.enemies.length == 0) {
    document.querySelector(".win").style.display = "block";
  }
}

function createEnemies($container) {
  for(var i = 0; i <= STATE.number_of_enemies/2; i++){
    createEnemy($container, i*80, 100);
  } for(var i = 0; i <= STATE.number_of_enemies/2; i++){
    createEnemy($container, i*80, 180);
  }
}

// Initialize the Game
const $container = document.querySelector(".main");
createPlayer($container);
createEnemies($container);

// Key Press Event Listener
window.addEventListener("keydown", KeyPress);
window.addEventListener("keyup", KeyRelease);
update();