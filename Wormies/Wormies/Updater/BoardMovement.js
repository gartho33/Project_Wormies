var keys = [];
var positionReset = { x: -150, y: 0 };


var projectiles = require('./Objects/Projectiles.js').projectiles;
var players = require('./Objects/Players.js').players;
var platforms = require('./Objects/platforms.js').platforms;

function assignPlayer(id){
    if (id < players.length && !players[id].filled) {
        players[id].filled = true;
        players[id].position.x = players[id].position.y = 100;
    };
};

function removePlayer(id){
    if (id < players.length && players[id].filled) {
        players[id].filled = false;
        players[id].position.x = positionReset.x;
        players[id].position.y = positionReset.y;
    };
}

function update(){
    var playerList = { type: "players", objects: [] };
    players.forEach(function (player) {
        var add = {id: player.id, position: player.position, jumpState: require('./Objects/Players.js').getPlayerJumpState(player.id-1)}
        playerList.objects.push(add);
    });
    
    var projectileList = {type: "projectile", objects: []};
    projectiles.forEach(function (projectile) {
        var add = { id: projectile.id, position: projectile.position }
        projectileList.objects.push(add);
    });
    
    var platformList = { type: "platform", objects: [] };
    platforms.forEach(function (platform){
        var add = { id: platform.id, position: platform.position };
        platformList.objects.push(add);
    })
    
    var objects = [];
    objects.push(playerList);
    objects.push(projectileList);
    objects.push(platformList);
    return objects;
};

function loop() {
    projectiles.forEach(function (projectile) { 
        projectile.move();
    });

    players.forEach(function (player) {
        player.update();
    });

    platforms.forEach(function (platform) {
        platform.update();
    });
};

var frames = 1000 / 30;
setInterval(function () {
    loop();
}, frames);

exports.update = update;
exports.movePlayer = require('./Objects/Players.js').movePlayer;
exports.assignPlayer = assignPlayer;
exports.removePlayer = removePlayer;