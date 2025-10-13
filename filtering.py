import json
import pandas as pd
from pandas import json_normalize
import filtering_functions

# Read the JSON file
with open('data/restaurants.json', 'r') as f:
    data = json.load(f)

# Create a DataFrame with expanded location fields
df = json_normalize(data, record_path='locations',meta=['name', 'cuisine'],)

df

# have some way to get requests from frontend and return dataframes using filtering_functions methods