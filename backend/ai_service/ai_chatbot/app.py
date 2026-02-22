from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import json
import requests
import bcrypt

app = Flask(__name__)
CORS(app)

# Database Connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="", # Adjust if needed
        database="medisphere_shms"
    )

# Simple In-Memory Session/Context
user_sessions = {}
DISEASE_PREDICTION_URL = "http://localhost:5004/predict_disease"

def get_doctors_by_spec(spec):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT doctor_id, first_name, last_name FROM Doctors d JOIN Users u ON d.user_id = u.user_id WHERE specialization LIKE %s", (f"%{spec}%",))
    doctors = cursor.fetchall()
    cursor.close()
    conn.close()
    return doctors

def book_appointment(patient_id, doctor_id, date, time, mode='Online', existing_cursor=None):
    cursor = existing_cursor
    conn = None
    if not cursor:
        conn = get_db_connection()
        cursor = conn.cursor()
    
    try:
        meeting_code = f"bot-{datetime.now().timestamp()}"
        cursor.execute("""
            INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, booking_method, status, notes, meeting_code)
            VALUES (%s, %s, %s, %s, %s, 'Confirmed', 'Booked via Chatbot', %s)
        """, (patient_id, doctor_id, date, time, mode, meeting_code))
        if conn:
            conn.commit()
        return True
    except Exception as e:
        print(f"Booking Error: {e}")
        return False
    finally:
        if conn:
            cursor.close()
            conn.close()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '').lower()
    user_id = data.get('user_id', 'guest') 
    
    state = user_sessions.get(user_id, {}).get('state', 'start')
    
    response = {"text": "", "options": []}

    # ==========================
    # LOGGING LOGIC
    # ==========================
    def log_chat(u_msg, b_res):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Resolve patient_id if not guest
            pat_id = None
            if user_id != 'guest':
                cursor.execute("SELECT patient_id FROM Patients WHERE user_id = %s", (user_id,))
                row = cursor.fetchone()
                if row: pat_id = row[0]
            
            cursor.execute("""
                INSERT INTO chatbot_logs (patient_id, user_message, bot_response, created_at)
                VALUES (%s, %s, %s, NOW())
            """, (pat_id, u_msg[:255], b_res[:255]))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Logging Error: {e}")

    # --- RESET ---
    if message in ['hi', 'hello', 'start', 'menu', 'reset']:
        response["text"] = "Welcome to Medisphere! 🏥 I am your AI assistant. How can I help you today?"
        response["options"] = ["Book Appointment 📅", "Hospital FAQ ❓", "Symptom Checker (AI) 🩺", "Contact Support 📞"]
        user_sessions[user_id] = {'state': 'start', 'context': {}}
        log_chat(message, response["text"])
        return jsonify(response)

    # ==========================
    # MODE 1: FAQ BOT
    # ==========================
    if "faq" in message or "hospital faq" in message:
        response["text"] = "Ask me anything! Here are common topics:"
        response["options"] = ["Visiting Hours", "Insurance", "Emergency", "Location"]
        log_chat(message, response["text"])
        return jsonify(response)

    if "visiting hours" in message:
        response["text"] = "🏥 **Visiting Hours:**\n• General Ward: 4:00 PM - 7:00 PM\n• ICU: 5:00 PM - 6:00 PM (One visitor only)"
        log_chat(message, response["text"])
        return jsonify(response)
    
    if "insurance" in message:
        response["text"] = "We accept all major insurance providers including LIC, Star Health, and HDFC Ergo. Please visit the billing desk for claims."
        log_chat(message, response["text"])
        return jsonify(response)

    if "emergency" in message:
        response["text"] = "🚑 **Emergency Hotline:** +1-800-MED-HELP\nWe are open 24/7 for emergencies."
        log_chat(message, response["text"])
        return jsonify(response)

    if "location" in message:
        response["text"] = "We are located at: 123 Health Avenue, Medicity. Near Central Park."
        log_chat(message, response["text"])
        return jsonify(response)

    # ==========================
    # MODE 2: DISEASE PREDICTION
    # ==========================
    if "symptom" in message or "disease" in message or "checker" in message:
        response["text"] = "I can help you check your symptoms using our AI Diagnosis System. Please select your symptoms from the list below (click one or type several separated by commas):"
        response["options"] = [
            "Fever", "Cough", "Fatigue", "Headache", 
            "Sore Throat", "Body Pain", "Runny Nose", "Breathlessness",
            "Done ✅ (Predict)"
        ]
        user_sessions[user_id] = {'state': 'symptom_check', 'context': {'selected': []}}
        log_chat(message, response["text"])
        return jsonify(response)

    if state == 'symptom_check':
        # Handle "Done" or Final Prediction
        if "done" in message or "predict" in message:
            ctx = user_sessions[user_id].get('context', {})
            selected = ctx.get('selected', [])
            if not selected:
                response["text"] = "You haven't selected any symptoms. Please select at least one or type it in."
                response["options"] = ["Fever", "Cough", "Fatigue", "Headache", "Body Pain", "Sore Throat"]
                log_chat(message, response["text"])
                return jsonify(response)
            
            # Call AI Service
            try:
                ai_res = requests.post(DISEASE_PREDICTION_URL, json={"symptoms": selected})
                result = ai_res.json()
                if result['status'] == 'success':
                    response["text"] = f"🔬 **AI-Assisted Suggestion:** {result['disease']}\n"
                    response["text"] += f"📊 **Confidence:** {result['confidence']}\n"
                    response["text"] += f"📝 **Analyzed Symptoms:** {', '.join(selected).lower()}\n\n"
                    response["text"] += "⚠️ **Disclaimer:** This is NOT a final diagnosis. Please consult a doctor for official verification."
                    response["options"] = ["Book Appointment 📅", "Restart Menu"]
                    user_sessions[user_id] = {'state': 'start', 'context': {}}
                else:
                    response["text"] = "AI service error. Please try again."
                
                log_chat(message, response["text"])
                return jsonify(response)
            except:
                response["text"] = "⚠️ AI Diagnosis Service offline. Please try again later."
                log_chat(message, response["text"])
                return jsonify(response)

        # Handle Selection
        input_symptoms = [s.strip().title().replace(' ', '') for s in message.split(',')]
        current_selected = user_sessions[user_id]['context'].get('selected', [])
        
        for s in input_symptoms:
            if s not in current_selected:
                current_selected.append(s)
        
        user_sessions[user_id]['context']['selected'] = current_selected
        
        response["text"] = f"Added! ✅ **Current Symptoms:** {', '.join(current_selected)}\n\nSelect more symptoms below or click 'Done' to see the prediction."
        response["options"] = [
            "Fever", "Cough", "Fatigue", "Headache", 
            "Sore Throat", "Body Pain", "Runny Nose", "Breathlessness",
            "Done ✅ (Predict)"
        ]
        log_chat(message, response["text"])
        return jsonify(response)

    # ==========================
    # MODE 3: APPOINTMENT BOOKING
    # ==========================
    if "book appointment" in message or state == 'booking_start':
        response["text"] = "I can help with that! Please type the Department/Specialization (e.g., Cardiology, Neurology, General)."
        response["options"] = ["Cardiology", "Neurology", "General", "Pediatrics"]
        user_sessions[user_id] = {'state': 'booking_spec', 'context': {}}
        log_chat(message, response["text"])
        return jsonify(response)

    if state == 'booking_spec':
        doctors = get_doctors_by_spec(message)
        if not doctors:
            response["text"] = f"Sorry, I couldn't find any doctors in '{message}'. Please try another department."
            response["options"] = ["Cardiology", "Neurology", "General"]
            log_chat(message, response["text"])
            return jsonify(response)
        
        response["text"] = "Here are the available doctors. Please type the *ID* of the doctor you want."
        doctor_list_text = "\n".join([f"{d['doctor_id']}: Dr. {d['first_name']} {d['last_name']}" for d in doctors])
        response["text"] += f"\n\n{doctor_list_text}"
        user_sessions[user_id] = {'state': 'booking_doctor', 'context': {'spec': message}}
        log_chat(message, response["text"])
        return jsonify(response)

    if state == 'booking_doctor':
        try:
            doc_id = int(message)
            user_sessions[user_id]['context']['doctor_id'] = doc_id
            user_sessions[user_id]['state'] = 'booking_mode'
            response["text"] = "Excellent choice. How would you like to consult with the doctor?"
            response["options"] = ["Online (Video Call) 💻", "Offline (In-Person) 🏥"]
        except:
            response["text"] = "Please enter a valid numeric Doctor ID."
        log_chat(message, response["text"])
        return jsonify(response)

    if state == 'booking_mode':
        mode = "Online" if "online" in message else "Walk-in"
        user_sessions[user_id]['context']['mode'] = mode
        user_sessions[user_id]['state'] = 'booking_date'
        response["text"] = f"Understood. {mode} session selected. Please provide the Date in YYYY-MM-DD format (e.g., 2026-02-15)."
        log_chat(message, response["text"])
        return jsonify(response)

    if state == 'booking_date':
        try:
            datetime.strptime(message, '%Y-%m-%d')
            user_sessions[user_id]['context']['date'] = message
            user_sessions[user_id]['state'] = 'booking_time'
            response["text"] = "Almost there! Please enter the Time in HH:MM format (24h, e.g., 14:30)."
        except ValueError:
            response["text"] = "Invalid date format. Please use YYYY-MM-DD."
        log_chat(message, response["text"])
        return jsonify(response)

    if state == 'booking_time':
        user_sessions[user_id]['context']['time'] = message
        
        if user_id == 'guest':
            response["text"] = "To finalize, I need your **Full Name**."
            user_sessions[user_id]['state'] = 'guest_name'
            log_chat(message, response["text"])
            return jsonify(response)
        else:
            # Logged-in User Booking
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT patient_id FROM Patients WHERE user_id = %s", (user_id,))
            pat = cur.fetchone()
            cur.close()
            conn.close()

            if pat:
                ctx = user_sessions[user_id]['context']
                mode = ctx.get('mode', 'Online')
                success = book_appointment(pat[0], ctx['doctor_id'], ctx['date'], message, mode)
                if success:
                    # 📧 Trigger Notification
                    trigger_notification('appointment', {
                        'user_id': user_id,
                        'doctor_id': ctx['doctor_id'],
                        'date': ctx['date'],
                        'time': message
                    })
                    response["text"] = f"✅ Appointment Confirmed! Your {mode} consultation is scheduled for {ctx['date']} at {message}."
                    user_sessions[user_id] = {'state': 'start', 'context': {}}
                else:
                    response["text"] = "Booking failed. Please try again."
            else:
                response["text"] = "I couldn't find your Patient Profile. Please contact support."
            log_chat(message, response["text"])
            return jsonify(response)

    # --- GUEST FLOW (Simplified) ---
    if state == 'guest_name':
        user_sessions[user_id]['context']['guest_name'] = message
        response["text"] = f"Thanks {message}. What is your **Phone Number**?"
        user_sessions[user_id]['state'] = 'guest_phone'
        log_chat(message, response["text"])
        return jsonify(response)

    if state == 'guest_phone':
        user_sessions[user_id]['context']['guest_phone'] = message
        response["text"] = "Finally, what is your **Email Address**?"
        user_sessions[user_id]['state'] = 'guest_email'
        log_chat(message, response["text"])
        return jsonify(response)

    if state == 'guest_email':
        user_sessions[user_id]['context']['guest_email'] = message
        ctx = user_sessions[user_id]['context']
        
        # Split Name
        name_parts = ctx['guest_name'].split(' ')
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else "Patient"
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # 1. Ensure 'Patient' role exists and get ID
            cursor.execute("SELECT role_id FROM Roles WHERE LOWER(role_name) = 'patient'")
            role_row = cursor.fetchone()
            if not role_row:
                response["text"] = "System Error: Patient role not found. Please contact admin."
                log_chat(message, response["text"])
                return jsonify(response)
            role_id = role_row[0]

            # 2. Check if Email already exists
            cursor.execute("SELECT user_id FROM Users WHERE email = %s", (ctx['guest_email'],))
            existing_user = cursor.fetchone()
            if existing_user:
                response["text"] = "This email is already registered in our system. Please log in to your account to book or manage appointments. 🔐"
                response["options"] = ["Login Page", "Go to Main Menu"]
                log_chat(message, response["text"])
                return jsonify(response)

            # 3. Create User record
            print(f"[BOT] Registering new guest user: {ctx['guest_email']}")
            hashed_pass = bcrypt.hashpw('temp123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute("""
                INSERT INTO Users (role_id, first_name, last_name, email, phone, password, gender, dob, address, created_at, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'Other', '2000-01-01', 'Online Registration', CURDATE(), 'Active')
            """, (role_id, first_name, last_name, ctx['guest_email'], ctx['guest_phone'], hashed_pass))
            new_user_id = cursor.lastrowid
            
            # 4. Create Patient record
            cursor.execute("""
                INSERT INTO Patients (user_id, blood_group, emergency_contact, insurance_number, medical_history)
                VALUES (%s, 'N/A', %s, 'N/A', 'Registration via AI Bot')
            """, (new_user_id, ctx['guest_phone']))
            new_patient_id = cursor.lastrowid
            
            # 5. Finalize Appointment
            mode = ctx.get('mode', 'Online')
            success = book_appointment(new_patient_id, ctx['doctor_id'], ctx['date'], ctx['time'], mode, cursor)
            
            if success:
                conn.commit()
                # 📧 Trigger Notifications
                # 1. Welcome Note
                trigger_notification('welcome', {
                    'email': ctx['guest_email'],
                    'user_id': new_user_id,
                    'first_name': first_name,
                    'role': 'Patient'
                })
                # 2. Appointment Note
                trigger_notification('appointment', {
                    'user_id': new_user_id,
                    'doctor_id': ctx['doctor_id'],
                    'date': ctx['date'],
                    'time': ctx['time']
                })
                
                print(f"[BOT] Appointment successfully booked for Patient {new_patient_id}")
                response["text"] = f"✅ Success, {first_name}! Your profile is created and appointment is confirmed for {ctx['date']} at {ctx['time']}.\n\n🔑 TEMPORARY LOGIN:\nEmail: {ctx['guest_email']}\nPass: temp123"
            else:
                conn.rollback()
                response["text"] = "Something went wrong during booking. Please try again."
                
        except Exception as e:
            conn.rollback()
            print(f"Chatbot Registration Error: {e}")
            response["text"] = "Database error. Please try again later."
        finally:
            cursor.close()
            conn.close()
            user_sessions[user_id] = {'state': 'start', 'context': {}}
        
        log_chat(message, response["text"])
        return jsonify(response)

    # --- FALLBACK ---
    response["text"] = "I'm not sure I understood that. Try selecting an option below."
    response["options"] = ["Book Appointment", "Hospital FAQ", "Symptom Checker (AI)"]
    log_chat(message, response["text"])
    return jsonify(response)

# ==========================
# NOTIFICATION HELPER
# ==========================
def trigger_notification(action, data):
    try:
        # Resolve path to PHP bridge
        url = "http://localhost/Medisphere-Project/backend/api/notifications/chatbot_notify.php"
        data['action'] = action
        requests.post(url, json=data, timeout=5)
    except Exception as e:
        print(f"Notification Bridge Error: {e}")

if __name__ == '__main__':
    print("Chatbot Service running on port 5002...")
    app.run(port=5002, debug=True)
