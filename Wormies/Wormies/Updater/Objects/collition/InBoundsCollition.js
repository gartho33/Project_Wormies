var stage = require('../variables/vars.js').stage;
exports.inBounds = function inBounds(ref) {
    if (ref.position.x > 0 && (ref.position.x + ref.width) < stage.canvas.width && ref.position.y > 0 && (ref.position.y + ref.height) < stage.canvas.height) {
        return true;
    }
    return false;
};