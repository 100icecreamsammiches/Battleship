from xml.etree.ElementInclude import include
from flask import Flask, render_template, url_for
from flask_socketio import SocketIO, emit
import json
import logging

async_mode = None

full = True

app = Flask(__name__)
socketio = SocketIO(app, async_mode=async_mode)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

@app.route("/")
def main():
    return render_template("index.html", sync_mode=socketio.async_mode)

connected = 0

@socketio.event
def joined():
    print("hello")

@socketio.event
def connect():
    print("joined")
    global connected
    connected += 1
    global full
    emit("start", json.dumps({"turn": full}), broadcast=True)
    full = not full
    print("someone joined, full? {}, remaining? {}".format(full, connected))

@socketio.event
def turn(json):
    emit("turn", json, broadcast=True, include_self=False)
    
@socketio.event
def result(json):
    emit("result", json, broadcast=True, include_self=False)

@socketio.event
def init(data):
    emit("init", data, broadcast=True, include_self=False)

@socketio.event
def win(data):
    emit("win", data, broadcast=True, include_self=False)

@socketio.event
def ready(json):
    emit("ready", json, broadcast=True, include_self=False)

@socketio.event
def disconnect():
    global full
    full = not full
    global connected
    connected -= 1
    print("left, full? {}, remaining? {}".format(full, connected))


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0")