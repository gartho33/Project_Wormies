var players = require("../Players.js").players;
var collition = require('./generalCollition.js').collition;

function testCollide(object) {
    var collitions = [];
    players.forEach(function (player) {
        if (collition(object, player)) {
            var add = { id: player.id, position: player.position, width: player.width, height: player.height };
            collitions.push(add);
        }
    });
    return collitions;
};

exports.playerTest = testCollide;