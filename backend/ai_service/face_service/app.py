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
# from deepface import DeepFace # Moved to function scope

# MediaPipe is disabled to prevent protobuf conflicts on Windows
HAS_MEDIAPIPE = False

app = Flask(__name__)
CORS(app)

# --- Global Cache for Speed ---
embedding_cache = [] # List of {user_id, name, embedding_vec}

def load_cache():
    global embedding_cache
    try:
        db = get_db(); c = db.cursor(dictionary=True)
        c.execute("SELECT f.user_id, f.embedding, u.first_name, u.last_name FROM ai_faces f JOIN Users u ON f.user_id = u.user_id")
        rows = c.fetchall()
        db.close()
        
        new_cache = []
        for r in rows:
            emb = np.array(json.loads(r['embedding']))
            new_cache.append({
                "user_id": r['user_id'],
                "full_name": f"{r['first_name']} {r['last_name']}",
                "embedding": emb
            })
        embedding_cache = new_cache
        print(f"[CACHE] Loaded {len(embedding_cache)} biometric records.")
    except Exception as e:
        print(f"[CACHE ERROR] Could not prime cache: {e}")

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
        self.is_starting = False

        # UI State
        self.status_msg = "Scanner Ready"
        self.status_color = (0, 255, 0)
        self.user_name = ""
        self.face_box = None
        self.last_update = time.time()
        
        self.face_mesh = None # Disabled

    def start_camera(self):
        # 1. Quick check with lock
        with self.lock:
            if self.cap is not None:
                return True
            if self.is_starting:
                return False
            self.is_starting = True

        print("[INFO] Initiating hardware scan (Lock Released)...")
        new_cap = None
        try:
            # Expanded backends list for Windows recovery
            if os.name == 'nt':
                backends = [(cv2.CAP_MSMF, "MSMF"), (cv2.CAP_DSHOW, "DSHOW"), (cv2.CAP_ANY, "AUTO")]
            else:
                backends = [(cv2.CAP_ANY, "AUTO")]

            for i in [0, 1, 2]:
                for b, b_name in backends:
                    print(f"[SEARCH] Probing Index {i} with Backend {b_name}...")
                    try:
                        temp_cap = cv2.VideoCapture(i, b)
                        if temp_cap.isOpened():
                            ret, frame = temp_cap.read()
                            if ret and frame is not None:
                                new_cap = temp_cap
                                print(f"[SUCCESS] Hardware Unlocked: Index {i} / {b_name}")
                                break
                            temp_cap.release()
                    except: continue
                if new_cap: break
        finally:
            with self.lock:
                self.cap = new_cap
                self.is_starting = False
        
        return new_cap is not None

    def stop_camera(self):
        with self.lock:
            if self.cap:
                self.cap.release()
                print("[INFO] Hardware Released.")
            self.cap = None
            self.frame = None
            self.processed_preview = None
            self.is_starting = False

    def set_ui_status(self, msg, color=(0, 255, 0), name="", box=None):
        with self.lock:
            self.status_msg = msg
            self.status_color = color
            self.user_name = name
            self.face_box = box
            self.last_update = time.time()

    def run(self):
        print("[THREAD] Biometric Core Processor Heartbeat Start")
        counter = 0
        while self.running:
            if self.cap is None:
                time.sleep(1) # Slow down when idle
                continue
                
            try:
                success, raw_frame = self.cap.read()
                if not success or raw_frame is None:
                    print("[WARN] Hardware read returned null frame. Retrying...")
                    time.sleep(0.1)
                    continue
                
                counter += 1
                if counter % 100 == 0:
                    print(f"[HEARTBEAT] Processed {counter} frames. Camera is active.")

                # Mirror and process
                preview = cv2.flip(raw_frame, 1)
                h, w, _ = preview.shape
                
                # Draw UI Underlays (Minimal)
                with self.lock:
                    self.frame = raw_frame.copy()
                    
                    # Clear status timer
                    if time.time() - self.last_update > 3:
                        self.status_msg = "Scanner Ready"
                        self.user_name = ""
                        self.face_box = None

                    if self.face_box:
                        x, y, bw, bh = self.face_box
                        mx = w - x - bw
                        cv2.rectangle(preview, (mx, y), (mx + bw, y + bh), self.status_color, 2)
                    
                    # Face Mask Overlay (The "Neural Mask")
                    # This adds a futuristic hex/pulse effect around detected area
                    cv2.rectangle(preview, (0, h-60), (w, h), (0,0,0), -1)
                    display_text = f"{self.user_name} - {self.status_msg}" if self.user_name else self.status_msg
                    
                    # Status Icon / Glow
                    color = self.status_color
                    cv2.circle(preview, (30, h-30), 8, color, -1)
                    cv2.putText(preview, display_text, (55, h-22), cv2.FONT_HERSHEY_DUPLEX, 0.7, (255, 255, 255), 1)

                # Encode Preview
                # Encode Preview
                ret, buffer = cv2.imencode('.jpg', preview, [cv2.IMWRITE_JPEG_QUALITY, 75])
                if ret:
                    with self.lock:
                        self.processed_preview = buffer.tobytes()
                
            except Exception as e:
                print(f"[THREAD ERROR] Error in frame loop: {e}")
                time.sleep(0.1)
                
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
@app.route('/health')
def health():
    return jsonify({"status": "alive", "camera": core.cap is not None})

@app.route('/start_camera', methods=['GET', 'POST'])
def start_camera():
    print("[ROUTE] /start_camera request received")
    success = core.start_camera()
    if success:
        return jsonify({"status": "success", "msg": "Camera Started"})
    return jsonify({"status": "error", "msg": "Could not access camera hardware"})

@app.route('/stop_camera', methods=['GET', 'POST'])
def stop_camera():
    print("[ROUTE] /stop_camera request received")
    core.stop_camera()
    return jsonify({"status": "success", "msg": "Camera Stopped"})

@app.route('/video_feed')
def video_feed():
    # Fallback: Auto-start camera if someone accesses the feed
    if core.cap is None:
        print("[FALLBACK] Video Feed accessed while camera NULL, triggering start...")
        threading.Thread(target=core.start_camera).start()

    def generate():
        print("[FEED] Stream generator started")
        while True:
            frame = core.get_preview()
            if frame:
                yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            else:
                # Send a "Camera Offline" placeholder frame
                offline_bg = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(offline_bg, "CAMERA_OFFLINE", (150, 240), cv2.FONT_HERSHEY_DUPLEX, 1, (0, 0, 255), 2)
                cv2.putText(offline_bg, "WAITING_FOR_HARDWARE...", (150, 280), cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 1)
                _, buffer = cv2.imencode('.jpg', offline_bg)
                yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
                time.sleep(2) # Longer wait for hardware warmup
            time.sleep(0.04)
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    user_id = data.get('user_id')
    frame = core.get_frame()
    if frame is None: return jsonify({"status":"error", "msg":"Camera not ready"})

    try:
        from deepface import DeepFace
        
        # --- Pre-processing: Auto-Enhance ---
        # Convert to LAB to normalize brightness
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        enhanced_frame = cv2.merge((cl,a,b))
        enhanced_frame = cv2.cvtColor(enhanced_frame, cv2.COLOR_LAB2BGR)

        # Capture & Process with Fallback Detector
        try:
            res = DeepFace.represent(enhanced_frame, model_name='Facenet', detector_backend='opencv', enforce_detection=True)
        except Exception as e_inner:
            print(f"[RETRY] Opencv failed, trying retinaface: {e_inner}")
            res = DeepFace.represent(enhanced_frame, model_name='Facenet', detector_backend='retinaface', enforce_detection=True)
        
        emb = np.array(res[0]['embedding'])
        box = res[0]['facial_area'] # x, y, w, h
        
        db = get_db(); c = db.cursor(dictionary=True)
        
        # 1. Check if this User ID is already registered
        c.execute("SELECT user_id FROM ai_faces WHERE user_id = %s", (user_id,))
        if c.fetchone():
            core.set_ui_status("Already Registered", (0, 0, 255), "Error", (box['x'], box['y'], box['w'], box['h']))
            return jsonify({"status":"error", "msg":"This staff member is already registered in the biometric system."})

        if not embedding_cache:
            load_cache()

        for face in embedding_cache:
            # Manual Cosine Similarity: 1 - (A . B) / (||A|| * ||B||)
            a = emb; b = face['embedding']
            dist = 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
            
            if dist < 0.35: # Stricter Threshold for Registration
                name = face['full_name']
                core.set_ui_status("Identity Conflict", (0, 0, 255), name, (box['x'], box['y'], box['w'], box['h']))
                return jsonify({"status":"error", "msg":f"Denied: This face already belongs to {name}."})

        # 3. Success -> Register
        now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        c.execute("INSERT INTO ai_faces (user_id, embedding, created_at) VALUES (%s, %s, %s)", 
                  (user_id, json.dumps(emb.tolist()), now))
        
        db.commit(); db.close()
        load_cache() # Refresh Cache
        core.set_ui_status("Registered Successfully", (0, 255, 0), "Success", (box['x'], box['y'], box['w'], box['h']))
        return jsonify({"status":"success", "msg":f"Staff Face Registered Successfully!"})
    except Exception as e:
        core.set_ui_status("Registration Error", (0, 0, 255))
        return jsonify({"status":"error", "msg":"Could not detect face. Please center yourself and try again."})

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    frame = core.get_frame()
    if frame is None: return jsonify({"status":"error", "msg":"Camera not ready"})

    try:
        from deepface import DeepFace
        
        # --- Pre-processing: Auto-Enhance ---
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        enhanced_frame = cv2.merge((cl,a,b))
        enhanced_frame = cv2.cvtColor(enhanced_frame, cv2.COLOR_LAB2BGR)

        # Extraction with Fallback
        try:
            res = DeepFace.represent(enhanced_frame, model_name='Facenet', detector_backend='opencv', enforce_detection=True)
        except:
            res = DeepFace.represent(enhanced_frame, model_name='Facenet', detector_backend='retinaface', enforce_detection=True)
            
        live_emb = np.array(res[0]['embedding'])
        box = res[0]['facial_area']
        
        if not embedding_cache:
            load_cache()
        
        if not embedding_cache: 
            core.set_ui_status("No Records", (0, 0, 255), "Unknown")
            return jsonify({"status":"error", "msg":"Biometric database is empty."})

        best_match = None
        best_dist = 0.48 # Relaxed Threshold (Friendly Mode)

        # ULTRA FAST Vector Search
        for face in embedding_cache:
            a = live_emb; b = face['embedding']
            dist = 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
            
            if dist < best_dist:
                best_match = face
                best_dist = dist

        if best_match:
            user_id = best_match['user_id']
            full_name = best_match['full_name']
            
            db = get_db(); c = db.cursor(dictionary=True)
            now = datetime.datetime.now(); today = now.strftime("%Y-%m-%d"); current_time = now.strftime("%H:%M:%S")
            
            # (Attendance Logging Logic remains same...)
            c.execute("SELECT staff_id FROM staff WHERE user_id = %s LIMIT 1", (user_id,))
            staff_res = c.fetchone()
            staff_id = staff_res['staff_id'] if staff_res else None

            c.execute("SELECT attendance_id, check_in_time, check_out_time FROM attendance WHERE user_id = %s AND date = %s", (user_id, today))
            existing = c.fetchone()

            if not existing:
                c.execute("INSERT INTO attendance (user_id, staff_id, date, check_in_time, check_out_time, method) VALUES (%s, %s, %s, %s, '00:00:00', 'Biometric')", (user_id, staff_id, today, current_time))
                status_msg = f"Check-in @ {current_time}"
            elif existing['check_out_time'] in [None, '00:00:00', datetime.timedelta(0)]:
                c.execute("UPDATE attendance SET check_out_time = %s WHERE attendance_id = %s", (current_time, existing['attendance_id']))
                status_msg = f"Check-out @ {current_time}"
            else:
                status_msg = "Shift Complete"
            
            db.commit(); db.close()
            core.set_ui_status(status_msg, (0, 255, 0), full_name, (box['x'], box['y'], box['w'], box['h']))
            return jsonify({"status":"success", "msg":f"{full_name}: {status_msg}"})
        
        core.set_ui_status("Unknown", (0, 0, 255), "Access Denied", (box['x'], box['y'], box['w'], box['h']))
        return jsonify({"status":"unknown", "msg":"Face not recognized."})
    except Exception as e:
        print(f"[ERROR] Detection logic failed: {e}")
        return jsonify({"status":"error", "msg":f"Detection failed: {str(e)}"})

if __name__ == '__main__':
    load_cache()
    print("\n[BOOT] BIOMETRIC CORE v4.2")
    app.run(host='127.0.0.1', port=5005, debug=False, threaded=True)
