from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
from model import load_model, predict_image

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Load AI Model on Startup
print("Initializing AI Model...")
model, device = load_model()
print("AI Model Ready.")



@app.route('/analyze_xray', methods=['POST'])
def analyze_xray():
    if 'file' not in request.files:
        return jsonify({"status": "error", "msg": "No file uploaded"}), 400
    
    file = request.files['file']
    filename = file.filename
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    try:
        # REAL INFERENCE
        predictions = predict_image(model, device, save_path)
        
        # Generate Text Report based on predictions
        report_text = generate_report(predictions)
        
        return jsonify({
            "status": "success",
            "analysis": report_text,
            "raw_predictions": predictions
        })

    except Exception as e:
        print(f"Inference Error: {e}")
        return jsonify({"status": "error", "msg": str(e)}), 500

def generate_report(predictions):
    if not predictions:
        findings_text = "No significant abnormalities detected above threshold."
        obs_text = "Lung fields appear clear. Cardiac silhouette is within normal limits."
    else:
        findings_text = "\n".join([f"- **{label}**: {score:.2f}% confidence" for label, score in predictions])
        
        # Contextual Observations based on top finding
        top_finding = predictions[0][0]
        if top_finding == 'Pneumonia':
            obs_text = "There is suggestive opacity consistent with airspace consolidation."
        elif top_finding == 'Cardiomegaly':
            obs_text = "The cardiac silhouette appears enlarged (CTR > 0.5)."
        elif top_finding == 'Effusion':
            obs_text = "Blunting of the costophrenic angles is noted, suggestive of fluid."
        elif top_finding == 'Infiltration':
            obs_text = "Increased interstitial markings are visible."
        elif top_finding == 'Mass' or top_finding == 'Nodule':
            obs_text = "A focal density is observed requiring further characterization."
        else:
            obs_text = f"Radiographic features suggestive of {top_finding} are noted."

    return f"""
### Observations
{obs_text}
User Quality Check: The exposure and positioning should be verified by the radiologist.

### Possible Findings (AI-assisted)
{findings_text}

### Confidence Score
Detailed probabilities provided above. 
Note: Model operates on a multi-label classification basis.

### Limitations of Analysis
The analysis is based on 2D pattern recognition from a single view. 
Lateral views or CT correlation may be required for confirmation. 
Overlapping soft tissue shadows can mimic pathology.

### Suggested Next Steps
- Clinical correlation with patient symptoms (e.g., fever, cough, chest pain).
- Comparison with prior imaging if available.
- Consider follow-up imaging or CT chest for ambiguous findings.

---
**Disclaimer**
This AI-generated analysis is for clinical assistance only and must be reviewed by a licensed doctor before any medical decision.
"""

if __name__ == '__main__':
    print("Medical Imaging AI Service running on port 5003...")
    app.run(port=5003, debug=True)
