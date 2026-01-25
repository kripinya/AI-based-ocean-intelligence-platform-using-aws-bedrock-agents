import pandas as pd
import os

def analyze_overfishing_from_csv(csv_path: str = None, df: pd.DataFrame = None):
    """
    Analyze overfishing from CSV data.
    Either provide csv_path OR df, not both.

    CSV must contain columns: Date, Stock_Volume, Catch_Volume
    Returns Plotly chart data for overfishing monitoring.
    """
    # Load data from CSV or use provided DataFrame
    if csv_path and df is None:
        df = pd.read_csv(csv_path)
    elif csv_path is None and df is None:
        raise ValueError("Either csv_path or df must be provided")

    # Standardize column names
    df.columns = df.columns.str.lower().str.strip()

    required_cols = {"date", "stock_volume", "catch_volume"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"CSV must contain columns: {required_cols}. Found: {list(df.columns)}")

    # Extract data
    dates = df["date"].tolist()
    stock_volumes = df["stock_volume"].tolist()
    catch_volumes = df["catch_volume"].tolist()

    # Calculate overfishing threshold (20% of stock)
    thresholds = [stock * 0.2 for stock in stock_volumes]

    # Determine overfishing periods (catch > 20% of stock)
    overfishing_indices = [
        i for i, (catch, threshold) in enumerate(zip(catch_volumes, thresholds))
        if catch > threshold
    ]

    # Create shapes for overfishing alerts
    shapes = []
    for i in overfishing_indices:
        if i < len(dates):  # Safety check
            shapes.append({
                "type": "rect",
                "xref": "x",
                "yref": "paper",
                "x0": dates[i],
                "y0": 0,
                "x1": dates[i],
                "y1": 1,
                "fillcolor": "rgba(255, 107, 107, 0.2)",
                "opacity": 0.3,
                "line": {"width": 0}
            })

    # Create shapes for overfishing alerts
    shapes = []
    for i in overfishing_indices:
        if i < len(dates):  # Safety check
            shapes.append({
                "type": "rect",
                "xref": "x",
                "yref": "paper",
                "x0": dates[i],
                "y0": 0,
                "x1": dates[i],
                "y1": 1,
                "fillcolor": "rgba(255, 107, 107, 0.2)",
                "opacity": 0.3,
                "line": {"width": 0}
            })

    return {
        "data": [
            {
                "x": dates,
                "y": stock_volumes,
                "type": "scatter",
                "mode": "lines",
                "name": "Stock Volume",
                "line": {"color": "#2ECC71", "width": 3}
            },
            {
                "x": dates,
                "y": catch_volumes,
                "type": "scatter",
                "mode": "lines",
                "name": "Catch Volume",
                "line": {"color": "#FF6B6B", "width": 3}
            },
            {
                "x": dates,
                "y": thresholds,
                "type": "scatter",
                "mode": "lines",
                "name": "Overfishing Threshold (20%)",
                "line": {"color": "#F1C40F", "width": 2, "dash": "dash"}
            }
        ],
        "layout": {
            "title": {"text": "Overfishing Monitoring - Stock vs Catch Analysis", "font": {"color": "white", "size": 18}},
            "xaxis": {
                "title": "Date",
                "color": "white",
                "gridcolor": "rgba(255,255,255,0.15)",
                "tickangle": -45
            },
            "yaxis": {
                "title": "Volume",
                "color": "white",
                "gridcolor": "rgba(255,255,255,0.15)"
            },
            "plot_bgcolor": "rgba(0,0,0,0)",
            "paper_bgcolor": "rgba(0,0,0,0)",
            "font": {"color": "white"},
            "legend": {"bgcolor": "rgba(255,255,255,0.1)", "bordercolor": "rgba(255,255,255,0.2)"},
            "shapes": shapes
        }
    }


def get_sample_overfishing_data():
    """
    Returns sample overfishing data for testing.
    Uses hardcoded data as fallback.
    """
    # Try to load from CSV first
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'sample_overfishing.csv')
        return analyze_overfishing_from_csv(csv_path=csv_path)
    except Exception as e:
        print(f"CSV load error: {e}, using fallback data")

        # Fallback hardcoded data
        dates = [
            '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06',
            '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
            '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
            '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
        ]
        stock_volumes = [20946, 20972, 20974, 21032, 21313, 21177, 21295, 21184, 21187, 21346, 21402, 21344, 21323, 21441, 21418, 21489, 21544, 21529, 21793, 21907, 21754, 21823, 21807, 21942]
        catch_volumes = [3832, 3244, 2333, 5740, 5596, 6351, 6374, 4471, 5377, 6168, 5777, 3190, 4053, 2698, 6228, 4754, 3139, 5045, 4873, 3759, 2669, 5113, 4449, 5583]

        # Create DataFrame and analyze
        df = pd.DataFrame({
            'date': dates,
            'stock_volume': stock_volumes,
            'catch_volume': catch_volumes
        })

        return analyze_overfishing_from_csv(df=df)