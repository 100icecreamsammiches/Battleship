//Asks the server to find an open room
function getRoom(){
    document.getElementById("find").innerHTML = "Finding...";
    var socket = io({"forceNew": true});
    socket.on("found", function(room){
        window.location.href += 'play#' + room;
    })
    socket.on("noneFound", function(room){
        document.getElementById("find").innerHTML = "No Open Rooms";
    })
    socket.emit("requestRoom");
}

//Creates a new room using the text field
function createRoom(){
    var socket = io({"forceNew": true});
    socket.on("found", function(room){
        window.location.href += 'play#' + room;
    })
    socket.emit("createRoom");
}

document.onkeydown = keyPress
window.addEventListener("DOMContentLoaded", ()=>{
    document.getElementById("play").addEventListener("click", createRoom)
})

//Makes pressing enter on the text field redirect properly
function keyPress(e){
    if (e.keyCode == 13){
        e.preventDefault();
        document.getElementById("createRoom").click();
    }
}