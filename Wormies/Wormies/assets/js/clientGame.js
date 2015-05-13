var stage;
var FPS = 30;
var ready = false;
var keys = [];

var manifest = [
    { src: "ball.jpg", id: "ball" },
    { src: 'SpriteSheet.png', id: 'mySprites' }
];
var queue;
function loadFiles(){
    queue = new createjs.LoadQueue(true, 'imgs/');
    queue.on("complete", loadComplete, this);
    queue.loadManifest(manifest);
}
function loadComplete(evt){
    var ballimg = new createjs.Bitmap(queue.getResult("ball"));
    stage.addChild(ballimg);
    projectiles.forEach(function (projectile){
        if (projectile.type == "ball") {
            projectile.shape = ballimg;
        }
    })
    
    var player1SpriteSheet = new createjs.SpriteSheet( {
        images: [queue.getResult('mySprites')],
        frames: { width: 50, height: 50, count: 40, regX: 0, regY: 0, spacing: 0, margin: 0 },
        animations: {
            idle: [0, 9, 'idle', .5],
            walk: [10, 19, 'walk', .5],
            walkShoot: [20, 29, 'walk', .5],
            jump: [30, 33, 'airIdle', .1],
            airIdle: [34, 35, 'fall', .1],
            fall: [36, 39, 'fall', .1]
        }
    });
    createjs.SpriteSheetUtils.addFlippedFrames(player1SpriteSheet, true, false, false);

    player1.shape = new createjs.Sprite(player1SpriteSheet);
    stage.addChild(player1.shape);
    player1.shape.gotoAndPlay('idle');
    ready = true;
}

function setupStage(){
    loadFiles();
    var canvas = document.getElementById('game');
    canvas.width = 800;
    canvas.height = 600;
    stage = new createjs.Stage(canvas);
    
    players.forEach(function (player){
        if(player.shape != null)
        stage.addChild(player.draw());
    })
    projectiles.forEach(function (projectile) {
        if(projectile.shape != null)
        stage.addChild(projectile.draw());
    });
    platforms.forEach(function (platform) {
        if(platform.shape != null)
        stage.addChild(platform.draw());
    });
}

var animation = Object.freeze({
    IDLE: 'idle',
    LEFT: 'left',
    RIGHT: 'right',
    JUMP: 'jump',
});

function move(){
    var socket = io.connect();

    onkeydown = onkeyup = function (e) {
        e = e || event;
        e.preventDefault();
        keys[e.keyCode] = e.type == 'keydown';
    };
    var KEYCODE_LEFT = 65;//a
    var KEYCODE_UP = 32;//space   /*87;//w*/
    var KEYCODE_RIGHT = 68;//d
    //var KEYCODE_DOWN = 83;//s
    
    var MOVEING_LEFT = keys[KEYCODE_LEFT];
    var MOVEING_UP = keys[KEYCODE_UP];
    var MOVEING_RIGHT = keys[KEYCODE_RIGHT];
    //var MOVEING_DOWN = keys[KEYCODE_DOWN];
    
    if (MOVEING_LEFT) {// a
        socket.emit('player move', 'left');
        if (!MOVEING_UP) {
            setAnimation("left");
        }
    }
    
    if (MOVEING_RIGHT) {// d
        socket.emit('player move', 'right');
        if (!MOVEING_UP) {
            setAnimation('right');
        }
    }
    
    if (MOVEING_UP) {//space
        socket.emit('player move', 'up');
        setAnimation("jump");
    }
    
    if (!MOVEING_UP) {
            socket.emit('player move', 'down');
    }

    if(!MOVEING_LEFT && !MOVEING_RIGHT && !MOVEING_UP) {
        setAnimation("idle");
    }
}

function setAnimation(direction){
    if (direction == animation.LEFT) {
        if (player1.shape.currentAnimation != 'walk_h') {
            player1.shape.gotoAndPlay("walk_h");
        }
    }
    if (direction == animation.RIGHT) {
        if (player1.shape.currentAnimation != 'walk') {
            player1.shape.gotoAndPlay('walk');
        }
    }
    if (direction == animation.JUMP) {
        if(player1.shape.currentAnimation != 'jump' && player1.shape.currentAnimation != 'jump_h')
        if (player1.shape.currentAnimation.contains('_h')) {
            player1.shape.gotoAndPlay('jump_h');
        }
        else {
            player1.shape.gotoAndPlay('jump');
        }
    }
    if (direction == animation.IDLE) {
        if (player1.shape.currentAnimation != 'idle' && player1.shape.currentAnimation != 'idle_h') {
            if (player1.shape.currentAnimation.contains('_h')) {
                player1.shape.gotoAndPlay("idle_h");
            } else {
                player1.shape.gotoAndPlay("idle");
            }
        }
    }
};

var ball = {
    radius: 25,
    shape: null,
    draw: function () {
        return (this.shape);
    }
}

var projectiles = [];
for (var i = 0; i < 1; i++) {
    var ballCopy = JSON.parse(JSON.stringify(ball));
    ballCopy.type = "ball";
    ballCopy.draw = ball.draw;
    projectiles.push(ballCopy);
}

var plank = {
    size: {height: 20, width: 100},
    color: "black",
    shape: new createjs.Shape(),
    draw: function (){
        this.shape.graphics.beginFill(this.color).drawRect(0, 0, this.size.width, this.size.height);
        this.shape.x = this.shape.y = -150;
        return this.shape;
    }
};
var platforms = [];
for (var i = 0; i < 3; i++) {
    var add = JSON.parse(JSON.stringify(plank));
    add.shape = new createjs.Shape();
    add.draw = plank.draw;
    platforms.push(add);
}

var players = [
    player1 = {
        shape: null,
        draw: function () {
            this.shape.x = this.shape.y = -150;
            return this.shape;
        }
    },
    player2 = {
        width: 50,
        height: 50,
        color: 'green',
        shape: new createjs.Shape(),
        draw: function () {
            this.shape.graphics.beginFill(this.color).drawRect(0, 0, this.width, this.height);
            this.shape.x = this.shape.y = -150;
            return this.shape;
        }
    },
    player3 = {
        width: 50,
        height: 50,
        color: 'orange',
        shape: new createjs.Shape(null),
        draw: function () {
            this.shape.graphics.beginFill(this.color).drawRect(0, 0, this.width, this.height);
            this.shape.x = this.shape.y = -150;
            return this.shape;
        }
    },
    player4 = {
        width: 50,
        height: 50,
        color: 'purple',
        shape: new createjs.Shape(),
        draw: function () {
            this.shape.graphics.beginFill(this.color).drawRect(0, 0, this.width, this.height);
            this.shape.x = this.shape.y = -150;
            return this.shape;
        }
    }
];

function update(positions) {
    if (ready) {
        move();
        positions.forEach(function (group) {
            if (group.type == "players") {
                group.objects.forEach(function (player) {
                    players[player.id - 1].shape.x = player.position.x;
                    players[player.id - 1].shape.y = player.position.y;
                });
            }
            if (group.type == 'projectile') {
                group.objects.forEach(function (projectile) {
                    projectiles[projectile.id - 1].shape.x = projectile.position.x;
                    projectiles[projectile.id - 1].shape.y = projectile.position.y;
                });
            }
            if (group.type == 'platform') {
                group.objects.forEach(function (platform) {
                    platforms[platform.id].shape.x = platform.position.x;
                    platforms[platform.id].shape.y = platform.position.y;
                });
            }
        });
        stage.update();
    }
}

function main(){
    setupStage();
}

if(!!(window.addEventListener)){
    window.addEventListener("DOMContentLoaded", main);
}
else{
    window.attachEvent("onload", main);
}