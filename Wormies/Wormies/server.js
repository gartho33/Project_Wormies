var http = require("http");
var express = require("express");
var socketio = require("socket.io");
var controllers = require("./controllers");

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);


app.set("view engine", "vash");//set view engine
controllers.init(app);//Map routs
app.use(express.static(__dirname + "/assets"));//set public recorces

var sockets = [];
var updater = require('./Updater/BoardMovement.js');

io.on('connection', function (socket) {
    setID(socket); socket.emit("your id", socket.params.ID);
    sockets.push(socket);
    updater.assignPlayer(socket.params.ID);
    
    /*
    boadcast to all but the sender.
    socket.broadcast.emit('update', "update test.");
    */

    socket.on('disconnect', function () {
        //handle any disconnection logic here.
        updater.removePlayer(socket.params.ID);
        sockets.splice(sockets.indexOf(socket), 1);
    });
    
    /*follow this pattern to catch browser emited events.*/
    socket.on('player move', function (data) {
        if (socket.params.ID < 4) {
            updater.movePlayer(socket.params.ID, data);
        }
    });
});

var frames = 1000 / 30;
setInterval(function () {
    /*this is where client update goes*/
    sockets.forEach(function (s) {
        s.emit('update client', updater.update());
    });
}, frames);

function setID(socket){  

    function mergeSort(arr) {
        if (arr.length < 2)
            return arr;
        
        var middle = parseInt(arr.length / 2);
        var left = arr.slice(0, middle);
        var right = arr.slice(middle, arr.length);
        
        return merge(mergeSort(left), mergeSort(right));
    }
    
    function merge(left, right) {
        var result = [];
        
        while (left.length && right.length) {
            if (left[0].params.ID <= right[0].params.ID) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }
        
        while (left.length)
            result.push(left.shift());
        
        while (right.length)
            result.push(right.shift());
        
        return result;
    }
    
    sockets = mergeSort(sockets);
    var validID = 0;
    sockets.forEach(function (s) {
        if (s.params.ID == validID) {
            validID += 1;
        }
    });
    socket.params = { ID: validID };
}

server.listen(3000);