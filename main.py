from flask import Flask, render_template, url_for, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import secrets
import logging
from time import sleep
import asyncio

async_mode = None

full = True
previewed = False;

app = Flask(__name__)
socketio = SocketIO(app, async_mode=async_mode)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

rooms = {}
users = {}
#connected = False
connected = {}

@app.route("/play")
def main():
    return render_template("play.html", sync_mode=socketio.async_mode)

@app.route("/")
def home():
    return render_template("home.html", sync_mode=socketio.async_mode)

@socketio.event
def joined():
    print("hello")

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

@socketio.event
def turn(data):
    room = data["room"]
    emit("turn", data, to=room, include_self=False)
    
@socketio.event
def result(data):
    room = data["room"]
    emit("result", data, to=room, include_self=False)

@socketio.event
def win(data):
    room = data["room"]
    emit("win", data, to=room, include_self=False)

@socketio.event
def ready(data):
    emit("ready", data, to=data, include_self=False)

@socketio.event
def disconnect():
    print("Someone disconnected")
    if request.sid in users.keys():
        leave_room(users[request.sid])
        rooms[users[request.sid]] -= 1
        if rooms[users[request.sid]] < 1:
            rooms.pop(users[request.sid])
        users.pop(request.sid)

@socketio.event
def ack():
    pass
    #connected[request.sid] = True
"""
def checkConnected(user):
    emit("checkConnected", to=user)
    asyncio.sleep(1)
    if not (user in connected.keys()):
        print("not connected")
        connected[user] = False
"""

def purgeConnections():
    """
    global connected
    connected = {}
    loop = asyncio.new_event_loop()
    result = loop.run_in_executor(None, asyncio.gather, map(checkConnected, users.keys()))
    print(result)"""
    for user in users.keys():
        emit("checkConnected", to=user)
        #if not connected[user]:
         #   rooms[users[user]] -= 1
    #print(connected)
        

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0")