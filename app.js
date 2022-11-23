var express = require('express'),
  app = express(),
  http = require('http').createServer(app),
  io = require('socket.io')(http);
	port = (process.env.PORT || 8080);

http.listen(port);

console.log("SYSTEM: Server listening port "+port);

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
						console.log("MATCH: "+p1.username+" VS. "+p2.username);
					}
					break;
				}
				else if(p1.username == idle_player[i].username &&
						p1.career == idle_player[i].career) {
					//remove player from idle_player
					idle_player.splice(i, 1);
					console.log("DISCONNECT: "+p1.username);
				}
				if(i == idle_player.length - 1) {
					//push player into idle_player, if only him.
					if(cmd == "join") {
						idle_player.push(p1);
						console.log("CONNECT: "+p1.username);
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
				console.log("CONNECT: "+p1.username);
				socket.emit("idle");
			}
		}
		
		socket.emit("updateIdlePlayer", idle_player);
		//update idle player each second
		socket.broadcast.emit("updateIdlePlayer", idle_player);
    });

	//pass duel message to everyone, but sender.
	socket.on("match", function(data) {
		socket.broadcast.emit("match", data);
	});

	//send player left message to his opponent
	socket.on("exitGame", function(data) {
		var p2 = data[1];
		socket.broadcast.emit("oppLeft", {player: p2});
	});
	
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
					msg = "It's deep~~~~~ and gone!!!";
					msgid = 3;
				}
				else {
					msg = "Base hit!";
					msgid = 2;
				}
			}
			else {
				msg = "Strike!";
				msgid = 1;
			}
		}
		socket.emit("result", {p1: p1, p2: p2, msgid: msgid, msg: msg});
		socket.broadcast.emit("result", {p1: p1, p2: p2, msgid: msgid, msg: msg});
	});
});

app.use(express.static(__dirname + '/ui'));
