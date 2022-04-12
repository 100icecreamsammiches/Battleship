const canvas = document.getElementById("main-canvas");
const context = canvas.getContext("2d");
var bounding = canvas.getBoundingClientRect();

canvas.width = window.innerHeight * .45;
canvas.height = window.innerHeight * .9;
canvas.style.marginLeft = "auto";
canvas.style.marginRight = "auto";

var socket = io({"forceNew": true});

var ships = [];
var place = [5, 5, 0, 2];
var sunk = [false, false, false, false, false];
var enemySunk = [false, false, false, false, false];
var lastHit = [0, 0];

var isTurn = false;
var first = null;

var topGrid = JSON.parse(JSON.stringify(Array(10).fill(Array(10).fill(0))));
var bottomGrid = JSON.parse(JSON.stringify(Array(10).fill(Array(10).fill(0))));
const rots = [[1, 0], [0, 1], [-1, 0], [0,-1]];
const bottomColors = ["#33AAFF", "#AAAAAA", "#FF0000", "#FFFFFF"];
const topColors = ["#CCCCCC", "#FFFFFF", "#FF0000"]

function renderGrid(){
    if (first != null){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#111111";
        context.fillRect(canvas.width, canvas.height, 0, 0);
    	tileWidth = canvas.width / 10;
    	tileHeight = canvas.height / 21;
        const fontSize = tileWidth / 1.5;
        context.font = fontSize + 'px serif';
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
        for (var j = 0; j < place[3]; j++){
            context.beginPath();
    		if (range(0,10).indexOf(place[0]+(j*rots[place[2]][0]) != -1 && range(0,10).indexOf(place[1]+(j*rots[place[2]][1]))) != -1){
                context.fillStyle = "#FF00FF";
                if (ships.length < 5){
                    context.fillRect((place[0]+(j*rots[place[2]][0]))*tileWidth, (11+place[1]+(j*rots[place[2]][1]))*tileHeight, tileWidth, tileHeight);
                }
                else{
                    context.fillRect((place[0]+(j*rots[place[2]][0]))*tileWidth, (place[1]+(j*rots[place[2]][1]))*tileHeight, tileWidth, tileHeight);
                }
                context.stroke();
    		}
        }
        document.getElementById("test").innerHTML = sunk;
    }
}

document.onkeydown = keyPress;
document.onmousemove = mouseMove;
document.onmousedown = click;


function mouseMove(e){
    mousePos = {
		x: e.clientX - bounding.left,
		y: e.clientY - bounding.top
	}
    if (first != null){
        if (ships.length < 5){
            if (mousePos.x >= 0 && mousePos.x <= canvas.width && mousePos.y >= canvas.height/(21/11) && mousePos.y  <=     canvas.height) {
                place[0] = Math.floor(mousePos.x * (10 / canvas.width));
                place[1] = Math.floor(mousePos.y * (21 / canvas.height)) - 11;
                renderGrid();
            }
        }
        else{
            if (mousePos.x >= 0 && mousePos.x <= canvas.width && mousePos.y <= canvas.height/(21/10) && mousePos.y  >=     0){
                
                place[0] = Math.floor(mousePos.x * (10 / canvas.width));
                place[1] = Math.floor(mousePos.y * (21 / canvas.height));
                renderGrid();
            }
        }
    }
}

function keyPress(e){
    if (e.key=="r"){
        
        place[2] = (place[2] + 1) % 4
        renderGrid();
    }
}

function click(e){
	if (e.button == 0){
		mousePos = {
			x: Math.floor((e.clientX - bounding.left) * (10 / canvas.width)),
			y: Math.floor((e.clientY - bounding.top) * (21 / canvas.height))
		}
		if (ships.length < 5){
			var tempShip = []
			for (var j = 0; j < place[3]; j++){
				tempShip.push([place[0]+(j*rots[place[2]][0]), place[1]+(j*rots[place[2]][1])])
			}
			var passed = true;
			for (var i of tempShip){
				if (i[0] < 0 || i[0] > 9 || i[1] < 0 || i[1] > 9 || bottomGrid[i[1]][i[0]] != 0){
					passed = false;
				}
			}
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
                }
				renderGrid(topGrid, bottomGrid, context);
			}
		}
        else if(mousePos.y < 11 && isTurn){
            sendTurn(mousePos.x, mousePos.y);
            lastHit = [x,y];
        }
	}
}

function range(start, end){
	var out = []
	for (var i = start; i < end; i++){
		out.push(i)
	}
	return out;
}

function hit(x, y){
    var hit = bottomGrid[y][x] == 1
    if (hit){
        bottomGrid[y][x] = 2;
        topGrid[y][x] = 2;
        console.log(JSON.stringify([x,y]))
        for (var i = 0; i < ships.length; i++){
            for(var j = 0; j < ships[i].length; j++){
                if (JSON.stringify(ships[i][j]) == JSON.stringify([x,y])){
                    ships[i].splice(j,1);
                    console.log(ships[i].length)
                    if (ships[i].length == 0){
                        sunk[i] = true;
                    }
                }
            }
        }
    }
    else if(bottomGrid[y][x] == 0){
        bottomGrid[y][x] = 3;
        topGrid[y][x] = 1;
    }
    renderGrid();
    isTurn = false;
    return {"hit": hit, "sunk": sunk}
}

function sendReady(){
    socket.emit("ready", JSON.stringify(bottomGrid))
}

function sendTurn(x, y){
    socket.emit("turn", JSON.stringify([x, y]))
}


socket.on("start", function (data){
    if (first == null){
        data = JSON.parse(data).turn;
        console.log(!!data.turn);
        first = !!data.turn;
        if (first){
            document.getElementById("test").innerHTML = "Waiting on opponent...";
        }
            
        else{ 
            document.getElementById("test").innerHTML = "Place Your Ships!";
            renderGrid();
        }
    }
    else{
        document.getElementById("test").innerHTML = "Place Your Ships!";
        renderGrid();
    }
})

socket.on("ready", function (data){
    if (ships.length == 5){
        isTurn = first;
    }
})

socket.on("turn", function (data) {
    var coords = JSON.parse(data);
    socket.emit("result", JSON.stringify(hit(coords[0], coords[1])));
    isTurn = true;
})

socket.on("result", function (data){
    data = JSON.parse(data);
    if (data.hit){
        topGrid[lastHit[1]][lastHit[0]] = 2;
    }
    else{
        topGrid[lastHit[1]][lastHit[0]] = 1;
    }
    enemySunk = data.sunk;
    renderGrid();
})