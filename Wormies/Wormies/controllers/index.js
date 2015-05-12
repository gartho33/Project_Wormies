(function (controllers) {
    var homeController = require("./homeController.js");
    controllers.init = function (app) {
        homeController.init(app);
    };
})(module.exports);