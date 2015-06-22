function movePlayer(player, map, x, y){
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
}