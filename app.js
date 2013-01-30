var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server, {
        log: false
    }),
	fs = require('fs'),
	svrport = 666; //custom settings

server.listen(svrport);
console.log("TH server listening port "+svrport);

var idle_player = [];
io.sockets.on('connection', function (socket) {
	//when a player ask for join/leave
	socket.on('request', function (data) {
		var p1 = data.player;
		var cmd = data.order;
		if(idle_player.length > 0){
			for(var i=0;i<idle_player.length;i++) {
				if(p1.career != idle_player[i].career) {
					//find someone to match them
					if(cmd == "join") {
						var p2 = idle_player[i];
						idle_player.splice(i, 1);
						socket.emit("notice", [p1, p2]);
						socket.broadcast.emit("notice", [p1, p2]);
						console.log(p1.username+" match "+p2.username);
					}
					break;
				}
				else if(p1.username == idle_player[i].username &&
						p1.career == idle_player[i].career) {
					//remove player from idle_player
					idle_player.splice(i, 1);
					console.log(p1.username+" left");
				}
				if(i == idle_player.length - 1) {
					//push player into idle_player, if only him.
					if(cmd == "join") {
						idle_player.push(p1);
						console.log(p1.username+" join");
						socket.emit("idle");
					}
					break;
				}
			}
		}
		else {
			//push player into idle_player, if no one here.
			if(cmd == "join") {
				idle_player.push(p1);
				socket.emit("idle");
			}
		}
		console.log(idle_player);
    });

	//pass duel message to everyone, but sender.
	socket.on("match", function(data) {
		socket.broadcast.emit("match", data);
	});

	//send player left message to his opponent
	socket.on("exitGame", function(data) {
		var p2 = data[1];
		socket.broadcast.emit("oppLeft", {player: p2});
	})
	
	//count the result, and return to player and his opponent
	socket.on("checkpoint", function(data) {
		var p1 = data[0];
		var p2 = data[1];
		var p1_point = p1.point[p1.round-1];
		var p2_point = p2.point[p2.round-1];
		var msg = "";
		if(p1.career == "batter") {
			if(p1_point > p2_point) {
				if(p1_point - p2_point > 30) {
					msg = "It's deep~~~~~, and gone!!!\n<br>這個球相當的深遠~~~ 是全壘打!!!";
					msgid = 3;
				}
				else {
					msg = "Base hit!\n<br>結實的打了出去, 是個漂亮的安打!";
					msgid = 2;
				}
			}
			else {
				msg = "Strike!\n<br>揮棒落空~ 記個好球!";
				msgid = 1;
			}
		}
		socket.emit("result", {p1: p1, p2: p2, msgid: msgid, msg: msg});
		socket.broadcast.emit("result", {p1: p1, p2: p2, msgid: msgid, msg: msg});
	});
});

app.configure(function () {
	app.use('/js', express.static(__dirname + '/js'));
	app.use('/images', express.static(__dirname + '/images'));
	app.get('/client.html', function (req, res) {
		fs.readFile(__dirname + '/client.html', function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end("Error loading client.html");
            }
            res.writeHead(200);
            res.end(data);
        });
	});
});