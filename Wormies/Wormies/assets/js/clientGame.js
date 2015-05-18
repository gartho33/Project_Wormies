var stage;
var keys = [];

var manifest = [
    { src: "ball.jpg", id: "ball" },
    { src: 'Player1_SpriteSheet.png', id: 'p1Sprites' },
    { src: 'Player2_SpriteSheet.png', id: 'p2Sprites' },
    { src: 'Player3_SpriteSheet.png', id: 'p3Sprites' },
    { src: 'Player4_SpriteSheet.png', id: 'p4Sprites' }
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
    
    players.forEach(function (player) {
           player.draw();
    })
    
    ready = true;
}

function setupStage(){
    loadFiles();
    var canvas = document.getElementById('game');
    canvas.width = 800;
    canvas.height = 600;
    stage = new createjs.Stage(canvas);
    
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
        setMyAnimation("left", socket);
    }
    
    if (MOVEING_RIGHT) {// d
        socket.emit('player move', 'right');
        setMyAnimation('right', socket);
    }
    
    if (MOVEING_UP) {//space
        socket.emit('player move', 'up');
        setMyAnimation("jump", socket);
    }
    
    if (!MOVEING_UP) {
        socket.emit('player move', 'down');
    }

    if(!MOVEING_LEFT && !MOVEING_RIGHT && !MOVEING_UP) {
        setMyAnimation("idle", socket);
    }
}

function setMyAnimation(direction, socket){
    var target = null;
    players.forEach(function (player) {
        if (player.id == myID) {
            target = player;
        }
    });
    
    var myAnimation = null;
    if (direction == animation.LEFT) {
        if (target.shape.scaleX == 1) {
            target.shape.scaleX = -1;
        }
        if (target.shape.currentAnimation != "walk" && target.jumpstate == 0) {
            target.shape.gotoAndPlay("walk");
            myAnimation = animation.LEFT;
        }
    }
    if (direction == animation.RIGHT) {
        if (target.shape.scaleX == -1) {
            target.shape.scaleX = 1;
        }
        if (target.shape.currentAnimation != "walk" && target.jumpstate == 0) {
            target.shape.gotoAndPlay("walk");
            myAnimation = animation.RIGHT;
        }
    }
    if (direction == animation.JUMP) {
        if (target.shape.currentAnimation != 'jump' && target.jumpstate == 0) {
            target.shape.gotoAndPlay('jump');
            myAnimation = animation.JUMP;
        }
    }
    if (direction == animation.IDLE) {
        if (target.shape.currentAnimation != 'idle' && target.jumpstate == 0) {
            target.shape.gotoAndPlay("idle");
            animation.IDLE
        }
    }
    
    var data = { id: myID, animation: target.shape.currentAnimation, scale: target.shape.scaleX };
    socket.emit('update animation', data);
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

var offset = 25;
var players = [
    player1 = {
        id: 0,
        shape: null,
        jumpstate: 0,
        draw: function () {
            var player1SpriteSheet = new createjs.SpriteSheet({
                images: [queue.getResult('p1Sprites')],
                frames: { width: 50, height: 50, count: 40, regX: offset, regY: 0, spacing: 0, margin: 0 },
                animations: {
                    idle: [0, 9, 'idle', .5],
                    walk: [10, 19, 'walk', .5],
                    walkShoot: [20, 29, 'walkshoot', .5],
                    jump: [30, 34, .1],
                    airIdle: [35, 35],
                    fall: [36, 39, 'fall', .5]
                }
            });
            
            this.shape = new createjs.Sprite(player1SpriteSheet);
            stage.addChild(this.shape);
            this.shape.gotoAndPlay('idle');
        },
        updateJumpState: function (){
            if (this.jumpstate == 3) {
                this.shape.gotoAndPlay('fall');
            } else if (this.jumpstate == 2) {
                this.shape.gotoAndPlay('airIdle');
            } else if (this.jumpstate == 1) {
                this.shape.gotoAndPlay('jump')
            }
        }
    },
    player2 = {
        id: 1,
        shape: null,
        jumpstate: 0,
        draw: function () {
            var player1SpriteSheet = new createjs.SpriteSheet({
                images: [queue.getResult('p2Sprites')],
                frames: { width: 50, height: 50, count: 40, regX: offset, regY: 0, spacing: 0, margin: 0 },
                animations: {
                    idle: [0, 9, 'idle', .5],
                    walk: [10, 19, 'walk', .5],
                    walkShoot: [20, 29, 'walkshoot', .5],
                    jump: [30, 34, 'airIdle', .5],
                    airIdle: [35, 35],
                    fall: [36, 39, 'fall', .5]
                }
            });
            
            this.shape = new createjs.Sprite(player1SpriteSheet);
            stage.addChild(this.shape);
            this.shape.gotoAndPlay('idle');
        },
        updateJumpState: function () {
            if (this.jumpstate == 3) {
                this.shape.gotoAndPlay('fall');
            } else if (this.jumpstate == 2) {
                this.shape.gotoAndPlay('airIdle');
            } else if (this.jumpstate == 1) {
                this.shape.gotoAndPlay('jump')
            }
        }
    },
    player3 = {
        id: 2,
        shape: null,
        jumpstate: 0,
        draw: function () {
            var player1SpriteSheet = new createjs.SpriteSheet({
                images: [queue.getResult('p3Sprites')],
                frames: { width: 50, height: 50, count: 40, regX: offset, regY: 0, spacing: 0, margin: 0 },
                animations: {
                    idle: [0, 9, 'idle', .5],
                    walk: [10, 19, 'walk', .5],
                    walkShoot: [20, 29, 'walkshoot', .5],
                    jump: [30, 34, 'airIdle', .5],
                    airIdle: [35, 35],
                    fall: [36, 39, 'fall', .5]
                }
            });
            
            this.shape = new createjs.Sprite(player1SpriteSheet);
            stage.addChild(this.shape);
            this.shape.gotoAndPlay('idle');
        },
        updateJumpState: function () {
            if (this.jumpstate == 3) {
                this.shape.gotoAndPlay('fall');
            } else if (this.jumpstate == 2) {
                this.shape.gotoAndPlay('airIdle');
            } else if (this.jumpstate == 1) {
                this.shape.gotoAndPlay('jump')
            }
        }
    },
    player4 = {
        id: 3,
        shape: null,
        jumpstate: 0,
        draw: function () {
            var player1SpriteSheet = new createjs.SpriteSheet({
                images: [queue.getResult('p4Sprites')],
                frames: { width: 50, height: 50, count: 40, regX: offset, regY: 0, spacing: 0, margin: 0 },
                animations: {
                    idle: [0, 9, 'idle', .5],
                    walk: [10, 19, 'walk', .5],
                    walkShoot: [20, 29, 'walkshoot', .5],
                    jump: [30, 34, 'airIdle', .5],
                    airIdle: [35, 35],
                    fall: [36, 39, 'fall', .5]
                }
            });
            
            this.shape = new createjs.Sprite(player1SpriteSheet);
            stage.addChild(this.shape);
            this.shape.gotoAndPlay('idle');
        },
        updateJumpState: function () {
            if (this.jumpstate == 3) {
                this.shape.gotoAndPlay('fall');
            } else if (this.jumpstate == 2) {
                this.shape.gotoAndPlay('airIdle');
            } else if (this.jumpstate == 1) {
                this.shape.gotoAndPlay('jump')
            }
        }
    }
];

function setTheirAnimation(data){
    var target = null;
    players.forEach(function (player) {
        if (player.id == data.id) {
            target = player;
        }
    });

    if (target != null) {
        if (target.shape.currentAnimation != data.animation) {
            target.shape.gotoAndPlay(data.animation);
        }
        target.shape.scaleX = data.scale;
        
    }
};

function update(positions) {
    if (ready) {
        move();
        positions.forEach(function (group) {
            if (group.type == "players") {
                group.objects.forEach(function (player) {
                    players[player.id - 1].shape.x = player.position.x + offset;
                    players[player.id - 1].shape.y = player.position.y;
                    players[player.id - 1].jumpstate = player.jumpState;
                    players[player.id - 1].updateJumpState();
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