var inBounds = require('./collition/InBoundsCollition.js');
var moveEnums = require('../Enums/EMoveDirection.js');
var stage = require('../Objects/variables/vars.js').stage;
var buffer = require('../Objects/variables/vars.js').buffer;
var platformCollition = require('./collition/PlatformCollition.js').platformTest;

var baseStats = Object.freeze({
    playerStats: {
        width: 50,
        height: 50
    }
});

var speeds = {
    playerSpeed: {
        xSpeed: 5,
        ySpeed: 5
    },
    gravity: .2,
    friction: .8
}

var player = {
    id: 0,
    position: { x: -150, y: 100 },
    velocity: { x: 0, y: 0 },
    width: baseStats.playerStats.width,
    height: baseStats.playerStats.height,
    grounded: false,
    filled: false,
    update: function (){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.x *= speeds.friction;
        if (!this.grounded) {
            if (Math.floor(this.velocity.y) < 10) {
                this.velocity.y += speeds.gravity*2;
            }
        }

        var collitions = platformCollition(this);
        if (collitions.length > 0) {
            var that = this;
            collitions.forEach(function (platform) {
                var platformCenter = { x: platform.position.x + (platform.size.width / 2), y: platform.position.y + (platform.size.height / 2) };
                var playerCenter = { x: that.position.x + (that.width / 2), y: that.position.y + (that.height / 2) };

                if ((that.position.x + that.width) - buffer > platform.position.x &&
                    that.position.x + buffer < (platform.position.x + platform.size.width)) {
                    if (platformCenter.y - playerCenter.y < (that.height / 2) - buffer) {//bottom hit
                        //console.log("bottom hit");
                        that.position.y = platform.position.y + platform.size.height;
                        that.velocity.y = 0;
                    } else if (platformCenter.y - playerCenter.y > -((that.height / 2) - buffer)) {//top hit
                        //console.log("top hit");
                        that.position.y = platform.position.y - that.height;
                        that.grounded = true;
                        that.velocity.y = 1;
                    }
                } else {
                    if (platformCenter.x - playerCenter.x < (that.width / 2) - buffer) {//right hit
                        //console.log("right hit");
                        that.position.x = platform.position.x + platform.size.width;
                    }
                    else if (platformCenter.x - playerCenter.x > -((that.width / 2) - buffer)) {//left hit
                        //console.log("left hit");
                        that.position.x = platform.position.x - that.width;
                    }
                }
            });
        } else {
            this.grounded = false;
        }
        
        if (this.position.y + this.height >= stage.canvas.height || this.position.y + this.height == stage.canvas.height-1) {
            this.grounded = true;
            this.velocity.y = 0;
            this.position.y = stage.canvas.height - this.height - 1;
        }
        if (this.position.x <= 0 && this.filled) {
            this.position.x = 1;
        }
        if (this.position.x + this.width >= stage.canvas.width && this.filled) {
            this.position.x = (stage.canvas.width - this.width) - 1;
        }
        if (this.position.y <= 0 && this.filled) {
            this.position.y = 1;
        }
    }
};

var players = [];
for (var i = player.id + 1; i <= 4; i++) {
    var copy = (JSON.parse(JSON.stringify(player)));
    copy.id = i;
    copy.update = player.update;
    players.push(copy);
}

function movePlayer(id, direction) {
    var player = players[id];
    if (inBounds.inBounds(player)) {
        if (direction == moveEnums.moveEnums.LEFT) {
            if (player.velocity.x > -speeds.playerSpeed.xSpeed) {
                player.velocity.x--;
            }
        }
        else if (direction == moveEnums.moveEnums.RIGHT) {
            if (player.velocity.x < speeds.playerSpeed.xSpeed) {
                player.velocity.x++;
            }
        }
        else if (direction == moveEnums.moveEnums.UP) {
            if (player.grounded) {
                player.velocity.y = -speeds.playerSpeed.ySpeed*2;
                player.grounded = false;

            }
        }
        else if (direction == moveEnums.moveEnums.DOWN) {
            if (!player.grounded) {
                player.velocity.y += speeds.gravity * 2;
            }
        }
    };
};

exports.players = players;
exports.movePlayer = movePlayer;