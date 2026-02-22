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
    # Mapping for clinical explanations
    DESCRIPTIONS = {
        'Atelectasis': "Increased density and partial volume loss in lung segments.",
        'Cardiomegaly': "Transverse cardiac diameter appears greater than 50% of the thoracic diameter.",
        'Effusion': "Blunting of the costophrenic angle suggesting fluid accumulation.",
        'Infiltration': "Ill-defined opacities or interstitial markings suggestive of parenchymal filling.",
        'Mass': "Focal density greater than 3cm in diameter requiring further assessment.",
        'Nodule': "Small circumscribed opacity less than 3cm in diameter.",
        'Pneumonia': "Airspace consolidation pattern often associated with infectious processes.",
        'Pneumothorax': "Visceral pleural line visible without peripheral lung markings.",
        'Consolidation': "Airspaces filled with fluid, pus, or blood displacing air.",
        'Edema': "Diffuse perihilar opacities or Kerley B lines suggesting vascular congestion.",
        'Emphysema': "Hyperinflation of lung fields with flattened diaphragms.",
        'Fibrosis': "Reticular opacities and volume loss suggestive of scarring.",
        'Pleural_Thickening': "Irregularity or thickening of the pleural surface.",
        'Hernia': "Anomalous presence of abdominal contents within the thoracic cavity."
    }

    # Filter findings with confidence >= 60%
    significant_findings = [p for p in predictions if p[1] >= 60.0]

    if not significant_findings:
        return """
### Clinical Impression (AI-Assisted)
No significant radiographic abnormalities were detected above the system threshold (60.00% confidence). The lung fields appear clear and the cardiac silhouette is within normal limits.

### Technical Notes
Single frontal view limitation. Findings must be correlated with clinical symptoms. Overlapping soft tissue shadows can mimic pathology.

### Safety Disclaimer
This AI-generated analysis is for clinical assistance only and is not a diagnosis. Final interpretation must be performed by a licensed radiologist.
"""

    primary = significant_findings[0]
    secondary = significant_findings[1:]

    # Build Clinical Impression summary
    primary_label = primary[0]
    impression_text = f"Radiographic patterns suggestive of {primary_label.lower()} are observed as the dominant feature."
    if secondary:
        impression_text += f" Cannot exclude concurrent {secondary[0][0].lower()}."
    impression_text += " Careful clinical correlation is recommended."

    # Format Primary Suspicion
    primary_section = f"""
### Primary Suspicion
• **{primary[0]}** – {primary[1]/100:.2f} confidence
{DESCRIPTIONS.get(primary[0], "Radiographic features noted.")}
"""

    # Format Secondary Considerations
    secondary_section = ""
    if secondary:
        secondary_section = "### Secondary Considerations\n"
        for label, score in secondary:
            explanation = DESCRIPTIONS.get(label, "May be considered based on minor radiographic indices.")
            secondary_section += f"• **{label}** – {score/100:.2f} confidence\n{explanation}\n\n"

    return f"""
### Clinical Impression (AI-Assisted)
{impression_text}

{primary_section}
{secondary_section}
### Technical Notes
- Single frontal view limitation (depth and fluid layering assessment restricted).
- Clinical correlation with patient symptoms (fever, cough, history) is highly recommended.
- Suggest follow-up imaging or CT correlation for definitive characterization if findings persist.

### Safety Disclaimer
This AI-generated analysis is for clinical assistance only and is not a diagnosis. Final interpretation must be performed by a licensed radiologist.
"""

if __name__ == '__main__':
    print("Medical Imaging AI Service running on port 5003...")
    app.run(port=5003, debug=True)
