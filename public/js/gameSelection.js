$(document).ready(function() {
	var socket = io.connect(window.location.hostname);
	
	$(document).on('click', function(event) {
		var target = $(event.target);

		if (target.is('#Game1')){
			sessionStorage.setItem('gameVersion', 1);
			socket.on('connect', function() {
				socket.emit('play', 1);
			});
			
		} else if (target.is('#Game2')){
			sessionStorage.setItem('gameVersion', 2);
			socket.on('connect', function() {
				socket.emit('play', 2);
			});
		}
	});
});