(function (homeController) {
    homeController.init = function (app) {
        app.get("/", function (req, res) {
            res.render("./Home/index", {title: "Wormies Test"})
        });
    };
})(module.exports);