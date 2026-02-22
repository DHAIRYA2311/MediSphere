import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import requests

# CONSTANTS
MODEL_PATH = 'densenet121_chestxray.pth'
LABELS = [
    'Atelectasis', 'Cardiomegaly', 'Effusion', 'Infiltration', 'Mass', 'Nodule', 
    'Pneumonia', 'Pneumothorax', 'Consolidation', 'Edema', 'Emphysema', 'Fibrosis', 
    'Pleural_Thickening', 'Hernia'
]

# 1. Download Pre-trained Weights (Mock URL for demo, usually hosted on S3/Drive)
# Since we don't have a real URL for a 500MB+ file, we will initialize a DenseNet
# and if weights exist load them, otherwise we warn user.
# For this implementation, we will use torchvision's pretrained DenseNet on ImageNet
# and modify the classifier layer to match ChestX-ray classes (14).
# In a REAL production app, you would load `densenet121-chestxray.pth`.

def load_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load DenseNet121
    model = models.densenet121(pretrained=True)
    
    # Modify Classifier for 14 Classes
    num_ftrs = model.classifier.in_features
    model.classifier = nn.Sequential(
        nn.Linear(num_ftrs, 14),
        nn.Sigmoid()
    )
    
    # Load Fine-tuned Weights if available
    if os.path.exists(MODEL_PATH):
        print(f"Loading custom weights from {MODEL_PATH}...")
        try:
            model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        except Exception as e:
            print(f"Error loading weights: {e}")
            print("Using ImageNet weights (Not optimal for X-Rays but functional for demo pipeline)")
    else:
        print("Custom ChestX-ray weights not found. Using Standard DenseNet121 (ImageNet).")
        print("Note: Predictions will be inaccurate without specific fine-tuning.")

    model = model.to(device)
    model.eval()
    return model, device

# 2. Preprocessing Pipeline
def get_transform():
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

# 3. Prediction Function
def predict_image(model, device, image_path):
    image = Image.open(image_path).convert('RGB')
    transform = get_transform()
    image = transform(image).unsqueeze(0) # Add batch dimension
    image = image.to(device)

    with torch.no_grad():
        outputs = model(image)
        # Outputs are probabilities because of Sigmoid
        probs = outputs[0].cpu().numpy()
    
    # Format Results
    results = []
    for i, label in enumerate(LABELS):
        score = float(probs[i] * 100)
        if score >= 0.0: # Filter at the app layer (app.py) for the final report
            results.append((label, score))
    
    results.sort(key=lambda x: x[1], reverse=True)
    return results
