import random
import math
import numpy as np
import pandas as pd
from geopy import distance

class Coordinate:
    def __init__(self, lat, long):
        self.latitude = lat
        self.longitude = long

def random_restaurant(df: pd.DataFrame) -> pd.DataFrame:
    index = random.randint(1, len(df))
    return df.iloc[index]

def filter_cuisine(cuisine: str, df: pd.DataFrame) -> pd.DataFrame:
    return df[df["cuisine"] == cuisine]

def filter_range(current_location: Coordinate, miles: float, df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df = df.dropna(subset=["coordinate.lat", "coordinate.lng"])
    df["distance"] = df.apply(
        lambda row: distance.distance(
            (current_location.latitude, current_location.longitude),
            (row["coordinate.lat"], row["coordinate.lng"])
        ).miles,
        axis=1
    )
    return df[df["distance"] <= miles].sort_values(by="distance")