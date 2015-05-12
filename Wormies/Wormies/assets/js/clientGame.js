var stage;
var FPS = 30;
var ready = false;
var keys = [];

var manifest = [
    { src: "ball.jpg", id: "ball" },
    { src: 'SpriteSheet.png', id: 'mySprites' }
];
var queue;
var ballimg;
function loadFiles(){
    queue = new createjs.LoadQueue(true, 'imgs/');
    queue.on("complete", loadComplete, this);
    queue.loadManifest(manifest);
}
function loadComplete(evt){
    ballimg = new createjs.Bitmap(queue.getResult("ball"));
    stage.addChild(ballimg);
    projectiles.forEach(function (projectile){
        if (projectile.type == "ball") {
            projectile.shape = ballimg;
        }
    })
    
    var player1SpriteSheet = new createjs.SpriteSheet({
        images: [queue.getResult('mySprites')],
        frames: { width: 50, height: 50, count: 30, regX: 0, regY: 0, spacing: 0, margin: 0 },
        animations: {
            idle: [0, 9, 'idle', .5],
            walkRight: [10, 19, 'walkRight',.5],
            jump: [20, 23, 'airIdle', .5],
            airIdle: [24, 25, 'fall', .5],
            fall: [26, 29, 'fall', .5]
        }
    });    
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
        }
        
        if (MOVEING_RIGHT) {// d
            socket.emit('player move', 'right');
        }
        
        if (MOVEING_UP) {//space
            socket.emit('player move', 'up');
        }
        
    if (!MOVEING_UP) {
            socket.emit('player move', 'down');
        }
}

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