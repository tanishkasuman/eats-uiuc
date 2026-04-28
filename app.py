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
            for restaurant in data:
                cuisine = restaurant["cuisine"]
                cuisines.add(cuisine)
        return render_template("explore_get.html", cuisines=cuisines)
    if request.method == "POST":
        cuisine = request.form.get("cuisines")
        with open("static/data/restaurants.json", 'r') as file:
            data = json.load(file)
            restaurants = list()
            for restaurant in data:
                if (restaurant["cuisine"] == cuisine):
                    restaurants.append(restaurant)
            # Assuming your list is named 'restaurants'
            sorted_restaurants = sorted(
                restaurants, 
                key=lambda x: x['locations'][0]['rating'], 
                reverse=True
            )
        return render_template("explore_post.html", restaurants=sorted_restaurants)
        
    


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
