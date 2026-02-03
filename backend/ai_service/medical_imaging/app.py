from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# SYSTEM PROMPT (For reference when integrating real VLM)
SYSTEM_PROMPT = """
You are a medical imaging analysis assistant designed to support licensed doctors.
Analyze the uploaded X-ray image and provide a clinical decision-support report.
Follow these strict rules:
1. Do NOT provide a final diagnosis.
2. Do NOT address the patient directly.
3. The output is intended ONLY for a medical professional.
4. Highlight possible abnormalities, patterns, or anomalies visible in the X-ray.
5. If findings are uncertain, clearly state uncertainty.
6. Provide confidence percentages only as reference, not conclusions.
7. Recommend further tests or specialist review if applicable.
8. Use clear, structured medical language.

Output format:
- Observations
- Possible Findings (AI-assisted)
- Confidence Score (per finding)
- Limitations of Analysis
- Suggested Next Steps

Add a disclaimer:
"This AI-generated analysis is for clinical assistance only and must be reviewed by a licensed doctor before any medical decision."
"""

# MOCK DATASETS for Demo
MOCK_ANALYSES = [
    {
        "observations": "The cardiac silhouette is normal in size. The mediastinal contours are unremarkable. There is increased opacity in the right lower lobe.",
        "findings": ["Potential Right Lower Lobe Pneumonia", "Opacity in right lung base"],
        "confidence": "85%",
        "limitations": "Image quality is slightly grainy. Lateral view not provided.",
        "next_steps": "Clinical correlation with symptoms (fever, cough). Recommend follow-up Chest X-ray or CT if symptoms persist."
    },
    {
        "observations": "Clear lung fields bilaterally. No pleural effusion or pneumothorax. Cardiac silhouette size is within normal limits. Osseous structures are intact.",
        "findings": ["No significant acute radiographic abnormalities"],
        "confidence": "98%",
        "limitations": "None.",
        "next_steps": "Routine follow-up as clinically indicated."
    },
    {
        "observations": "There is a linear lucency seen in the mid-shaft of the left clavicle with slight displacement.",
        "findings": ["Mid-shaft clavicle fracture"],
        "confidence": "92%",
        "limitations": "Soft tissue swelling complicates underlying visibility.",
        "next_steps": "Orthopedic consultation. Sling immobilization."
    }
]

@app.route('/analyze_xray', methods=['POST'])
def analyze_xray():
    if 'file' not in request.files:
        return jsonify({"status": "error", "msg": "No file uploaded"}), 400
    
    file = request.files['file']
    filename = file.filename
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    # SIMULATION DELAY (To mimic AI processing)
    time.sleep(3)

    # In a real scenario, we would send 'save_path' and 'SYSTEM_PROMPT' to OpenAI/Gemini API here.
    # For now, we return a mock response based on random selection or simulation.
    
    scenario = random.choice(MOCK_ANALYSES)

    response_text = f"""
### Observations
{scenario['observations']}

### Possible Findings (AI-assisted)
{', '.join([f"- {f}" for f in scenario['findings']])}

### Confidence Score
{scenario['confidence']}

### Limitations of Analysis
{scenario['limitations']}

### Suggested Next Steps
{scenario['next_steps']}

---
**Disclaimer**
This AI-generated analysis is for clinical assistance only and must be reviewed by a licensed doctor before any medical decision.
"""

    return jsonify({
        "status": "success",
        "analysis": response_text,
        "structured": scenario
    })

if __name__ == '__main__':
    print("Medical Imaging AI Service running on port 5003...")
    app.run(port=5003, debug=True)
