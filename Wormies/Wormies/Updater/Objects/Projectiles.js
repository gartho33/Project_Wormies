var stage = require('../Objects/variables/vars.js').stage;
var players = require('./Players.js').players;
var collition = require('./collition/generalCollition.js').collition;
var inBounds = require('./collition/InBoundsCollition.js');
var platformCollition = require('./collition/PlatformCollition.js').platformTest;
var buffer = require('../Objects/variables/vars.js').buffer;


var speeds = Object.freeze({
    ballSpeed: { xSpeed: 5, ySpeed: 2 },
    gravity: 0.3
});

var ball = {
// give each ball its own movement variable
    id: 1,
    position: { x: 100, y: 100 },
    width: 50,
    height: 50,
    move: function () {
        if (inBounds.inBounds(this)) {
            this.position.x += speeds.ballSpeed.xSpeed;
            this.position.y += speeds.ballSpeed.ySpeed;
        }
        else {
            if (this.position.x + this.width >= stage.canvas.width) {//right
                this.position.x = stage.canvas.width - this.width - 1;
                swapXMove();
            }
            if (this.position.x - this.width <= 0) {//left
                this.position.x = 1;
                swapXMove();
            }
            if (this.position.y + this.height >= stage.canvas.height) {//down
                this.position.y = stage.canvas.height - this.height - 1;
                swapYMove();
            }
            if (this.position.y - this.height <= 0) {//up
                this.position.y = 1;
                swapYMove();
            }
        }
        
        function swapXMove() {
            speeds.ballSpeed.xSpeed = -speeds.ballSpeed.xSpeed;
        }
        function swapYMove() {
            speeds.ballSpeed.ySpeed = -speeds.ballSpeed.ySpeed;
        }
        
        var that = this;
        players.forEach(function (player) {
            if (collition(that, player)) {
                var center = { x: that.position.x + (that.width / 2), y: that.position.y + (that.height / 2) };
                var pCenter = { x: player.position.x + (player.width / 2), y: player.position.y + (player.height / 2) };
                
                if (center.x - pCenter.x > (player.width/2)-5) {//right hit
                    that.position.x = player.position.x + player.width + 1;
                    swapXMove();
                }
                else if (center.x - pCenter.x < -((player.width / 2) - 5)) {//left hit
                    that.position.x = player.position.x - that.width;
                    swapXMove();
                }
                if (center.y - pCenter.y > (player.height/2)-5) {//bottom hit
                    that.position.y = player.position.y + player.height;
                    swapYMove();
                }
                else if (center.y - pCenter.y < -((player.height / 2) - 5)) {//top hit
                    that.position.y = player.position.y - that.height;
                    swapYMove();
                }
            }
        });

        collitions = platformCollition(this);
        if (collitions.length > 0) {
            collitions.forEach(function (platform) {
                var platformCenter = { x: platform.position.x + (platform.size.width / 2), y: platform.position.y + (platform.size.height / 2) };
                var projectileCenter = { x: that.position.x + (that.width / 2), y: that.position.y + (that.height / 2) };

                if ((that.position.x + that.width) - buffer > platform.position.x &&
                    that.position.x + buffer < (platform.position.x + platform.size.width)) {
                    swapYMove();
                    if (platformCenter.y - projectileCenter.y < (that.height / 2) ) {//bottom hit
                        //console.log("bottom hit: ball");
                    } else if (platformCenter.y - projectileCenter.y > -((that.height / 2) )) {//top hit
                        //console.log("top hit: ball");
                    }
                } else {
                    swapXMove();
                    if (platformCenter.x - projectileCenter.x < (that.width / 2) ) {//right hit
                        //console.log("right hit: ball");
                    }
                    else if (platformCenter.x - projectileCenter.x > -((that.width / 2) )) {//left hit
                        //console.log("left hit: ball");
                    }
                }
            });
        };
    }
}

var projectiles = [];
projectiles.push(ball);
for (var i = ball.id + 1; i <= 1; i++) {
    var copy = (JSON.parse(JSON.stringify(ball)));
    copy.id = i;
    copy.move = ball.move;
    projectiles.push(copy);
}

exports.projectiles = projectiles;