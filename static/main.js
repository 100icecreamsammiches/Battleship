const canvas = document.getElementById("main-canvas");
const context = canvas.getContext("2d");
var bounding = canvas.getBoundingClientRect();

canvas.width = window.innerHeight * .45;
canvas.height = window.innerHeight * .9;
canvas.style.marginLeft = "auto";
canvas.style.marginRight = "auto";

var ships = [];
var place = [5, 5, 0, 2];

var topGrid = JSON.parse(JSON.stringify(Array(10).fill(Array(10).fill(0))));
var bottomGrid = JSON.parse(JSON.stringify(Array(10).fill(Array(10).fill(0))));
var rots = [[1, 0], [0, 1], [-1, 0], [0,-1]];

renderGrid(topGrid, bottomGrid, context);

function renderGrid(topGrid, bottomGrid, context){
    context.clearRect(0, 0, canvas.width, canvas.height);
	tileWidth = canvas.width / 10;
	tileHeight = canvas.height / 21;
    const fontSize = tileWidth / 1.5;
    context.font = fontSize + 'px serif';
	for (var y = 0; y < 10; y++){
		for (var x = 0; x < 10; x++){
			context.beginPath();
            context.fillStyle = "#FFFFFF";
		    context.strokeStyle = "#000000";
			context.strokeRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
			context.stroke();
		}
	}
    for (var y = 11; y < 21; y++){
		for (var x = 0; x < 10; x++){
			context.beginPath();
			if (bottomGrid[y-11][x] == 2){
				context.fillStyle = "#FF0000";
			}
			else if (bottomGrid[y-11][x] == 1){
				context.fillStyle = "#AAAAAA";
			}
			else{
            	context.fillStyle = "#33AAFF";
			}
		    context.strokeStyle = "#000000";
			context.fillRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
			context.strokeRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
			context.stroke();
		}
	}
    if (ships.length < 5){
        for (var j = 0; j < place[3]; j++){
            context.beginPath();
			if (range(0,10).indexOf(place[0]+(j*rots[place[2]][0]) != -1 && range(0,10).indexOf(place[1]+(j*rots[place[2]][1]))) != -1){
            	context.fillStyle = "#FF00FF";
            	context.fillRect((place[0]+(j*rots[place[2]][0]))*tileWidth, (11+place[1]+(j*rots[place[2]][1]))*tileHeight, tileWidth, tileHeight);
            	context.stroke();
			}
        }
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

    if (mousePos.x >= 0 && mousePos.x <= canvas.width && mousePos.y >= canvas.height/(21/11) && mousePos.y  <= canvas.height) {
        place[0] = Math.floor(mousePos.x * (10 / canvas.width));
        place[1] = Math.floor(mousePos.y * (21 / canvas.height)) - 11;
        renderGrid(topGrid, bottomGrid, context);
    }
}

function keyPress(e){
    if (e.key=="r"){
        place[2] = (place[2] + 1) % 4
        renderGrid(topGrid, bottomGrid, context);
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
					console.log(bottomGrid[i[1]][i[0]])
					bottomGrid[i[1]][i[0]] = 1;
				}
				if (ships.length != 2){
					place[3] += 1;
				}
				console.log(bottomGrid);
				renderGrid(topGrid, bottomGrid, context);
			}
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