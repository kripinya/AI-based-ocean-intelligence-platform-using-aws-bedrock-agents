# Use a stable Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy backend code
COPY backend/ backend/

# Install system dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    scikit-learn==1.6.1 \
    numpy \
    pandas \
    joblib \
    python-multipart

# Expose API port
EXPOSE 8000

# Run the FastAPI app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]