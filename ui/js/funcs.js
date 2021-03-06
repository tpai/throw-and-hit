var setPlayerIcon = function(id) {
	if(p1.career == "pitcher")
		$("#player_icon").html("<font color='red'>"+p2.username+"</font><br><img src='images/player_batter"+id+".png'>");
	else if(p1.career == "batter")
		$("#player_icon").html("<font color='blue'>"+p2.username+"</font><br><img src='images/player_pitcher"+id+".png'>");
};

var roll_point;
var youcanroll = function() {
	$("#stopRolling").prop("disabled", false);
	roll_point = setInterval(function() {
		var point = $("#minepoint").prop("value");
		if(point < 100) {
			$("#minepoint").prop("value", ++point);
		}
		else {
			$("#minepoint").prop("value", 0);
		}
	}, 5);
};

var resetScene = function() {
	//score panel
	$("#score").html(""+
	"<tr><td>Strike</td>"+
	"<td>Base Hit</td>"+
	"<td>Homerun</td>"+
	"<tr><td>"+p1.score.strike+"</td>"+
	"<td>"+p1.score.hit+"</td>"+
	"<td>"+p1.score.homerun+"</td>");

	//player icon
	setPlayerIcon(1);

	//message: ready
	$("#msg").html("Ready");
	console.log("Scene reset!");

	//pitcher settigns
	if(p1.career == "pitcher") {
		$("#stopRolling").prop("value", "THROW");
		$("#stopRolling").prop("disabled", false);
		$("#enemypoint").prop("value", 0);
		//rolling point
		youcanroll();
	}
	//batter settings
	else if(p1.career == "batter") {
		$("#stopRolling").prop("value", "SWING");
		$("#stopRolling").prop("disabled", true);
		$("#minepoint").prop("value", 0);
		$("#enemypoint").prop("value", 0);
	}

	//bind click event
	$("#stopRolling").unbind().bind("click", function() {
		$(this).prop("disabled", true);
		clearInterval(roll_point);
		p1.round ++;
		p1.point.push($("#minepoint").prop("value"));
		if(p1.career == "pitcher") {
			$("#msg").html("Pitcher throw!");
			//send duel message to server
			socket.emit("match", [p1, p2]);
		}
		else if(p1.career == "batter") {
			checkpoint();
		}
	});
	
	$("#match_panel").hide(0);
	$(".game_panel").show(0);
};