import pandas as pd
from prophet import Prophet

def forecast_sst_from_csv(df: pd.DataFrame, periods: int = 30):
    """
    Input CSV columns:
    date,value
    """

    # Rename for Prophet
    prophet_df = df.rename(columns={
        "date": "ds",
        "value": "y"
    })

    # Convert date & clean
    prophet_df["ds"] = pd.to_datetime(prophet_df["ds"])
    prophet_df = prophet_df.sort_values("ds")

    # 🔥 IMPORTANT FIX
    prophet_df = prophet_df.drop_duplicates(subset="ds")

    # Train Prophet
    model = Prophet()
    model.fit(prophet_df)

    # Future forecast
    future = model.make_future_dataframe(periods=periods, freq="ME")
    forecast = model.predict(future)

    # Return clean output
    result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]

    return {
        "forecast": result.to_dict(orient="records")
    }