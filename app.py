import os
from dotenv import load_dotenv
from flask import Flask, render_template

load_dotenv()

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/search")
def search():
    return render_template("search.html")


@app.route("/explore")
def explore():
    return render_template("explore.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/surprise")
def surprise():
    return render_template("surprise.html")


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug)
