from flask import Flask, render_template, url_for, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import secrets
import logging

async_mode = None

#Sets up flask and socketio server
app = Flask(__name__)
socketio = SocketIO(app, async_mode=async_mode, ping_interval=(5,5))

#Disables logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

#List of connected rooms and users
rooms = {}
users = {}

#Website pages
@app.route("/play")
def main():
    return render_template("play.html", sync_mode=socketio.async_mode)

@app.route("/")
def home():
    return render_template("home.html", sync_mode=socketio.async_mode)

#Either creates a room or puts the user in one
@socketio.event
def join(data):
    if not data["room"]:
        room = secrets.token_urlsafe(6)
        join_room(room)
        emit("start", {"turn": True, "room": room}, room=room)
        if room in rooms:
            rooms[room] += 1
        else:
            rooms[room] = 1
        users[request.sid] = room
    else:
        join_room(data["room"])
        if data["room"] in rooms:
            rooms[data["room"]] += 1
        else:
            rooms[data["room"]] = 1
        emit("start", {"turn": rooms[data["room"]] % 2 == 1, "room": data["room"]}, room=data["room"])
        users[request.sid] = data["room"]


#Closes disconnected rooms and puts the user in an open one
@socketio.event
def requestRoom():
    purgeConnections()
    for room in rooms.keys():
        if rooms[room] == 1:
            emit("found", room)
            return

@socketio.event
def createRoom():
    emit("found", secrets.token_urlsafe(6))

#Passes game data between players
@socketio.event
def turn(data):
    emit("turn", data, to=data["room"], include_self=False)
    
@socketio.event
def result(data):
    emit("result", data, to=data["room"], include_self=False)

@socketio.event
def win(data):
    emit("win", data, to=data["room"], include_self=False)

@socketio.event
def ready(data):
    emit("ready", data, to=data, include_self=False)


#Closes rooms when someone disconnects
@socketio.event
def disconnect():
    print("Someone disconnected")
    if request.sid in users.keys():
        leave_room(users[request.sid])
        rooms[users[request.sid]] -= 1
        if rooms[users[request.sid]] < 1:
            rooms.pop(users[request.sid])
        users.pop(request.sid)

#Keep alive pong
@socketio.event
def ack():
    pass

#Checks that all users are connected
def purgeConnections():
    for user in users.keys():
        emit("checkConnected", to=user)
        
#Hosts website
if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0")