$(document).ready(function() {
	var socket = io.connect(window.location.hostname);

	$("#defender").on("click",function() {
  		sessionStorage.setItem('playerType', 'defender');
		socket.on('connect', function() {
			socket.emit('chooseDefender', socket.id);
		});

		socket.on('foundOpponent', function(opponent, room) {
			socket.leave(socket.room);
			socket.join(room);

			startGame(sessionStorage.gameVersion);
		});
  	});
  	$("#attacker").on("click", function() {
		sessionStorage.setItem('playerType', 'attacker');

		socket.on('connect', function() {
			socket.emit('chooseAttacker', socket.id);
		});

		socket.on('foundOpponent', function(opponent, room) {
			socket.leave(socket.room);
			socket.join(room);

			startGame(sessionStorage.gameVersion);
		});

	});
});

function startGame(game) {
	switch(game){
		case 1:
			window.location.assign('http://localhost:3000/game1.html');
			break;
		default:
			window.location.assign('http://localhost:3000/game1.html');

	}
}