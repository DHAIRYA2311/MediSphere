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

def book_appointment(patient_id, doctor_id, date, time, existing_cursor=None):
    cursor = existing_cursor
    conn = None
    if not cursor:
        conn = get_db_connection()
        cursor = conn.cursor()
    
    try:
        meeting_code = f"bot-{datetime.now().timestamp()}"
        cursor.execute("""
            INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, booking_method, status, notes, meeting_code)
            VALUES (%s, %s, %s, %s, 'Online', 'Confirmed', 'Booked via Chatbot', %s)
        """, (patient_id, doctor_id, date, time, meeting_code))
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

    # --- RESET ---
    if message in ['hi', 'hello', 'start', 'menu', 'reset']:
        response["text"] = "Welcome to Medisphere! 🏥 I am your AI assistant. How can I help you today?"
        response["options"] = ["Book Appointment 📅", "Hospital FAQ ❓", "Symptom Checker (AI) 🩺", "Contact Support 📞"]
        user_sessions[user_id] = {'state': 'start', 'context': {}}
        return jsonify(response)

    # ==========================
    # MODE 1: FAQ BOT
    # ==========================
    if "faq" in message or "hospital faq" in message:
        response["text"] = "Ask me anything! Here are common topics:"
        response["options"] = ["Visiting Hours", "Insurance", "Emergency", "Location"]
        return jsonify(response)

    if "visiting hours" in message:
        response["text"] = "🏥 **Visiting Hours:**\n• General Ward: 4:00 PM - 7:00 PM\n• ICU: 5:00 PM - 6:00 PM (One visitor only)"
        return jsonify(response)
    
    if "insurance" in message:
        response["text"] = "We accept all major insurance providers including LIC, Star Health, and HDFC Ergo. Please visit the billing desk for claims."
        return jsonify(response)

    if "emergency" in message:
        response["text"] = "🚑 **Emergency Hotline:** +1-800-MED-HELP\nWe are open 24/7 for emergencies."
        return jsonify(response)

    if "location" in message:
        response["text"] = "We are located at: 123 Health Avenue, Medicity. Near Central Park."
        return jsonify(response)

    # ==========================
    # MODE 2: DISEASE PREDICTION
    # ==========================
    if "symptom" in message or "disease" in message or "checker" in message:
        response["text"] = "I can help you check your symptoms using our AI Diagnosis System.\n\nPlease type your symptoms separated by commas (e.g., Fever, Cough, Headache)."
        user_sessions[user_id] = {'state': 'symptom_check', 'context': {}}
        return jsonify(response)

    if state == 'symptom_check':
        # 1. Parse Symptoms
        raw_symptoms = [s.strip().title() for s in message.split(',')]
        
        # 2. Call AI Service
        try:
            ai_res = requests.post(DISEASE_PREDICTION_URL, json={"symptoms": raw_symptoms})
            result = ai_res.json()

            if result['status'] == 'success':
                disease = result['disease']
                confidence = result['confidence']
                
                response["text"] = f"🔬 **AI-Assisted Suggestion:** {disease}\n"
                response["text"] += f"📊 **Confidence:** {confidence}\n\n"
                response["text"] += "⚠️ **Disclaimer:** This result is based on limited symptoms and must be confirmed by a doctor. It is NOT a final diagnosis."
                
                response["options"] = ["Book Appointment 📅", "Go to Main Menu"]
                user_sessions[user_id]['state'] = 'start' # Reset after prediction
            else:
                response["text"] = "I couldn't process those symptoms. Please try typing them clearly (e.g. Fever, Cough)."
        
        except Exception as e:
            response["text"] = "⚠️ AI Diagnosis Service is currently offline. Please try again later or consult a doctor directly."
            print(f"AI Service Error: {e}")

        return jsonify(response)

    # ==========================
    # MODE 3: APPOINTMENT BOOKING
    # ==========================
    if "book appointment" in message or state == 'booking_start':
        response["text"] = "I can help with that! Please type the Department/Specialization (e.g., Cardiology, Neurology, General)."
        response["options"] = ["Cardiology", "Neurology", "General", "Pediatrics"]
        user_sessions[user_id] = {'state': 'booking_spec', 'context': {}}
        return jsonify(response)

    if state == 'booking_spec':
        doctors = get_doctors_by_spec(message)
        if not doctors:
            response["text"] = f"Sorry, I couldn't find any doctors in '{message}'. Please try another department."
            response["options"] = ["Cardiology", "Neurology", "General"]
            return jsonify(response)
        
        response["text"] = "Here are the available doctors. Please type the *ID* of the doctor you want."
        doctor_list_text = "\n".join([f"{d['doctor_id']}: Dr. {d['first_name']} {d['last_name']}" for d in doctors])
        response["text"] += f"\n\n{doctor_list_text}"
        user_sessions[user_id] = {'state': 'booking_doctor', 'context': {'spec': message}}
        return jsonify(response)

    if state == 'booking_doctor':
        try:
            doc_id = int(message)
            user_sessions[user_id]['context']['doctor_id'] = doc_id
            user_sessions[user_id]['state'] = 'booking_date'
            response["text"] = "Great. Please provide the Date in YYYY-MM-DD format (e.g., 2026-02-15)."
        except:
            response["text"] = "Please enter a valid numeric Doctor ID."
        return jsonify(response)

    if state == 'booking_date':
        try:
            datetime.strptime(message, '%Y-%m-%d')
            user_sessions[user_id]['context']['date'] = message
            user_sessions[user_id]['state'] = 'booking_time'
            response["text"] = "Almost there! Please enter the Time in HH:MM format (24h, e.g., 14:30)."
        except ValueError:
            response["text"] = "Invalid date format. Please use YYYY-MM-DD."
        return jsonify(response)

    if state == 'booking_time':
        user_sessions[user_id]['context']['time'] = message
        
        if user_id == 'guest':
            response["text"] = "To finalize, I need your **Full Name**."
            user_sessions[user_id]['state'] = 'guest_name'
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
                success = book_appointment(pat[0], ctx['doctor_id'], ctx['date'], message)
                if success:
                    response["text"] = f"✅ Appointment Confirmed for {ctx['date']} at {message}!"
                    user_sessions[user_id] = {'state': 'start', 'context': {}}
                else:
                    response["text"] = "Booking failed. Please try again."
            else:
                response["text"] = "I couldn't find your Patient Profile. Please contact support."
            return jsonify(response)

    # --- GUEST FLOW (Simplified) ---
    if state == 'guest_name':
        user_sessions[user_id]['context']['guest_name'] = message
        response["text"] = f"Thanks {message}. What is your **Phone Number**?"
        user_sessions[user_id]['state'] = 'guest_phone'
        return jsonify(response)

    if state == 'guest_phone':
        user_sessions[user_id]['context']['guest_phone'] = message
        response["text"] = "Finally, what is your **Email Address**?"
        user_sessions[user_id]['state'] = 'guest_email'
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
                return jsonify({"text": "System Error: Patient role not found. Please contact admin."})
            role_id = role_row[0]

            # 2. Check if Email already exists
            cursor.execute("SELECT user_id FROM Users WHERE email = %s", (ctx['guest_email'],))
            existing_user = cursor.fetchone()
            if existing_user:
                return jsonify({"text": "This email is already registered in our system. Please log in to your account to book or manage appointments. 🔐", "options": ["Login Page", "Go to Main Menu"]})

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
            success = book_appointment(new_patient_id, ctx['doctor_id'], ctx['date'], ctx['time'], cursor)
            
            if success:
                conn.commit()
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
        
        return jsonify(response)

    # --- FALLBACK ---
    response["text"] = "I'm not sure I understood that. Try selecting an option below."
    response["options"] = ["Book Appointment", "Hospital FAQ", "Symptom Checker (AI)"]
    return jsonify(response)

if __name__ == '__main__':
    print("Chatbot Service running on port 5002...")
    app.run(port=5002, debug=True)
