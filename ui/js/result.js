var checkpoint = function() {
	socket.emit("checkpoint", [p1, p2]);
};

//receive result message from server
socket.on("result", function(data) {
	if(data.p1.username == p1.username || data.p2.username == p1.username) {
		if(p1.career == "pitcher") {
			setPlayerIcon(2);
			$("#enemypoint").prop("value", data.p1.point[data.p1.round-1]);
		}
		$("#msg").html(data.msg);
		switch(data.msgid) {
			case 1:
				p1.score.strike ++; break;
			case 2:
				p1.score.hit ++; break;
			case 3:
				p1.score.homerun ++; break;
		}
		console.log("p1: "+data.p2.point[data.p2.round-1]);
		console.log("p2: "+data.p1.point[data.p1.round-1]);
		setTimeout(resetScene, 2500);
	}
});