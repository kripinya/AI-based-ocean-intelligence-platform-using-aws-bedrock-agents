import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "chlorophyll_rf_model.pkl")

model = joblib.load(MODEL_PATH)

def predict_chlorophyll(depth: float, salinity: float, ph: float) -> float:
    X = np.array([[depth, salinity, ph]])
    prediction = model.predict(X)[0]
    return float(prediction)