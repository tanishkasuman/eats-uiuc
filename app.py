from flask import Flask, session, render_template, url_for
import filtering_functions
import json
import pandas as pd
from pandas import json_normalize



app = Flask(__name__)
app.secret_key = "eats@uiuc"


# filtering by cuisine
@app.route("/cuisine/<cuisine>", methods=["GET"])
def cuisine(cuisine):
    # Read the JSON file
    with open('data/restaurants.json', 'r') as f:
        data = json.load(f)
    # Create a DataFrame with expanded location fields
    df = json_normalize(data, record_path='locations',meta=['name', 'cuisine'],)
    # Filter dataframe by cuisine
    filtered_df = filtering_functions.filter_cuisine(cuisine, df)

    # Convert to a JSON-serializable list of dicts (one dict per row)
    display_list = filtered_df.to_dict(orient="records")

    # Store serializable data in session (optional) and pass to template
    session["display"] = display_list
    return render_template("cuisine.html", display=display_list)



if __name__ == "__main__":
    app.run(debug=True, port=7000)