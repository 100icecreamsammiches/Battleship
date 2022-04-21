function getRoom(){
    document.getElementById("find").innerHTML = "Finding...";
    var socket = io({"forceNew": true});
    socket.on("found", function(room){
        window.location.href += '/play?room=' + room;
    })
    socket.emit("requestRoom");
}

function createRoom(){
    var socket = io({"forceNew": true});
    socket.on("found", function(room){
        window.location.href += '/play?room=' + room;
    })
    socket.emit("createRoom");
}