import os
from dotenv import load_dotenv
from flask import Flask, render_template, request
import json
import random

load_dotenv()

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/search")
def search():
    return render_template("search.html")


@app.route("/explore", methods=["GET", "POST"])
def explore():
    if request.method == "GET":
        cuisines = set();
        with open("static/data/restaurants.json", 'r') as file:
            data = json.load(file)
            index = 0
            while True:
                try:
                    cuisine = data[index]["cuisine"]
                    cuisines.add(cuisine)
                    index += 1
                except:
                    break
        return render_template("explore.html", cuisines=cuisines)
    if request.method == "POST":
        return render_template("explore.html", cuisines=cuisines)
        
    


@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/surprise")
def surprise():
    with open("static/data/restaurants.json", 'r') as file:
        data = json.load(file)
        index = random.randrange(len(data))
        restaurant_dict = data[index]
    return render_template("surprise.html", data=restaurant_dict)


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug)
