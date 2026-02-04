from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load Model
MODEL_PATH = 'disease_model.pkl'

if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, 'rb') as f:
        model_data = pickle.load(f)
        model = model_data['model']
        feature_names = model_data['features']
    print("AI Model Loaded Successfully.")
else:
    print("Model not found! Please run train_model.py first.")
    model = None
    feature_names = []

@app.route('/predict_disease', methods=['POST'])
def predict_disease():
    if not model:
        return jsonify({"status": "error", "msg": "Model not trained. Run train_model.py"}), 500

    data = request.json
    symptoms = data.get('symptoms', []) # List of symptom names e.g. ['Fever', 'Cough']

    # Convert symptoms to model input vector
    input_vector = np.zeros(len(feature_names))
    
    for symptom in symptoms:
        # Match symptom name to feature name (e.g. 'Fever' -> 'Symptom_Fever')
        feature_key = f"Symptom_{symptom}"
        if feature_key in feature_names:
            index = feature_names.index(feature_key)
            input_vector[index] = 1
    
    # Predict
    prediction = model.predict([input_vector])[0]
    probabilities = model.predict_proba([input_vector])[0]
    confidence = max(probabilities) * 100

    return jsonify({
        "status": "success",
        "disease": prediction,
        "confidence": f"{confidence:.2f}%",
        "features_used": symptoms
    })

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    # Return available symptoms for frontend to show
    clean_symptoms = [f.replace('Symptom_', '') for f in feature_names]
    return jsonify({"status": "success", "symptoms": clean_symptoms})

if __name__ == '__main__':
    print("Disease Prediction Service running on port 5004...")
    app.run(port=5004, debug=True)
