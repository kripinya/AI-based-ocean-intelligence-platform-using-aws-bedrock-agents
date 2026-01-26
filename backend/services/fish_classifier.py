import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import json
import os
import timm

# Global variables for model and labels (loaded once at startup)
model = None
labels = None
device = None

def load_model_and_labels():
    """
    Load the fish classifier model and labels once at application startup.
    This prevents reloading on every prediction request.
    """
    global model, labels, device
    
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load labels
    labels_path = os.path.join(os.path.dirname(__file__), '../models/labels.json')
    with open(labels_path, 'r') as f:
        labels = json.load(f)
    
    # Load model
    model_path = os.path.join(os.path.dirname(__file__), '../models/fish_classifier.pth')
    
    # Create model architecture (using EfficientNet-B0 as base)
    # Adjust this if your model uses a different architecture
    num_classes = len(labels)
    model = timm.create_model('efficientnet_b0', pretrained=False, num_classes=num_classes)
    
    # Load trained weights
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()
    
    print(f"✅ Fish classifier model loaded successfully on {device}")
    print(f"✅ Loaded {num_classes} fish species labels")
    
    return model, labels, device


def get_image_transforms():
    """
    Define image preprocessing transforms.
    These should match the transforms used during training.
    """
    return transforms.Compose([
        transforms.Resize((224, 224)),  # Resize to model input size
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],  # ImageNet normalization
            std=[0.229, 0.224, 0.225]
        )
    ])


def predict_fish_species(image: Image.Image):
    """
    Predict fish species from a PIL Image.
    
    Args:
        image: PIL Image object
        
    Returns:
        dict: {
            "species": str,
            "confidence": float (0-100),
            "all_predictions": dict (optional, top 3 predictions)
        }
    """
    global model, labels, device
    
    # Ensure model is loaded
    if model is None or labels is None:
        load_model_and_labels()
    
    # Preprocess image
    transform = get_image_transforms()
    
    # Convert to RGB if needed (handles RGBA, grayscale, etc.)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Apply transforms
    image_tensor = transform(image).unsqueeze(0)  # Add batch dimension
    image_tensor = image_tensor.to(device)
    
    # Make prediction
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted_class = torch.max(probabilities, 1)
        
        # Get top 3 predictions
        top3_prob, top3_classes = torch.topk(probabilities, 3, dim=1)
    
    # Convert to Python types
    predicted_idx = str(predicted_class.item())
    confidence_score = confidence.item() * 100  # Convert to percentage
    
    # Get species name
    species_name = labels.get(predicted_idx, "Unknown")
    
    # Get top 3 predictions
    top3_predictions = {}
    for i in range(3):
        class_idx = str(top3_classes[0][i].item())
        prob = top3_prob[0][i].item() * 100
        species = labels.get(class_idx, "Unknown")
        top3_predictions[species] = round(prob, 2)
    
    return {
        "species": species_name,
        "confidence": round(confidence_score, 2),
        "top_predictions": top3_predictions
    }


def predict_from_file_path(image_path: str):
    """
    Predict fish species from an image file path.
    
    Args:
        image_path: Path to image file
        
    Returns:
        dict: Prediction results
    """
    image = Image.open(image_path)
    return predict_fish_species(image)
