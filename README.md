# Marine Insights 🌊
**By Team ThinkTank AI**

Marine Insights is an advanced **Ocean Intelligence System** that combines Machine Learning, Agentic AI, and Retrieval-Augmented Generation (RAG) to analyze ocean conditions, fisheries sustainability, and marine biodiversity.

This backend provides ML-powered APIs and AI-driven reasoning to support sustainable marine ecosystem management.

---

## 🚀 Project Vision

Traditional ML models only predict numbers. **Marine Insights** goes beyond prediction by adding intelligence:

- 📊 **ML** predicts ocean parameters (SST, chlorophyll, fish species, stock trends)
- 🤖 **Agents** interpret results and make decisions
- 📚 **RAG** provides scientific and policy-based explanations
- 🌍 **System** outputs actionable sustainability insights

---

## 🧠 System Architecture
*(Agentic + RAG + ML)*

```text
Frontend (React Dashboard)
        ↓
FastAPI Backend (API Layer)
        ↓
Orchestrator Agent 🤖
        ↓
------------------------------------------
| Ocean Agent | Fisheries Agent | Biodiversity Agent |
------------------------------------------
        ↓
RAG Knowledge Base (ChromaDB + Embeddings)
        ↓
ML Models (SST, Chlorophyll, Fish Classification)
        ↓
Explainable AI Insights
```

---

## 📂 Project Structure

```text
backend/
├── main.py                     # FastAPI entry point
│
├── Agents/                     # Agentic AI Layer
│   ├── orchestrator.py         # Routes requests to specialized agents
│   ├── fisheries_agent.py      # Species analysis & biology RAG
│   └── overfishing_agent.py    # Sustainability analysis & policy RAG
│
├── services/                   # Core ML Logic & Services
│   ├── fish_classifier.py      # Species classification logic
│   ├── predict.py              # Chlorophyll prediction
│   ├── sst_predict.py          # SST forecasting
│   └── overfishing_analyze.py  # Stock vs Catch analysis
│
├── rag/                        # RAG System
│   ├── rag_engine.py           # Main RAG interface
│   ├── database/               # Vector Stores (ChromaDB)
│   │   ├── fisheries/
│   │   └── overfishing/
│   ├── scripts/                # Database Build Scripts
│   │   ├── build_rag_db.py
│   │   └── build_overfishing_db.py
│   └── src/                    # RAG Core Components
│       ├── data_loader.py
│       ├── embedding.py
│       └── vectorstore.py
│
├── models/                     # Trained Model Artifacts
│   ├── fish_classifier.pth
│   ├── chlorophyll_rf_model.pkl
│   └── labels.json
│
├── requirements.txt
└── README.md
```

---

## 🤖 Agentic AI Workflows

### 1️⃣ Ocean Intelligence Agent 🌊
Analyzes SST, salinity, pH, chlorophyll, and depth profiles.
- **Capabilities**:
  - Detect ocean stress and anomalies
  - Explain climate impact using RAG knowledge
  - Generate insights for marine health

### 2️⃣ Fisheries Agent 🐟
Analyzes fish stock vs catch data and overfishing patterns.
- **Capabilities**:
  - Detect overfishing risk
  - Interpret ML forecasting results
  - Recommend sustainable fishing strategies using RAG

## 📚 RAG (Retrieval-Augmented Generation)

Marine Insights uses a partitioned knowledge base built on **ChromaDB**.

**Knowledge Domains:**
- Oceanography & Climate Science
- Fisheries & Sustainability Policies
- Marine Biodiversity & Ecology
- Environmental Regulations

**RAG Pipeline:**
> Query → Embeddings → Vector Search → Relevant Knowledge → Agent Reasoning → Final Insight

---

## ⚙️ How to Run (Local)

### 1️⃣ Activate Virtual Environment
```bash
source .venv/bin/activate
# or windows
.\.venv\Scripts\activate
```

### 2️⃣ Run Backend Server
```bash
uvicorn main:app --reload
```

### 3️⃣ Access API
- **Base URL**: `http://127.0.0.1:8000`
- **Swagger Docs**: `http://127.0.0.1:8000/docs`

---

## 🧠 Available API Endpoints

### 1️⃣ Predict Chlorophyll (Single Input)
**POST** `/predict`

**Request:**
```json
{
  "depth": 10,
  "salinity": 35,
  "ph": 8.1
}
```

**Response:**
```json
{
  "predicted_chlorophyll": 0.1787
}
```

---

### 2️⃣ Predict Chlorophyll (CSV Upload)
**POST** `/predict/csv`

**CSV Format:**
```csv
depth,salinity,ph
10,35,8.1
20,34.8,8.0
```

**Response:**
```json
{
  "depth": [...],
  "salinity": [...],
  "ph": [...],
  "predicted_chlorophyll": [...]
}
```
*Used for batch prediction and graph plotting in frontend.*

---

### 3️⃣ Sea Surface Temperature Forecast
**GET** `/predict/sst`

**Response:**
```json
{
  "dates": [...],
  "sst": [...]
}
```
*Returns future SST trend data for visualization.*

---

### 4️⃣ Fish Species Classification (Image Upload)
**POST** `/predict/fish_species`

**Description:** Upload an image to classify the fish species using EfficientNet-B0.
**Classes:** Sea Bass, Red Mullet, Horse Mackerel, Shrimp, etc. (9 classes)

**Request:**
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Body**: Image file (JPG, PNG, WebP)

**Response:**
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

**Usage (cURL):**
```bash
curl -X POST "http://localhost:8000/predict/fish_species" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@fish_image.jpg"
```

---

## 🐳 Docker (Optional)

```bash
docker build -t ocean-ml-api .
docker run -p 8000:8000 ocean-ml-api
```

---

## 🧩 Notes
- ✅ **CORS** is enabled for frontend integration
- ✅ **No authentication** required (Internal API)
- ✅ **Focus**: Backend handles inference & forecasting; Frontend handles visualization.
