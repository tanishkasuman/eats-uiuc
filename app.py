from flask import Flask, session, render_template, url_for, request, redirect
import filtering_functions
import json
import pandas as pd
from pandas import json_normalize



app = Flask(__name__)
app.secret_key = "eats@uiuc"

@app.route("", methods=["GET", "POST"])
@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        cuisine = request.form["cuisine"]
        session["cuisine"] = cuisine
        return redirect(url_for("cuisine"))
    else:
        return render_template("home.html")

# filtering by cuisine
@app.route("/cuisine", methods=["GET"])
def cuisine():
    # Read the JSON file
    if "cuisine" in session:
        cuisine = session["cuisine"]
        with open('data/restaurants.json', 'r') as f:
            data = json.load(f)
        # Create a DataFrame with expanded location fields
        df = json_normalize(data, record_path='locations',meta=['name', 'cuisine'],)
        # Filter dataframe by cuisine
        filtered_df = filtering_functions.filter_cuisine(cuisine, df)

        # Convert to a JSON-serializable list of dicts (one dict per row)
        display_list = filtered_df.to_dict(orient="records")

        return render_template("cuisine.html", display=display_list)
    else:
        return redirect(url_for("home"))



if __name__ == "__main__":
    app.run(debug=True, port=7000)