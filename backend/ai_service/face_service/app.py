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
    user_id = data.get('user_id')
    frame = core.get_frame()
    if frame is None: return jsonify({"status":"error", "msg":"Camera not ready"})

    try:
        # Feature Extraction
        res = DeepFace.represent(frame, model_name='Facenet', enforce_detection=False)
        emb = res[0]['embedding']
        db = get_db(); c = db.cursor()
        
        # Remove existing registration for this user
        c.execute("DELETE FROM ai_faces WHERE user_id = %s", (user_id,))
        
        # Insert new registration
        now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        c.execute("INSERT INTO ai_faces (user_id, embedding, created_at) VALUES (%s, %s, %s)", 
                  (user_id, json.dumps(emb), now))
        
        db.commit(); db.close()
        return jsonify({"status":"success", "msg":f"User ID {user_id} Face Registered!"})
    except Exception as e:
        print(f"[ERROR] Registration: {str(e)}")
        return jsonify({"status":"error", "msg":"Registration failed. Center your face."})

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    frame = core.get_frame()
    if frame is None: return jsonify({"status":"error", "msg":"Camera not ready"})

    try:
        db = get_db(); c = db.cursor(dictionary=True)
        # Join with Users to get the names directly
        c.execute("""
            SELECT f.user_id, f.embedding, u.first_name, u.last_name 
            FROM ai_faces f
            JOIN Users u ON f.user_id = u.user_id
        """)
        rows = c.fetchall(); db.close()
        if not rows: return jsonify({"status":"error", "msg":"No faces registered in system."})

        # Extraction from Live Frame
        res = DeepFace.represent(frame, model_name='Facenet', enforce_detection=False)
        live_emb = res[0]['embedding']

        best_match = None
        best_dist = 0.40 # Stricter threshold for production

        for row in rows:
            dist = DeepFace.verify(live_emb, json.loads(row['embedding']), 
                                  model_name='Facenet', enforce_detection=False, 
                                  distance_metric='cosine')['distance']
            if dist < best_dist:
                best_match = row
                best_dist = dist

        if best_match:
            user_id = best_match['user_id']
            full_name = f"{best_match['first_name']} {best_match['last_name']}"
            
            db = get_db(); c = db.cursor(dictionary=True)
            now = datetime.datetime.now()
            today = now.strftime("%Y-%m-%d")
            current_time = now.strftime("%H:%M:%S")

            # Resolve Staff ID if exists
            c.execute("SELECT staff_id FROM staff WHERE user_id = %s LIMIT 1", (user_id,))
            staff_res = c.fetchone()
            staff_id = staff_res['staff_id'] if staff_res else None

            # Check Attendance Ledger
            c.execute("SELECT attendance_id, check_in_time, check_out_time FROM attendance WHERE user_id = %s AND date = %s", (user_id, today))
            existing = c.fetchone()

            if not existing:
                c.execute("""
                    INSERT INTO attendance (user_id, staff_id, date, check_in_time, check_out_time, method) 
                    VALUES (%s, %s, %s, %s, '00:00:00', 'Biometric')
                """, (user_id, staff_id, today, current_time))
                db.commit(); db.close()
                return jsonify({"status":"success", "msg":f"Welcome {full_name}! Check-in at {current_time}"})
            
            elif existing['check_out_time'] in [None, '00:00:00', datetime.timedelta(0)]:
                c.execute("UPDATE attendance SET check_out_time = %s WHERE attendance_id = %s", (current_time, existing['attendance_id']))
                db.commit(); db.close()
                return jsonify({"status":"success", "msg":f"Goodbye {full_name}! Check-out at {current_time}"})
            
            else:
                db.close()
                return jsonify({"status":"warning", "msg":f"{full_name} has already logged a full shift today."})
        
        return jsonify({"status":"unknown", "msg":"Face not recognized. Try again."})
    except Exception as e:
        print(f"[ERROR] Recognition: {str(e)}")
        return jsonify({"status":"error", "msg":"Recognition error. Please face the camera."})

if __name__ == '__main__':
    print("\n[BOOT] BIOMETRIC CORE v4.2")
    app.run(port=5001, debug=False, threaded=True)
