//when player connect to server, send player data to it.
socket
.on("connect", function () {
	console.log("connect!");
})
.on("disconnect", function () {
	console.log("disconnect!");
});

//when player close window, reset this game.
window.onbeforeunload = function() {
	resetGame();
	return undefined;
};

var resetGame = function() {
	$("#p1").html("none");
	$("#msg").html(":)");
	socket.emit("request", {order: "leave", player: p1}); //remove from idle_user arr
	socket.emit("exitGame", [p1, p2]); //notice opponent
};

//notice that your opponent left this game
socket.on("oppLeft", function(data) {
	if(data.player.username == p1.username &&
		data.player.career == p1.career &&
		data.player.username != "") {
		alert("Connection lost!");
		location.reload();
	}
});

//set your status to idle
socket.on("idle", function() {
	$("#p1").html(p1.username);
	$("#msg").html("Waiting...");
});

//notice that your already found a opponent
socket.on("notice", function(data) {
	for(var i=0;i<data.length;i++) {
		var val = data[i];
		if(p1.username == val.username && p1.career == val.career) {
			$("#p1").html(val.username);
			
			if(i == data.length - 1) {
				p2.username = data[i-1].username;
				p2.career = data[i-1].career;
			}
			else {
				p2.username = data[i+1].username;
				p2.career = data[i+1].career;
			}
			$("#p2").html(p2.username);
			
			$("#msg").html("Matched!");
			alert("Matched!");
			setTimeout(resetScene, 2500);
			break;
		}
	}
});

//receive duel message from server
socket.on("match", function(data) {
	var user = data[1];
	if(user.username == p1.username && user.career == p1.career) {
		p2 = data[0];
		$("#enemypoint").prop("value", p2.point[p2.round-1]);
		console.log(p1.username+" match!")
		if(p1.career == "batter") {
			//-------
			$("#msg").html("Pitcher throw!");
			setPlayerIcon(2);
			//-------
			$("#stopRolling").prop("disabled", false);
			youcanroll();
		}
	}
});

//update idle player
socket.on("updateIdlePlayer", function(data) {
	$("#idle_player .player").remove();
	var html = '';
	for(var i=0;i<data.length;i++) {
		html += '<li class="player">['+data[i].career+'] '+data[i].username+'</li>';
	}
	$("#idle_player").append(html).listview("refresh");
});

$(document).ready(function () {
	// when click match button, send user information to server.
	$("#match").click(function() {
		if($("#username").prop("value") != "") {
			p1.username = $("#username").prop("value");
			p1.career = $("#career option:checked").prop("value");
			socket.emit("request", {order: "join", player: p1});
		}
		else {
			alert("You must type something.")
		}
	});
	//when click exitGame button, reset this game.
	$("input[name='exitGame']").click(resetGame);
});