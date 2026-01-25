import pandas as pd
from pathlib import Path

SST_CSV_PATH = Path(__file__).parent / "sst_30step_forecast.csv"

def get_sst_forecast():
    df = pd.read_csv(SST_CSV_PATH)

    return {
        "dates": df["ds"].astype(str).tolist(),
        "sst": df["yhat"].tolist()
    }