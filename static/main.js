//Basic document details
const canvas = document.getElementById("main-canvas");
const context = canvas.getContext("2d");
var bounding = canvas.getBoundingClientRect();
var room = false;
var socket = io({"forceNew": true});
var shareLink = window.location.href

//Graphics and formatting details
canvas.width = window.innerHeight * .45;
canvas.height = window.innerHeight * .9;
canvas.style.marginLeft = "auto";
canvas.style.marginRight = "auto";
var params = new URLSearchParams(window.location.search);
var leftBound = (window.innerWidth / 2) - (canvas.width/2);
const rots = [[1, 0], [0, 1], [-1, 0], [0,-1]];
const bottomColors = ["#33AAFFAA", "#AAAAAA", "#FF0000", "#FFFFFF"];
const topColors = ["#CCCCCCAA", "#FFFFFF", "#FF0000"];

//Game Data
var ships = [];
var place = [5, 5, 0, 2];
var sunk = ["Destroyer", "Submarine", "Cruiser", "Battleship", "Carrier"];
var enemySunk = ["Destroyer", "Submarine", "Cruiser", "Battleship", "Carrier"];
var lastHit = [0, 0];
var enemyJoined = false;
var enemyReady = false;
var isTurn = false;
var first = null;
var won = null;
var playerStats = "";
var enemyStats = "";
var topGrid = JSON.parse(JSON.stringify(Array(10).fill(Array(10).fill(0))));
var bottomGrid = JSON.parse(JSON.stringify(Array(10).fill(Array(10).fill(0))));

//Connect to the server and room
socket.on("connect", function (){
    hash = window.location.hash
    if (hash == "" || hash == "#"){
        socket.emit("join", {room:false});
    }
    else{
        room = hash.slice(1,hash.length)
        shareLink = window.location.href + "#"+ room;
        socket.emit("join", {room:room});
        document.getElementById("shareText").innerHTML = "Room: " + room
    }
})

//Creates a list of numbers from start to end
function range(start, end){
	var out = []
	for (var i = start; i < end; i++){
		out.push(i);
	}
	return out;
}

//Draws both grids using game data
function renderGrid(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#111111";
    context.fillRect(canvas.width, canvas.height, 0, 0);
    tileWidth = canvas.width / 10;
    tileHeight = canvas.height / 21;
    const fontSize = tileWidth / 1.5;
    context.font = fontSize + 'px serif';

    //Draws the top grid
    for (var y = 0; y < 10; y++){
        for (var x = 0; x < 10; x++){
            context.beginPath();
            context.fillStyle = topColors[topGrid[y][x]];
            context.strokeStyle = "#000000";
            context.fillRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
            context.strokeRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
            context.stroke();
        }
    }

    //Draws the bottom grid
    for (var y = 11; y < 21; y++){
        for (var x = 0; x < 10; x++){
            context.beginPath();
            context.fillStyle = bottomColors[bottomGrid[y-11][x]];
            context.strokeStyle = "#000000";
            context.fillRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
            context.strokeRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
            context.stroke();
        }
    }

    //Draws the highlighted space if applicable
    if ((isTurn || ships.length < 5) && enemyJoined && won==null){
        for (var j = 0; j < place[3]; j++){
            context.beginPath();
            if (range(0,10).indexOf(place[0]+(j*rots[place[2]][0]) != -1 && range(0,10).indexOf(place[1]+(j*rots[place[2]][1]))) != -1){
                context.fillStyle = "#FF00FF77";
                if (ships.length < 5){
                    context.fillRect((place[0]+(j*rots[place[2]][0]))*tileWidth, (11+place[1]+(j*rots[place[2]][1]))*tileHeight, tileWidth, tileHeight);
                }
                else{
                    context.fillRect((place[0]+(j*rots[place[2]][0]))*tileWidth, (place[1]+(j*rots[place[2]][1]))*tileHeight, tileWidth, tileHeight);
                }
                context.stroke();
            }
        }
    }

    //Updates Status information in the corners
    playerStats = "Your Ships:<br>";
    for (var i of sunk){
        playerStats += (i?i:"Sunk!") + "<br>"
    }
        
    enemyStats = "Enemy's Ships:<br>";
    for (var i of enemySunk){
        enemyStats += (i?i:"Sunk!") + "<br>";
    }

    if (ships.length == 5 && enemyReady){
        if (isTurn){
            playerStats += "Your Turn!";
        } 
        else {
            enemyStats += "Enemy's Turn!";
        }
    }

    else{
        if (enemyReady){
            enemyStats += "Enemy Ships Placed!"
        }
        else{
            enemyStats += "Waiting for enemy to place ships..."
        }
    }

    if(enemyJoined){
        document.getElementById("player").innerHTML = playerStats;
        document.getElementById("enemy").innerHTML = enemyStats;
    }
}

renderGrid();

//Mouse Functions
document.onkeydown = keyPress;
document.onmousemove = mouseMove;
document.onmousedown = click;

function mouseMove(e){
    mousePos = {
		x: e.clientX - leftBound,
		y: e.clientY - bounding.top
	};
    if (enemyJoined && won == null){
        if (ships.length < 5){
            if (mousePos.x >= 0 && mousePos.x <= canvas.width && mousePos.y >= canvas.height/(21/11) && mousePos.y  <=     canvas.height) {
                //Draws highlighted ship space
                place[0] = Math.floor(mousePos.x * (10 / canvas.width));
                place[1] = Math.floor(mousePos.y * (21 / canvas.height)) - 11;
                renderGrid();
            }
        }
        else{
            if (mousePos.x >= 0 && mousePos.x <= canvas.width && mousePos.y <= canvas.height/(21/10) && mousePos.y  >=     0){
                //Draws targeted space
                place[0] = Math.floor(mousePos.x * (10 / canvas.width));
                place[1] = Math.floor(mousePos.y * (21 / canvas.height));
                renderGrid();
            }
        }
    }
}

//Rotates the ship placement
function keyPress(e){
    if (e.key=="r" && won == null && first != null){
        place[2] = (place[2] + 1) % 4;
        renderGrid();
    }
}

function click(e){
	if (e.button == 0){
		mousePos = {
			x: Math.floor((e.clientX - leftBound) * (10 / canvas.width)),
			y: Math.floor((e.clientY - bounding.top) * (21 / canvas.height))
		}
		if (ships.length < 5 && enemyJoined && won == null){
            //Checks that a ship can be placed
			var tempShip = []
			for (var j = 0; j < place[3]; j++){
				tempShip.push([place[0]+(j*rots[place[2]][0]), place[1]+(j*rots[place[2]][1])]);
			}
			var passed = true;
			for (var i of tempShip){
				if (i[0] < 0 || i[0] > 9 || i[1] < 0 || i[1] > 9 || bottomGrid[i[1]][i[0]] != 0){
					passed = false;
				}
			}

            //Places the ship
			if (passed){
				ships.push(tempShip);
				for (var i of tempShip){
					bottomGrid[i[1]][i[0]] = 1;
				}
				if (ships.length != 2){
					place[3] += 1;
				}
                if (ships.length == 5){
                    place[3] = 1;
                    if (enemyReady){
                        isTurn = first;
                    }
                    sendReady();
                }
				renderGrid(topGrid, bottomGrid, context);
			}
		}

        //Attempts to fire at the enemy
        else if(mousePos.y < 11 && isTurn && enemyReady && topGrid[mousePos.y][mousePos.x] == 0 && won == null){
            sendTurn(mousePos.x, mousePos.y);
            lastHit = [mousePos.x, mousePos.y];
            renderGrid();
        }
	}
}

//Checks a hit from the enemy against the bottom grid
function hit(x, y){
    var hit = bottomGrid[y][x] == 1
    if (hit){
        bottomGrid[y][x] = 2;

        //Hits a ship
        for (var i = 0; i < ships.length; i++){
            for(var j = 0; j < ships[i].length; j++){
                if (JSON.stringify(ships[i][j]) == JSON.stringify([x,y])){
                    ships[i].splice(j,1);

                    if (ships[i].length == 0){
                        //Sinks a ship if hit enough times
                        sunk[i] = false;

                        //Checks if the player has lost
                        if (sunk.every(e=>!e)){
                            isTurn = false;
                            won = false;
                            place[3] = 0;
                            renderGrid();
                            document.getElementById("player").innerHTML = "You Lost.";
                            document.getElementById("enemy").innerHTML = "You Lost.";
                        }
                        else{
                            renderGrid();
                        }
                    }
                    else{
                        renderGrid();
                    }
                }
            }
        }
    }

    //Misses a ship
    else if(bottomGrid[y][x] == 0){
        bottomGrid[y][x] = 3;
        renderGrid();
    }

    //Returns results
    return {hit: hit, sunk: sunk, room:room};
}

//Upon joining the game, checks what the game state is
socket.on("start", function (data){
    if (first == null){
        first = !!data.turn;
        if (first){
            document.getElementById("player").innerHTML = "Waiting on opponent...";
        }
            
        else{ 
            document.getElementById("player").innerHTML = "Place Your Ships!";
            enemyJoined = true;
            renderGrid();
        }
    }
    else{
        enemyJoined = true;
        document.getElementById("player").innerHTML = "Place Your Ships!";
        renderGrid();
    }

    //Sets the room and share link
    if (!room){
        room = data.room;
        shareLink = window.location.href + "#" + room;
        document.getElementById("shareText").innerHTML = "Room: " + room
        window.location.hash = room
    }
})

//Says that all ships are placed
function sendReady(){
    socket.emit("ready", room);
}

//Confirms that the opponent has placed all ships
socket.on("ready", function (data){
    enemyReady = true;
    if (ships.length == 5){
        isTurn = first;
        renderGrid();
    }
})

//Sends a shot
function sendTurn(x, y){
    socket.emit("turn", {coords: [x, y], room: room});
    isTurn = false;
}

//On recieving a hit, checks the results and sends them to the opponent
socket.on("turn", function (data) {
    isTurn = true;
    socket.emit("result", hit(data.coords[0], data.coords[1]));
    renderGrid();
})

//Updates the result of your shot using the enemies data
socket.on("result", function (data){
    if (data.hit){
        topGrid[lastHit[1]][lastHit[0]] = 2;
    }
    else{
        topGrid[lastHit[1]][lastHit[0]] = 1;
    }
    enemySunk = data.sunk;
    renderGrid();
    if (enemySunk.every(e=>!e)){
        isTurn = false;
        won = true;
        place[3] = 0;
        renderGrid();
        document.getElementById("player").innerHTML = "You Won!";
        document.getElementById("enemy").innerHTML = "You Won!";
    }
})


//Keep alive ping
socket.on("checkConnected", function(){
    socket.emit("ack")
})