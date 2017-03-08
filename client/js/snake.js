(function () {
    var gamepad     = new PxGamepad();
    var players     = {};
    var padDir      = "down";
    var speed       = false;
    const dir       = {"right": {x: 1, y: 0}, "left": {x: -1, y: 0}, "up": {x: 0, y: -1}, "down": {x: 0, y: 1}};
    const elbow     = {"left_up": {x: 0, y: -32}, "left_down": {x: 0, y: 0}, "right_up": {x: -64, y: -64}, "right_down": {x: -64, y: 0},
                       "down_right": {x: 0, y: -32}, "up_right": {x: 0, y: 0}, "down_left": {x: -64, y: -64}, "up_left": {x: -64, y: 0}};
    var map         = {w: 896, h: 896, s: $("#map")};
    const snake     = {w: 32, h: 32};

    init();
    newPlayer("Keysim");
    gamepad.start();
    setInterval(tickFunc, 15);

    function newPlayer(name){
        var x = Math.floor((Math.random() * (map.w - snake.w)) + 1);
        var y = Math.floor((Math.random() * (map.h - snake.h)) + 1);
        map.s.append("<div id='" + name + "' class='player down'></div>");
        var s = $("#" + name);
        players[name] = {x:x, y:y, rot: "down", name: name, s: s, body: []};
        s.css({"left": x, "top": y});
    }

    function init() {
        map.s.css({"width": map.w, "height": map.h});
    }

    function turn(player, newDir) {
        player.s.removeClass();
        player.s.addClass("player " + newDir);
        var dir = player.rot + "_" + newDir;
        var id = Math.floor(Math.random() * 100000000);
        map.s.append("<div id='elbow-" + id + "' class='elbow'></div>");
        var elbowSelector = $("#elbow-" + id);
        elbowSelector.css({"left": player.x,"top": player.y,"background-position": elbow[dir].x + "px " + elbow[dir].y + "px"});
        if (player.body.length - 1 >= 0) {
            var lastPart = player.body[player.body.length - 1];
            map.s.append("<div id='body-" + id + "'></div>");
            var bodySelector = $("#body-" + id);
            if (Math.abs(lastPart.x - player.x) > 0) {
                bodySelector.addClass("body_w");
                bodySelector.css({
                    "left": ((lastPart.x < player.x) ? lastPart.x : player.x) + 32,
                    "top": lastPart.y,
                    "width": Math.abs(lastPart.x - player.x) - 32
                });
            }
            else {
                bodySelector.addClass("body_h");
                bodySelector.css({
                    "top": ((lastPart.y < player.y) ? lastPart.y : player.y) + 32,
                    "left": lastPart.x,
                    "height": Math.abs(lastPart.y - player.y) - 32
                });
            }
        }
        player.body.push({"x": player.x, "y": player.y});
    }

    function move(player) {
        var new_x = player.x + dir[player.rot].x * (speed ? 4 : 2);
        var new_y = player.y + dir[player.rot].y * (speed ? 4 : 2);
        if (new_x < map.w - snake.w && new_x > 0)
            player.x = new_x;
        if (new_y < map.h - snake.h && new_y > 0)
            player.y = new_y;
        if (player.x == new_x && player.y == new_y)
            player.s.css({"left":player.x, "top": player.y});
    }

    function tickFunc() {
        var player = players["Keysim"];
        gamepad.update();
        speed = gamepad.buttons["a"];
        padDir = getPadDir(gamepad.leftStick.x, gamepad.leftStick.y);
        if (dir[padDir].x + dir[player.rot].x == 0 && dir[padDir].y + dir[player.rot].y == 0)
            padDir = player.rot;
        move(player);
        if (player.rot != padDir)
            turn(player, padDir);
        player.rot = padDir;
    }

    function getPadDir(x, y) {
        if (x > 0.3 && y > -0.5 && y < 0.5)
            return "right";
        else if (x < -0.3 && y > -0.5 && y < 0.5)
            return "left";
        else if (y < -0.3 && x > -0.5 && x < 0.5)
            return "up";
        else if (y > 0.3 && x > -0.5 && x < 0.5)
            return "down";
        else
            return padDir;
    }
})();