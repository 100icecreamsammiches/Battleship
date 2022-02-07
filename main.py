from flask import Flask, render_template, url_for
from flask_socketio import SocketIO, emit
import json

async_mode = None

full = True

app = Flask(__name__)
socketio = SocketIO(app, async_mode=async_mode)

@app.route("/")
def main():
    return render_template("index.html", sync_mode=socketio.async_mode)

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0")