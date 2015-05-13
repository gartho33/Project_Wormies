var stage = require('./variables/vars.js').stage;

var plank = {
    id: 0,
    height: 20,
    width: 100,
    position: { x: stage.canvas.width / 3, y: stage.canvas.height - 50 },
    movingPlatform: false,
    update: function (){
        //any moving platform logic
    }
};

var platforms = [];
for (var i = 0; i < 3; i++) {
    var add = JSON.parse(JSON.stringify(plank));
    add.id = i;
    add.position.x += (100 * i);
    add.position.y -= (50 * i);
    add.update = plank.update;
    platforms.push(add);
}

platforms[2].position.y += 50;
exports.platforms = platforms;