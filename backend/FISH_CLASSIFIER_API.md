# Fish Species Classifier API

## Overview

This API endpoint classifies fish species from uploaded images using a PyTorch deep learning model.

## Model Details

- **Architecture**: EfficientNet-B0
- **Classes**: 9 fish species
  - Black Sea Sprat
  - Gilt Head Bream
  - Horse Mackerel
  - Red Mullet
  - Red Sea Bream
  - Sea Bass
  - Shrimp
  - Striped Red Mullet
  - Trout

## API Endpoint

### POST `/predict/fish_species`

**Description**: Upload an image to classify the fish species

**Request**:

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Image file (JPG, PNG, WebP, etc.)

**Response**:

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

## Usage Examples

### Python (requests)

```python
import requests

url = "http://localhost:8000/predict/fish_species"
files = {"file": open("fish_image.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

### cURL

```bash
curl -X POST "http://localhost:8000/predict/fish_species" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@fish_image.jpg"
```

### JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

fetch("http://localhost:8000/predict/fish_species", {
  method: "POST",
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

## Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Ensure you have the model files:
   - `fish_classifier.pth` (model weights)
   - `labels.json` (class labels)

3. Start the server:

```bash
uvicorn main:app --reload
```

4. Test the endpoint:

```bash
python test_fish_classifier.py
```

## Performance

- Model loads once at startup (not on every request)
- Typical inference time: ~100-300ms per image
- Supports batch processing through multiple API calls

## Notes

- The model expects RGB images
- Images are automatically resized to 224x224 pixels
- Confidence scores are returned as percentages (0-100)
