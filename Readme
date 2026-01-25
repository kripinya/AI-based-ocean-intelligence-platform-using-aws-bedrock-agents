BY- Team ThinkTank AI


Backend – Ocean Intelligence ML API

This backend provides Machine Learning–powered APIs for ocean sustainability insights, including chlorophyll prediction and sea surface temperature (SST) forecasting.

Built using FastAPI, containerised with Docker, and designed to be consumed by the frontend UI.

⸻

🚀 How to Run (Local)

source .venv/bin/activate
python -m uvicorn backend.main:app

API will be available at:

http://127.0.0.1:8000

Swagger docs:

http://127.0.0.1:8000/docs


⸻

🧠 Available API Endpoints

1️⃣ Predict Chlorophyll (Single Input)

POST /predict

Request

{
  "depth": 10,
  "salinity": 35,
  "ph": 8.1
}

Response

{
  "predicted_chlorophyll": 0.1787
}


⸻

2️⃣ Predict Chlorophyll (CSV Upload)

POST /predict/csv

CSV Format

depth,salinity,ph
10,35,8.1
20,34.8,8.0

Response

{
  "depth": [...],
  "salinity": [...],
  "ph": [...],
  "predicted_chlorophyll": [...]
}

Used for batch prediction and graph plotting in frontend.

⸻

3️⃣ Sea Surface Temperature Forecast

GET /predict/sst

Response

{
  "dates": [...],
  "sst": [...]
}

Returns future SST trend data for visualization.

⸻

🐳 Docker (Optional)

docker build -t ocean-ml-api .
docker run -p 8000:8000 ocean-ml-api


⸻

🧩 Notes
	•	CORS is enabled for frontend integration
	•	No authentication required
	•	Backend focuses only on inference & forecasting
	•	Frontend consumes APIs and handles visualization

⸻

✅ Backend ML, API, and Docker setup are complete and ready for integration.
