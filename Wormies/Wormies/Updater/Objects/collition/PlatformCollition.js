var platforms = require('../platforms.js').platforms;
var collition = require('./generalCollition.js').collition;

function testCollide(object){
    var collitions = [];
    platforms.forEach(function (platform) {
        if (collition(object, platform)) {
            var add = { id: platform.id, position: platform.position, size: { width: platform.width, height: platform.height } };
            collitions.push(add);
        }
    });
    return collitions;
};

exports.platformTest = testCollide;