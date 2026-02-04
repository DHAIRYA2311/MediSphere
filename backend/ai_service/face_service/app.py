import os
import cv2
import numpy as np
import mysql.connector
import json
import datetime
import threading
import time
import logging
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from deepface import DeepFace

# Try to use MediaPipe only if it works, otherwise fallback cleanly
try:
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh
    mp_drawing = mp.solutions.drawing_utils
    HAS_MEDIAPIPE = True
except Exception:
    HAS_MEDIAPIPE = False

# Silencing Logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
logging.getLogger('werkzeug').setLevel(logging.ERROR)

app = Flask(__name__)
CORS(app)

class BiometricCore(threading.Thread):
    def __init__(self):
        super().__init__()
        self.daemon = True
        self.running = True
        self.frame = None
        self.processed_preview = None
        self.lock = threading.Lock()
        
        # Camera Discovery
        self.cap = None
        # Try a few indices
        for i in [0, 1, 700]: # 0 is typical, 700 is a hack for some OBS/Virtual cams
            print(f"[SEARCH] Trying Camera Index {i}...")
            cap = cv2.VideoCapture(i)
            # Set small resolution for better stability & speed
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
            success, test_frame = cap.read()
            if success and test_frame is not None:
                self.cap = cap
                print(f"[SUCCESS] High-Speed Camera Link established at index {i}")
                break
            cap.release()

        if not self.cap:
            print("[CRITICAL] NO CAMERA HARDWARE ACCESSIBLE.")

        # MediaPipe Init
        self.face_mesh = None
        if HAS_MEDIAPIPE:
            try:
                self.face_mesh = mp_face_mesh.FaceMesh(
                    max_num_faces=1,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
            except:
                self.face_mesh = None

    def run(self):
        while self.running:
            if not self.cap:
                time.sleep(1)
                continue
                
            success, raw_frame = self.cap.read()
            if not success or raw_frame is None:
                continue
            
            # Store raw for AI
            with self.lock:
                self.frame = raw_frame.copy()
            
            # Create Preview (Fast)
            preview = cv2.flip(raw_frame, 1)
            
            # Optional AI Lines (Wrapped in try-catch to prevent freezes)
            if self.face_mesh:
                try:
                    rgb = cv2.cvtColor(preview, cv2.COLOR_BGR2RGB)
                    results = self.face_mesh.process(rgb)
                    if results.multi_face_landmarks:
                        for landmarks in results.multi_face_landmarks:
                            mp_drawing.draw_landmarks(
                                image=preview,
                                landmark_list=landmarks,
                                connections=mp_face_mesh.FACEMESH_TESSELATION,
                                landmark_drawing_spec=None,
                                connection_drawing_spec=mp.solutions.drawing_styles.get_default_face_mesh_tesselation_style()
                            )
                except:
                    pass

            # Encode Preview
            ret, buffer = cv2.imencode('.jpg', preview, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if ret:
                with self.lock:
                    self.processed_preview = buffer.tobytes()
            
            time.sleep(0.01)

    def get_frame(self):
        with self.lock:
            return self.frame.copy() if self.frame is not None else None

    def get_preview(self):
        with self.lock:
            return self.processed_preview

core = BiometricCore()
core.start()

# --- Database ---
def get_db():
    return mysql.connector.connect(host="localhost", user="root", password="", database="medisphere_shms")

# --- Routes ---
@app.route('/video_feed')
def video_feed():
    def generate():
        while True:
            frame = core.get_preview()
            if frame:
                yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            else:
                # Send a blank placeholder if camera is initializing
                time.sleep(0.1)
            time.sleep(0.04)
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    frame = core.get_frame()
    if frame is None: return jsonify({"status":"error", "msg":"Camera not ready"})

    try:
        # Reduced enforcement for registration
        res = DeepFace.represent(frame, model_name='Facenet', enforce_detection=False)
        emb = res[0]['embedding']
        db = get_db(); c = db.cursor()
        c.execute("DELETE FROM ai_faces WHERE name = %s", (name,))
        c.execute("INSERT INTO ai_faces (name, embedding) VALUES (%s, %s)", (name, json.dumps(emb)))
        db.commit(); db.close()
        return jsonify({"status":"success", "msg":f"{name} Registered!"})
    except Exception as e:
        return jsonify({"status":"error", "msg":"Registration failed. Look at camera."})

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    frame = core.get_frame()
    if frame is None: return jsonify({"status":"error", "msg":"Camera not ready"})

    try:
        db = get_db(); c = db.cursor()
        c.execute("SELECT name, embedding FROM ai_faces")
        rows = c.fetchall(); db.close()
        if not rows: return jsonify({"status":"error", "msg":"No faces in system."})

        # Feature Extraction
        res = DeepFace.represent(frame, model_name='Facenet', enforce_detection=False)
        live_emb = res[0]['embedding']

        best_match, best_dist = None, 0.45
        for name, emb_json in rows:
            dist = DeepFace.verify(live_emb, json.loads(emb_json), model_name='Facenet', enforce_detection=False, distance_metric='cosine')['distance']
            if dist < best_dist:
                best_match, best_dist = name, dist

        if best_match:
            db = get_db(); c = db.cursor()
            today = datetime.datetime.now().strftime("%Y-%m-%d")
            c.execute("SELECT id FROM ai_attendance_logs WHERE name = %s AND DATE(time) = %s", (best_match, today))
            if c.fetchone():
                db.close()
                return jsonify({"status":"warning", "msg":f"Duplicate: {best_match}"})
            
            c.execute("INSERT INTO ai_attendance_logs (name, time) VALUES (%s, NOW())", (best_match,))
            db.commit(); db.close()
            return jsonify({"status":"success", "msg":f"Welcome {best_match}!"})
        
        return jsonify({"status":"unknown", "msg":"Unknown person."})
    except Exception as e:
        return jsonify({"status":"error", "msg":"Recognition error. Center your face."})

if __name__ == '__main__':
    print("\n[BOOT] BIOMETRIC CORE v4.2")
    app.run(port=5001, debug=False, threaded=True)
