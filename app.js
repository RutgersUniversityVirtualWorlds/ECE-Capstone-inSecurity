var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);

console.log('start');
var databaseUrl = 'localhose:27107/game';
var collections = ['gameSettings', 'turnData', 'mapArray'];
//var db = require('mongojs').connect(databaseUrl, collections);

var app = express();

app.set('port', process.env.PORT || 3000);

app.set('views', __dirname + '/public');
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname + '/public')));
app.use(express.static(path.join(__dirname + '/bower_components')));
app.use(express.static(path.join(__dirname + '/node_modules')));


app.get('/', function (req, res) {
  	res.render('/index.html');
});

app.get('/map', function (req, res, next) {
	db.collection('game').findOne(req.id, function(err, item) {
		res.send(item.mapArray);
	});
});

app.post('/gameSettings', function (req, res) {
	db.collection('gameSettings').find(req.params, function(err, doc) {
		if (doc.length === 0) {
			req.params.frequency = 1;
			db.collection('game').save(req.params);
		} else {
			db.collections('game').update(req.params);
		}
	});
	res.send(200);
});

app.post('/turn', function (req, res) {
	db.collection('turnData').save(req.params);
	res.send(200);
});


/****************************
	SOCKET IO CONNECTION
****************************/
var attackers = {};
var defenders = {};
var players = {};

// add a room for each game lobby
var rooms = [];
rooms.push('gamelobby1'); // lobby for Game 1;

io.sockets.on('connection', function(socket) {
	console.log('A player connected...');
	
	// Player picks a game to play
	socket.on('play', function(game) {
		players[id] = id;
		socket.room = 'gamelobby1';
		socket.join('gamelobby1');    // player joins the lobby of the game they selected
	});

	// Player chose to play as an Attacker
	socket.on('chooseAttacker', function(id) {
		console.log(id, ' is playing as an Attacker');
		var room = socket.room;

		if (defenders[room] && defenders[room].length !== 0){
			// there is an available opponent!
			var defender = defenders[room].pop();
			socket.emit('foundOpponent', defender.id, id);
		} else {
			attacker[room].push({'id': id, 'connection': socket});
		}
	});

	// Player chose to play as an Defender
	socket.on('chooseDefender', function(id) {
		console.log(id, ' is playing as a Defender');
		var room = socket.room;

		// check to see if any of the rooms have people waiting to player
		if (attackers[room] && attackers[room].length !== 0){
			var attacker = attackers[room].pop();
			socket.emit('foundOpponent', attacker.id, id);
		} else {
			defender[room].push({'id': id, 'connection': socket});
		}

	});

	// Player left the game session
	socket.on('quit', function(room) {
		socket.leave(room);
		socket.in(room).emit('leftRoom', id, room);
	});

	socket.on('disconnect', function(room) {
		// if the player disconnects while in a game session
		// initiate end game
		if (room !== 'lobby') {
			socket.in(room).emit('gameOver');
		} else {
			// remove people who have disconnected without finding a partner
			var i;
			for (i = 0; i < players.length; i++){
				if (players[i].connection === socket) {
					players.splice(i, 1);
				}
			}
			for (i = 0; i < attackerss.length; i++){
				if (attackerss[i].connection === socket) {
					attackerss.splice(i, 1);
				}
			}
			for (i = 0; i < players.length; i++){
				if (players[i].connection === socket) {
					players.splice(i, 1);
				}
			}
		}

	});

});


// server listening on port 3000
app.listen(app.get('port'), function() {
	console.log('Game server listening on port ' + app.get('port'));
});