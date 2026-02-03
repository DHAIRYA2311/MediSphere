# MODIFIED: Added Response for video streaming
from flask import Flask, render_template, request, jsonify, Response
from deepface import DeepFace
import cv2, numpy as np, mysql.connector, json, datetime, os
import mediapipe as mp  # NEW: Import MediaPipe
from flask_cors import CORS # Added for React Integration

app = Flask(__name__)
CORS(app) # Enable CORS

# --- MediaPipe Face Mesh Initialization ---
# NEW: Initialize MediaPipe Face Mesh components
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
# NEW: Define the drawing spec for the mesh (light green)
drawing_spec = mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=1, circle_radius=1)


# --- Database Connection ---
def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",        # 👈 change if you use another MySQL username
        password="",        # 👈 your MySQL password here
        database="medisphere_shms" # UPDATED to project database
    )

# --- Create Tables if not exists ---
def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS ai_faces (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            embedding JSON
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS ai_attendance_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            time DATETIME
        )
    """)
    conn.commit()
    conn.close()

init_db()

# --- Helper Functions ---
def save_embedding(name, embedding):
    conn = get_connection()
    c = conn.cursor()
    # Check if name exists, if so delete old (Re-register logic)
    c.execute("DELETE FROM ai_faces WHERE name = %s", (name,))
    c.execute("INSERT INTO ai_faces (name, embedding) VALUES (%s, %s)", 
              (name, json.dumps(embedding)))
    conn.commit()
    conn.close()

def get_all_embeddings():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT name, embedding FROM ai_faces")
    data = c.fetchall()
    conn.close()
    return [(n, json.loads(e)) for n, e in data]

# --- Routes ---
@app.route('/')
def index():
    return "Face Service Running"

# NEW: Video streaming route for face mesh
def gen_frames():
    """Video streaming generator function with Face Mesh."""
    cap = cv2.VideoCapture(0)
    # Use 'with' block for proper resource management
    with mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as face_mesh:
        
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            frame = cv2.cvtColor(cv2.flip(frame, 1), cv2.COLOR_BGR2RGB)
            frame.flags.writeable = False
            results = face_mesh.process(frame)
            frame.flags.writeable = True
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            
            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    mp_drawing.draw_landmarks(
                        image=frame,
                        landmark_list=face_landmarks,
                        connections=mp_face_mesh.FACEMESH_TESSELATION,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mp_drawing_styles
                        .get_default_face_mesh_tesselation_style())

            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    cap.release()

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the 'src' of an 'img' tag."""
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/register', methods=['GET','POST'])
def register():
    if request.method == 'POST':
        name = request.json.get('name') if request.is_json else request.form.get('name')
        
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return jsonify({"status": "error", "msg": "Camera not working"})

        live_emb = None
        try:
            live_emb_data = DeepFace.represent(frame, 
                                               model_name='Facenet', 
                                               enforce_detection=True)
            live_emb = live_emb_data[0]['embedding']

        except Exception as e:
            return jsonify({"status": "error", "msg": f"No face detected. Please try again. ({str(e)})"})

        if live_emb:
            # Re-register logic handled in save_embedding by deleting old entry first
            save_embedding(name, live_emb)
            return jsonify({"status": "success", "msg": f"{name} registered successfully!"})

    return jsonify({"status": "info", "msg": "Use POST to register"})

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    if not ret:
        return jsonify({"status":"error","msg":"Camera error"})

    live_emb = None
    try:
        live_emb_data = DeepFace.represent(frame, 
                                           model_name='Facenet', 
                                           enforce_detection=True)
        live_emb = live_emb_data[0]['embedding']

    except Exception as e:
        return jsonify({"status":"error","msg":f"No face detected. Please try again. ({str(e)})"})

    try:
        all_faces = get_all_embeddings()
        best_match, best_score = None, 0.6 

        for name, db_emb in all_faces:
            dist = DeepFace.verify(live_emb, 
                                   db_emb, 
                                   model_name='Facenet', 
                                   enforce_detection=False, 
                                   distance_metric='cosine')['distance']
            
            if dist < best_score:
                best_match, best_score = name, dist

        if best_match:
            conn = get_connection()
            c = conn.cursor()
            
            # Check for duplicate today
            today = datetime.datetime.now().strftime("%Y-%m-%d")
            c.execute("SELECT time FROM ai_attendance_logs WHERE name = %s AND DATE(time) = %s", (best_match, today))
            existing = c.fetchone()
            
            if existing:
                existing_time = existing[0].strftime("%H:%M:%S")
                conn.close()
                return jsonify({"status":"warning", "msg":f"You have already marked attendance at {existing_time}"})
            
            current_time = datetime.datetime.now().strftime("%H:%M:%S")
            c.execute("INSERT INTO ai_attendance_logs (name, time) VALUES (%s, %s)", 
                      (best_match, datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
            conn.commit()
            conn.close()
            return jsonify({"status":"success","msg":f"Welcome {best_match}, Attendance Marked at {current_time}"})
        else:
            return jsonify({"status":"unknown","msg":"No match found"})

    except Exception as e:
        return jsonify({"status":"error","msg":str(e)})

if __name__ == '__main__':
    app.run(port=5001, debug=True)
