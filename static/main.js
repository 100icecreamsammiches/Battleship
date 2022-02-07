const canvas = document.getElementById("main-canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerHeight * .45;
canvas.height = window.innerHeight * .9;
canvas.style.marginLeft = "auto";
canvas.style.marginRight = "auto";

renderGrid(1, 2, context);

var ships = [[5, 5, 0, -1, 3], [1, 1, 1, 0, 2]]

function renderGrid(topGrid, bottomGrid, context){
    context.clearRect(0, 0, canvas.width, canvas.height);
	tileWidth = canvas.width / 8;
	tileHeight = canvas.height / 17;
    const fontSize = tileWidth / 1.5;
    context.font = fontSize + 'px serif';
	for (var y = 0; y < 8; y++){
		for (var x = 0; x < 8; x++){
			context.beginPath();
            context.fillStyle = "#FFFFFF";
		    context.strokeStyle = "#000000";
			context.strokeRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
			context.stroke();
		}
	}
    for (var y = 9; y < 17; y++){
		for (var x = 0; x < 8; x++){
			context.beginPath();
            context.fillStyle = "#FFFFFF";
		    context.strokeStyle = "#000000";
			context.strokeRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
			context.stroke();
		}
	}
    for (var i of ships){
        for (var j = 0; j < i[4]; j++){
            context.beginPath();
            context.fillStyle = "#FF00FF";
            context.fillRect((i[0]+(j*i[2]))*tileWidth, (9+i[1]+(j*i[3]))*tileHeight, tileWidth, tileHeight);
            context.stroke();
        }
    }
}