//custom settings
var domain = window.location.host;

var socket = io.connect(domain, {
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