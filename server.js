var http        = require('http');
var io          = require('socket.io');
var config      = require('./server/config.js');
var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');


app.use("/static", express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    next();
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

var server = http.createServer(app); // Routing pour les tests de clients + DOCUMENTATION de l'API

io = io.listen(server); // Start server.

var players = {};

players["Keysim"] = {x:15, y:10, rot:"right", speed:2, name:"Keysim"};

setInterval(move, 10);

io.sockets.on('connection', function (socket) {
    console.log("Broadcast started.");

    for(var name in players){
        io.emit("player/add", players[name]);
    }

    socket.on('move', function (to) {
        players["Keysim"].rot = to;
        console.log("Player moved " + to);
    });

    socket.on('speed', function () {
        if(players["Keysim"].speed == 2)
            players["Keysim"].speed = 4;
        else if(players["Keysim"].speed == 4)
            players["Keysim"].speed = 2;
    });

    /*socket.on('disconnect', function() {
        io.emit('delete');
        //players.remove(this.id);
    });*/
});

function move() {
    for(var name in players){
        var new_x = players[name].x + config.dir[players[name].rot].x * players[name].speed;
        var new_y = players[name].y + config.dir[players[name].rot].y * players[name].speed;
        if(new_x < config.map.w - config.player.w && new_x > 0)
            players[name].x = new_x;
        if(new_y < config.map.h - config.player.h && new_y > 0)
            players[name].y = new_y;
        io.emit("player/move", players[name]);
    }
}

server.listen(config.port, "0.0.0.0");
console.log("Server started. Waiting for a connexion...");