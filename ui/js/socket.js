//custom settings
var domain = "localhost";
var port = "666";

var socket = io.connect("http://"+domain+":"+port, {
	"force new connection": true
});
//player data
var p1 = {
	username: "",
	career: "",
	round: 0,
	point: [],
	score: {
		strike: 0,
		hit: 0,
		homerun: 0
	}
},
p2 = {
	username: "",
	career: "",
	round: 0,
	point: [],
	score: {
		strike: 0,
		hit: 0,
		homerun: 0
	}
};