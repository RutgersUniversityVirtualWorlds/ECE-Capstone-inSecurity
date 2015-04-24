var grass;
var floor;
var wall;
var objective;
var attacker_front;
var attacker_back;
var attacker_left;
var attacker_right;
var defender_front;
var defender_back;
var defender_left;
var defender_right;

var turn_num;
var gameSettings;
var game = sessionStorage.gameVersion;
var settings;
var canvas;
var map;
var playerType = sessionStorage.playerType;
var game_objects;

var cursor_x;
var cursor_y;

function preload() {
	grass = loadImage('/images/grass.png');
	floor = loadImage('/images/floor.png');
	wall = loadImage('/images/wall_obstacle.png');
	objective = loadImage('/images/key_objective.png');

	attacker_front = loadImage('images/attacker_front.png');
	attacker_back = loadImage('images/attacker_back.png');
	attacker_left = loadImage('images/attacker_left.png');
	attacker_right = loadImage('images/attacker_right.png');
	
	defender_front = loadImage('images/defender_front.png');
	defender_back = loadImage('images/defender_back.png');
	defender_left = loadImage('images/defender_left.png');
	defender_right = loadImage('images/defender_right.png');

}

function setup() {
	canvas = createCanvas(800, 500);
	canvas.parent('gameContainer');

	sendGameSettings();
	setupGame();
}

function draw() {
	drawGameSession();
}


/*******************
	GAME OBJECTS
*******************/
function Settings(version, gameSettings) {
	this.game_version = version; // default=1;
	this.game_id = gameSettings.game_id; // you return this to me when you create the settings object
	this.map_width = gameSettings.map_width;
	this.map_height = gameSettings.map_height;
	this.map_radius = gameSettings.map_radius;
	this.numObjectives = gameSettings.numObjectives; // default = 3, can have more depending on map
	this.view = gameSettings.view; // 'default', 'camera'
	this.enableItems = gameSettings.enableItems; // bool
}

function Player(type, x, y) {
	this.type = type;
	
	this.xcoor = x;
	this.ycoor = y;
	this.oldXCoor = x;
	this.oldYCoor = y;
	
	this.direction;
	this.moving = 0;
	this.distance_left = 0;
	this.edge = 0;
	this.action = 'nothing';
	this.numStars = 0;
	
	this.playerItems = new Array(0);

	//remove when real tiles are implemented
	this.color = color(255,255,255);
}

/* Object in the game
 * Objects can be:
 * 	- Objective(key, jewel, flag)
 *	- Item (shovel, teleport)
 */
function GameObject(type, x, y) {
	this.type = type;
	this.xcoor = x;
	this.ycoor = y;
	this.taken = false;
	this.used = false;
}

function Tile(type, size) {
	this.type = type;
	this.size = size;
	this.tile_accessibility = 1;
	
	switch(type) {
		case 1:
			this.color = color(80, 80, 80);
			this.tile_accessibility = 0;
			break;
		default:
			this.color = color(255, 255, 255);
			this.tile_accessibility = 1;
	}
}

function GameMap(width, height, radius, map_array) {
	// Game Map attributes
	this.width = width-radius;
	this.height = height-radius;
	this.radius = radius;
	this.tile_size =(500/((this.radius*2)+1));
	this.tile_array;
	this.rooms;

	// Generates a new Tile Array
	this.tile_array = new Array(width);
	for (var column = 0; column < width; column++) {
		this.tile_array[column] = new Array(height);
	}

	// Generate Game Map of Tiles
	for (var column = 0; column < width; column++) {
		for (var row = 0; row < height; row++) {
				this.tile_array[column][row] = new Tile(map_array[row][column], this.tile_size);
		}
	}
}


/**********************
	GAME FUNCTIONS
**********************/
function sendGameSettings() {
	/* not connected to the DB yet
	 * uncomment once DB is connected

	var settings = {
		'id': Math.floor((Math.random() * 1000000) + 1),
		'version': gameSettings.version,
		'map_width': gameSettings.map_width,
		'map_height': gameSettings.map_height,
		'numObjectives': 3,
		'view': gameSettings.view,
		'enableItems': gameSettings.enableItems
	}

	var successHandler = function(data, textStatus, jqXHR){
		gameSettings = new Settings(data.version, data);
	};

	$.ajax({
		url: '/gameSettings',
		type: 'POST',
		data: JSON.stringify(settings),
		contentType: 'application/json',
		dataType: 'json',
		success: successHandler
		}
	});
	*/

	var defaultSettings = {
		'game_version': 1,
		'game_id': Math.floor((Math.random() * 1000000) + 1),
		'map_width': 29,
		'map_height': 29,
		'map_radius': 3,
		'numObjectives': 3,
		'view': 'camera',
		'enableItems': false
	}; 

	settings = new Settings(defaultSettings.game_version, defaultSettings);
}

/**********************
	SETUP FUNCTIONS
**********************/
function setupGame() {
	/*
	var gameData = {
		'version': settings.version,
		'id': settings.id
	}

	$.ajax({
		url: '/map', // getting a map and the rest of the information from the DB
		type: 'GET',
		data: JSON.stringify(gameData),
		dataType: 'json'
	}).done(function(response) {
		map = new GameMap(response.width, response.height, response.map_array);

		if (playerType == 'attacker'){
			player = new Player(playerType, response.StartAttacker.x, response.StartAttacker.y);
		} else {
			player = new Player(playerType, response.StartDefender.x, response.StartDefender.y);
		}
	});
	*/

	// remove when DB is connected
	var mapArray = [
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	 	[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
	 	[0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0],
	 	[0,0,1,0,0,1,1,1,0,1,1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0],
	 	[0,0,1,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,2,0,1,0,0,1,0,0],
	 	[0,0,1,0,0,1,3,0,0,0,0,1,1,0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0],
	 	[0,0,1,0,0,1,0,0,0,0,0,1,1,0,1,0,0,0,1,0,0,0,0,1,0,3,1,0,0],
	 	[0,0,1,0,0,1,1,1,0,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,0,0],
	 	[0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0],
	 	[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
	 	[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0],
	 	[0,0,1,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1,0,0],
	 	[0,0,1,0,0,0,0,0,1,0,0,1,1,0,1,1,0,0,0,0,0,0,1,0,0,0,1,0,0],
	 	[0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0],
	 	[0,0,1,0,1,1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
	 	[0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0],
	 	[0,0,1,0,3,1,0,0,0,0,0,1,0,0,0,1,0,0,1,1,1,1,1,1,0,1,1,0,0],
	 	[0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,1,1,0,0,1,0,0],
	 	[0,0,1,0,1,1,0,0,1,0,0,1,1,0,1,1,0,0,0,0,0,1,1,1,0,0,1,0,0],
	 	[0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,0,0],
	 	[0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0],
	 	[0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,1,0,0],
	 	[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1,1,0,1,0,0],
	 	[0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,0],
	 	[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0],
	 	[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
	 	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	 	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];

	map = new GameMap(settings.map_width, settings.map_height, settings.map_radius, mapArray);
	
	if (playerType == 'attacker'){
		player = new Player(playerType, 6, 24);
		opponent = new Player('defender', 21, 5);
	} else if (playerType == 'defender'){
		player = new Player(playerType, 21, 5);
		opponent = new Player('attacker', 6, 24);
	}

	num_stars = settings.numObjectives;
	game_objects = new Array(0);
	game_objects.push(new GameObject('star', 6, 6));
	game_objects.push(new GameObject('star', 7, 25));
	game_objects.push(new GameObject('star', 4, 17));

	// Update player accessibility;
	updateTileAccessibility(map, player.xcoor, player.ycoor);
}

// Gets tile index that the mouse is currently hovering over
function updateCursor(x_coord, y_coord) {
	cursor_x = (int)(x_coord/map.tile_size)-1;
  	cursor_y = (int)(y_coord/map.tile_size)-1;
}

/**********************
	DRAW FUNCTIONS
**********************/
function drawGameSession() {
	updateCursor(mouseX, mouseY);
	drawMap(map);
	
	if (player.moving == 1) {
		drawPlayerMotion(map, player.distance_left);
	} else {
		drawPlayer(map);
	}

	drawMiniMap();
}

function drawMap(map) {
	// Onscreen tile index
	var tile_xcoor = 0;
	var tile_ycoor = 0;

	// Calculate vertical start and end points for camera
	var start_y;
	var end_y;
	if (player.ycoor-map.radius < map.radius) {
		start_y = player.ycoor-map.radius;
		end_y = player.ycoor+map.radius;
	} else if (player.ycoor+map.radius > map.height) {
		start_y = player.ycoor-map.radius;
		end_y = map.height+map.radius-1;
	}
	else {
		start_y = player.ycoor-map.radius;
		end_y = player.ycoor+map.radius;
	}

	var start_x;
	var end_x;
	if (player.xcoor-map.radius < map.radius){
		start_x = player.xcoor-map.radius;
		end_x = player.xcoor+map.radius;
	} else if (player.xcoor+map.radius > map.width) {
		start_x = player.xcoor-map.radius;
		end_x = map.width+map.radius-1;
	} else {
		start_x = player.xcoor-map.radius;
		end_x = player.xcoor+map.radius;
	}

	
	for (var y = start_y; y <= end_y; y++){
		for(var x = start_x; x <= end_x; x++){
			
			if (player.moving == 1) {
				if (player.distance_left < 0) {
					player.distance_left = 0;
					player.moving = 0;
					drawTile(map.tile_array[x][y], tile_xcoor, tile_ycoor);
				} else {
					drawTile(map.tile_array[x][y], tile_xcoor, tile_ycoor);
				}
			} else {
				drawTile(map.tile_array[x][y], tile_xcoor, tile_ycoor);
			}
			tile_xcoor = tile_xcoor+1;
		}
		tile_xcoor = 0;
		tile_ycoor = tile_ycoor+1;
	}
}

function drawPlayer(map) {
	// Onscreen tile index
	var tile_xcoor = 0;
	var tile_ycoor = 0;

	// Calculate vertical start and end points for camera
	var start_y;
	var end_y;
	if (player.ycoor-map.radius < map.radius) {
		start_y = player.ycoor-map.radius;
		end_y = player.ycoor+map.radius;
	} else if (player.ycoor+map.radius > map.height) {
		start_y = player.ycoor-map.radius;
		end_y = map.height+map.radius-1;
	}
	else {
		start_y = player.ycoor-map.radius;
		end_y = player.ycoor+map.radius;
	}

	var start_x;
	var end_x;
	if (player.xcoor-map.radius < map.radius){
		start_x = player.xcoor-map.radius;
		end_x = player.xcoor+map.radius;
	} else if (player.xcoor+map.radius > map.width) {
		start_x = player.xcoor-map.radius;
		end_x = map.width+map.radius-1;
	} else {
		start_x = player.xcoor-map.radius;
		end_x = player.xcoor+map.radius;
	}

	// For all tiles within a certain radius around the player
  	for(var y = start_y; y <= end_y; y++) {
  		for(var x = start_x; x <= end_x; x++) {
  			if (map.tile_array[x][y].type == 2) {
				for (var gamePlayer = 0; gamePlayer < 2; gamePlayer++){
					if (gamePlayer === 0) {
						if (player.xcoor == x && player.ycoor == y) {
						// draw player character
						drawPlayerObject(player.type, player.direction, (map.tile_size+4)*(tile_xcoor), map.tile_size*(tile_ycoor), map.tile_size);
						} 
					} else {
						if (opponent.xcoor == x && opponent.ycoor == y){
						// draw opponent
						drawPlayerObject(opponent.type, opponent.direction, (map.tile_size+4)*(tile_xcoor), map.tile_size*(tile_ycoor), map.tile_size);
						}
					}
				}
			}
			tile_xcoor = tile_xcoor+1;
  		}
		tile_xcoor = 0;
		tile_ycoor = tile_ycoor+1;
	}
}

function drawPlayerMotion(map, offset) {
	// Onscreen tile index
	var tile_xcoor = 0;
	var tile_ycoor = 0;

	// Calculate vertical start and end points for camera
	var start_y;
	var end_y;
	if (player.ycoor-map.radius < map.radius) {
		start_y = player.ycoor-map.radius;
		end_y = player.ycoor+map.radius;
	} else if (player.ycoor+map.radius > map.height) {
		start_y = player.ycoor-map.radius;
		end_y = map.height+map.radius-1;
	}
	else {
		start_y = player.ycoor-map.radius;
		end_y = player.ycoor+map.radius;
	}

	var start_x;
	var end_x;
	if (player.xcoor-map.radius < map.radius){
		start_x = player.xcoor-map.radius;
		end_x = player.xcoor+map.radius;
	} else if (player.xcoor+map.radius > map.width) {
		start_x = player.xcoor-map.radius;
		end_x = map.width+map.radius-1;
	} else {
		start_x = player.xcoor-map.radius;
		end_x = player.xcoor+map.radius;
	}

	// For all tiles within a certain radius around the player
  	for(var y = start_y; y <= end_y; y++) {
  		for(var x = start_x; x <= end_x; x++) {
  			// Draw player
  			if (map.tile_array[x][y].type == 2) {
	  			// Check if the current map tile contains the current player
	  			for (var gamePlayer = 0; gamePlayer < 2; gamePlayer++){
	  				if (gamePlayer == 0) {
	  					if (player.xcoor == x && player.ycoor == y) {
	  						if(player.distance_left <= 0) {
	  							player.distance_left = 0;
	  							player.moving = 0;
	  						} else {
	  							player.distance_left = player.distance_left - 8.6;
	  						}
	  					
	  						drawPlayerObject(player.type, player.direction, (map.tile_size+4)*(tile_xcoor), map.tile_size*(tile_ycoor), map.tile_size);
	  					}
	  				} else {
	  					if (opponent.xcoor == x && opponent.ycoor == y) {
	  						if(opponent.distance_left <= 0) {
	  							opponent.distance_left = 0;
	  							opponent.moving = 0;
	  						} else {
	  							opponent.distance_left = opponent.distance_left - 8.6;
	  						}
	  					
	  						drawPlayerObject(opponent.type, opponent.direction, (map.tile_size+4)*(tile_xcoor), map.tile_size*(tile_ycoor), map.tile_size);
	  					}
	  				}
	  				
	  			}
	  			
  			}
			tile_xcoor = tile_xcoor + 1;
		}
		tile_xcoor = 0;
		tile_ycoor = tile_ycoor + 1;
  	}
}

function drawPlayerObject(type, direction, xcoor, ycoor, tile_size) {
	switch(direction) {
		case 'down':
			if (type == 'defender'){
				image(defender_back, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			} else {
				image(attacker_back, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			}
			break;
		case 'up':
			if (type =='defender'){
				image(defender_front, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			} else {
				image(attacker_front, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			}
			break;
		case 'left':
			if (type == 'defender'){
				image(defender_left, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			} else {
				image(attacker_left, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			}
			break;
		case 'right':
			if (type == 'defender'){
				image(defender_right, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			} else {
				image(attacker_right, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			}
			break;
		default:
			if (type == 'defender'){
				image(defender_front, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			} else {
				image(attacker_front, xcoor, ycoor, tile_size*(2/3),tile_size*(2/3));
			}
	}
}

function drawMiniMap() {
	var mini_tile_size = 8;
	var map_width = map.width + map.radius;
	var map_height = map.height + map.radius;
	var start_x = (map.radius*2+1)*map.tile_size + 10;

	fill(255);
	noStroke();

	for(var y = 0; y < map_height; y++) {
		for (var x = 0; x < map_width; x++) {
			switch(map.tile_array[x][y].type) {
				case 0:
					fill(255);
					break;
				case 1:
					fill(0);	
					break;
				case 2:
					if (player.xcoor == x && player.ycoor == y) {
						fill(0,38,255);
					} else {
						fill(255);
					}
					break;
				case 3:
					fill(181,181,7);
					break;
				default:
			}
			rect((mini_tile_size*x)+start_x, y*mini_tile_size, mini_tile_size, mini_tile_size);
		}
	}
}

function drawTile(tile, xcoor, ycoor) {
	switch(tile.type){
		case 0:
			image(grass,tile.size*xcoor,tile.size*ycoor,tile.size,tile.size);
			break;
		case 1:
			image(wall,tile.size*xcoor,tile.size*ycoor,tile.size,tile.size);
			break;
		case 2:
			image(grass,tile.size*xcoor,tile.size*ycoor,tile.size,tile.size);
			break;
		case 3:
			image(grass,tile.size*xcoor,tile.size*ycoor,tile.size,tile.size);
			image(objective,tile.size*xcoor,tile.size*ycoor,tile.size,tile.size);
			break;
		default:
			image(grass,tile.size*xcoor,tile.size*ycoor,tile.size,tile.size);
	}
}

function keyPressed() {
	// Check if controls are enabled
	//if (ENABLE_CONTROLS == true) {
		switch(key) {

			// User presses '1'
			case '1':
				//Toggle Debug mode on/off
				if (DEBUG_MODE==false) {
					DEBUG_MODE=true;
				} else {
					DEBUG_MODE=false;
				}
				break;

			// User presses 'w'
			case 'w':
				// Check to make sure player is not already moving
				if(player.moving==0) {
					// Check if the player is allowed to move up 1 tile
					if(userHighlightsPossibleMove(player.xcoor, player.ycoor-1, player.xcoor, player.ycoor-1)) {
						// Move the player up 1 tile
						player.action = 'move';
						movePlayer(player, map, player.xcoor, player.ycoor-1);
					}
				}
				break;
			case 'W':
				// Check to make sure player is not already moving
				if(player.moving==0) {
					// Check if the player is allowed to move up 1 tile
					if(userHighlightsPossibleMove(player.xcoor, player.ycoor-1, player.xcoor, player.ycoor-1)) {
						// Move the player up 1 tile
						player.action = 'move';
						movePlayer(player, map, player.xcoor, player.ycoor-1);
					}
				}
				break;

			// User press 'a'
			case 'a':
				// Check to make sure player is not already moving
				if(player.moving==0) {
					// Check if the player is allowed to move left 1 tile
					if(userHighlightsPossibleMove(player.xcoor-1, player.ycoor, player.xcoor-1, player.ycoor)) {
						// Move the player left 1 tile
						player.action = 'move';
						movePlayer(player, map, player.xcoor-1, player.ycoor);
					}
				}
				break;
			case 'A':
				// Check to make sure player is not already moving
				if(player.moving==0) {
					// Check if the player is allowed to move left 1 tile
					if(userHighlightsPossibleMove(player.xcoor-1, player.ycoor, player.xcoor-1, player.ycoor)) {
						// Move the player left 1 tile
						player.action = 'move';
						movePlayer(player, map, player.xcoor-1, player.ycoor);
					}
				}
				break;

			// User presses 's'
			case 's':
				// Check to make sure player is not already moving
				if(player.moving==0) {
					// Check if the player is allowed to move down 1 tile
					if(userHighlightsPossibleMove(player.xcoor, player.ycoor+1, player.xcoor, player.ycoor+1)) {
						// Move the player down 1 tile
						player.action = 'move';
						movePlayer(player, map, player.xcoor, player.ycoor+1);
					}
				}
				break;
			case 'S':
				// Check to make sure player is not already moving
				if(player.moving==0) {
					// Check if the player is allowed to move down 1 tile
					if(userHighlightsPossibleMove(player.xcoor, player.ycoor+1, player.xcoor, player.ycoor+1)) {
						// Move the player down 1 tile
						player.action = 'move';
						movePlayer(player, map, player.xcoor, player.ycoor+1);
					}
				}
				break;

			// User presses 'd'
			case 'd':
				// Check to make sure player is not already moving
				if(player.moving==0) {
					// Check if the player is allowed to move right 1 tile
					if(userHighlightsPossibleMove(player.xcoor+1, player.ycoor, player.xcoor+1, player.ycoor)) {
						// Move the player right 1 tile
						player.action = 'move';
						movePlayer(player, map, player.xcoor+1, player.ycoor);
					}
				}
				break;
			case 'D':
				// Check to make sure player is not already moving
				if(player.moving==0) {
					// Check if the player is allowed to move right 1 tile
					if(userHighlightsPossibleMove(player.xcoor+1, player.ycoor, player.xcoor+1, player.ycoor)) {
						// Move the player right 1 tile
						player.action = 'move';
						movePlayer(player, map, player.xcoor+1, player.ycoor);
					}
				}
				break;
			default:
				// If any other key was pressed, do nothing
		}
	//}
}
;// once the player has moved send data
function endTurn(){
	//var socket = io.connect(window.location.hostname);
	
	if (player.xcoor == opponent.xcoor && player.ycoor == opponent.ycoor){
		if (player.type == 'attacker') {
			gameOver(opponent.type);
		} else if (player.type == 'defender') {
			gameOver(player.type);
		}
		
		//socket.in(room).emit('gameOver');
	
	} else if (player.type == 'attacker' && player.numStars == settings.numObjectives){
		gameOver(player.type);
		//socket.in(room).emit('gameOver');
	
	} else {
		//socket.in(room).emit('turnOver', socket.room, player);
		sendTurnData(false, '');
	}

}

function sendTurnData(gameOver, winner) {
	var turnData = {
		'turn_num': turn_num+1,
		'attacker': null,
		'defender': null,
		'gameOver': false,
		'winner': ''
	}

	if (player.type == 'attacker') {
		turnData.attacker = player;
		turnData.defender = opponent;
	} else if (player.type == 'defender') {
		turnData.attacker = opponent;
		turnData.defender = player;
	}

	if (gameOver) {
		turnData.winner = winner;
	}

	/*
	$.ajax({
		url: '/turn', // sending game settings to DB
		type: 'POST',
		data: JSON.stringify(turnData),
		contentType: 'application/json',
		dataType: 'json',
		success: successHandler
	});
	*/
}

// game over send data to database
function gameOver(winner){
	sendTurnData(true);
	window.location.assign("http://localhost:3000/gameOver.html")

	if (player.type == winner) {
		document.getElementById('displayWinner').innerText = 'You Won!';
	} else {
		document.getElementById('displayWinner').innerText = 'You Lost...';
	}
	
};;$(document).ready(function() {
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
});;function movePlayer(player, map, x, y){
	// Update map data
	// Set old title to unoccupied

	// check if the defender was on the objective
	if (player.type == 'defender') {
		for (var n = 0; n < settings.numObjectives; n++){
			// if it wasn't already taken, redraw the objective
			if(game_objects[n].type=='star' && game_objects[n].taken !== false) {
				if(game_objects[n].xcoor == player.xcoor && game_objects[n].ycoor == player.ycoor){
					map.tile_array[player.xcoor][player.ycoor].type = 3;
				}
			// else set it to unoccupied
			} else {
				map.tile_array[player.xcoor][player.ycoor].type = 0;
			}
		}

	} else {
		map.tile_array[player.xcoor][player.ycoor].type = 0;
	}
	
	// Check if there's an item on the new tile
	if(map.tile_array[x][y].type != 0) {
		if (player.type == 'attacker') {
			// Set new tile data to not have an item
			map.tile_array[x][y].type = 0;
			player.numStars = player.numStars + 1;
			for (var n = 0; n < settings.numObjectives; n++){
				if(game_objects[n].type == 'star' && game_objects[n].xcoor == x && game_objects[n].ycoor == y){
					game_objects[n].taken == true;
				}
			}
		}

		if (settings.enableItems == true) {
			// Checks array of all in-play items to see which item was on the new tile
			for (var object = 0; object < game_objects.length; object++) {
				if (x == game_objects[object].xcoor && y == game_objects[object].ycoor) {
					// Adds the item to the player's inventory
					player.items.push(new GameObject(game_objects[object]));
					game_objects[object].taken = true;

					// Removes the item from the array of all in-play items
					game_objects.splice(object,1);
				}
			}
		}
		
	}

	// Updates tile accessibility for all tiles around the player's old tile
	updateTileAccessibility(map, player.xcoor, player.ycoor);

	// Determine direction of movement animation
	if (x < player.xcoor && y == player.ycoor) {
		player.direction = "left";
	} else if (x > player.xcoor && y == player.ycoor) {
		player.direction = "right";
	} else if (x == player.xcoor && y < player.ycoor) {
		player.direction = "down";
	} else if (x == player.xcoor && y > player.ycoor) {
		player.direction = "up";
	}

	// Update player data
	player.oldXCoor = player.xcoor;
	player.oldYcoor = player.ycoor;
	player.xcoor = x;
	player.ycoor = y;

	// Set new tile data to have the player
	map.tile_array[x][y].type = 2;

	// Updates tile accessibility for all tiles around the player's old tile
	updateTileAccessibility(map, x, y);

	// Start movement animation
	player.moving = 1;
	player.action = 'move';
	player.distance_left = map.tile_size;

	// once the player finished moving end their turn;
	endTurn();
}

function updateTileAccessibility(map, x, y) {
	// Checks to see if: Left Tile is accessible
	// Tile(x,y) is not on the left most column of tiles
	// Tile to the left of Tile (x,y) is not a wall
	// Only if all the above are true does it set tile to the left of Tile(x,y) as accessible
	if (x != 0 && map.tile_array[x-1][y].type != 1) {
		map.tile_array[x-1][y].tile_accessibility = 1;
	} else {
		map.tile_array[x-1][y].tile_accessibility = 0;
	}

	// Checks to see if: Right Tile is accessible
	// Tile(x,y) is not on the right most column of tiles
	// Tile to the right of Tile (x,y) is not a wall
	// Only if all the above are true does it set tile to the right of Tile(x,y) as accessible
	if (x != map.size_horizontal-1 && map.tile_array[x+1][y].type != 1) {
		map.tile_array[x+1][y].tile_accessibility = 1;
	} else {
		map.tile_array[x+1][y].tile_accessibility = 0;
	}

	// Checks to see if: Top Tile is accessible
	// Tile(x,y) is not on the top most row of tiles
	// Tile to the top of Tile (x,y) is not a wall
	// Only if all the above are true does it set tile to the top of Tile(x,y) as accessible
	if (y != 0 && map.tile_array[x][y-1].type != 1) {
		map.tile_array[x][y-1].tile_accessibility = 1;
	} else {
		map.tile_array[x][y-1].tile_accessibility = 0;
	}

	// Checks to see if: Bottom Tile is accessible
	// Tile(x,y) is not on the bottom most row of tiles
	// Tile to the bottom of Tile (x,y) is not a wall
	// Only if all the above are true does it set tile to the bottom of Tile(x,y) as accessible
	if (y != map.size_vertical-1 && map.tile_array[x][y+1].type != 1) {
		map.tile_array[x][y+1].tile_accessibility = 1;
	} else {
		map.tile_array[x][y+1].tile_accessibility = 0;
	}
}

// Check if move is possible
function userHighlightsPossibleMove(map_x, map_y, mouse_x, mouse_y) {
	if (mouse_x==map_x && map_y==mouse_y && map.tile_array[map_x][map_y].tile_accessibility == 1) {
		return true;
	}
 	return false;	
};$(document).ready(function() {
	var socket = io.connect(window.location.hostname);

	$("#defender").on("click",function() {
  		sessionStorage.setItem('playerType', 'defender');
		socket.on('connect', function() {
			socket.emit('chooseDefender', socket.id);
		});

		socket.on('foundOpponent', function(opponent, room) {

		});
  	});
  	$("#attacker").on("click", function() {
		sessionStorage.setItem('playerType', 'attacker');

		socket.on('connect', function() {
			socket.emit('chooseAttacker', socket.id);
		});

	});
});