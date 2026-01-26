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

⸻

4️⃣ Fish Species Classification (Image Upload)

POST /predict/fish_species

Description: Upload an image to classify the fish species using EfficientNet-B0.

Classes: Sea Bass, Red Mullet, Horse Mackerel, Shrimp, etc. (9 classes)

Request:
- Method: POST
- Content-Type: multipart/form-data
- Body: Image file (JPG, PNG, WebP)

Response:
```json
{
  "species": "Sea Bass",
  "confidence": 95.67,
  "top_predictions": {
    "Sea Bass": 95.67,
    "Gilt Head Bream": 3.21,
    "Red Sea Bream": 1.12
  }
}
```

Usage (cURL):
```bash
curl -X POST "http://localhost:8000/predict/fish_species" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@fish_image.jpg"
```
