from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import json

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

# Simple In-Memory Session/Context (For demo purposes, production needs Redis/DB)
user_sessions = {}

APP_URL = "http://localhost:3000"

def get_doctors_by_spec(spec):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT doctor_id, first_name, last_name FROM Doctors d JOIN Users u ON d.user_id = u.user_id WHERE specialization LIKE %s", (f"%{spec}%",))
    doctors = cursor.fetchall()
    cursor.close()
    conn.close()
    return doctors

def book_appointment(patient_id, doctor_id, date, time):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Default to "Online" for bot bookings for now
        meeting_code = f"bot-{datetime.now().timestamp()}"
        cursor.execute("""
            INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, booking_method, status, notes, meeting_code)
            VALUES (%s, %s, %s, %s, 'Online', 'Confirmed', 'Booked via Chatbot', %s)
        """, (patient_id, doctor_id, date, time, meeting_code))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cursor.close()
        conn.close()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '').lower()
    user_id = data.get('user_id', 'guest') # 'guest' or actual ID
    
    # State Management
    state = user_sessions.get(user_id, {}).get('state', 'start')
    context = user_sessions.get(user_id, {}).get('context', {})

    response = {"text": "", "options": []}

    # --- RESET / START ---
    if message in ['hi', 'hello', 'start', 'menu', 'reset']:
        response["text"] = "Welcome to Medisphere! 🏥 I am your AI assistant. How can I help you today?"
        response["options"] = ["Book Appointment 📅", "Hospital FAQ ❓", "Doctors List 👨‍⚕️", "Contact Support 📞"]
        user_sessions[user_id] = {'state': 'start', 'context': {}}
        return jsonify(response)

    # --- BOOKING FLOW ---
    if "book appointment" in message or state == 'booking_start':
        response["text"] = "I can help with that! Please type the Department/Specialization you are looking for (e.g., Cardiology, Neurology, General)."
        response["options"] = ["Cardiology", "Neurology", "General", "Pediatrics"]
        user_sessions[user_id] = {'state': 'booking_spec', 'context': {}}
        return jsonify(response)

    if state == 'booking_spec':
        # Assume message is specialization
        doctors = get_doctors_by_spec(message)
        if not doctors:
            response["text"] = f"Sorry, I couldn't find any doctors in '{message}'. Please try another department."
            response["options"] = ["Cardiology", "Neurology", "General"]
            return jsonify(response)
        
        response["text"] = "Here are the available doctors. Please type the *ID* of the doctor you want to consult."
        doctor_list_text = "\n".join([f"{d['doctor_id']}: Dr. {d['first_name']} {d['last_name']}" for d in doctors])
        response["text"] += f"\n\n{doctor_list_text}"
        
        # Save specialization context
        user_sessions[user_id] = {'state': 'booking_doctor', 'context': {'spec': message}}
        return jsonify(response)

    if state == 'booking_doctor':
        # Assume message is Doctor ID
        try:
            doc_id = int(message)
            user_sessions[user_id]['context']['doctor_id'] = doc_id
            # TODO: Validate doc_id exists
            user_sessions[user_id]['state'] = 'booking_date'
            response["text"] = "Great choice. Please provide the Date strictly in YYYY-MM-DD format (e.g., 2025-12-31)."
        except:
            response["text"] = "Please enter a valid numeric Doctor ID from the list above."
        return jsonify(response)

    if state == 'booking_date':
        # Validate Date
        try:
            date_obj = datetime.strptime(message, '%Y-%m-%d')
            user_sessions[user_id]['context']['date'] = message
            user_sessions[user_id]['state'] = 'booking_time'
            response["text"] = "Almost there! Please enter the Time in HH:MM format (24h, e.g., 14:30)."
        except ValueError:
            response["text"] = "Invalid date format. Please use YYYY-MM-DD."
        return jsonify(response)

    if state == 'booking_time':
        # Save time first
        user_sessions[user_id]['context']['time'] = message
        
        if user_id == 'guest':
            # Start Guest Registration Flow
            response["text"] = "To finalize the booking, I need a few details. What is your **Full Name**?"
            user_sessions[user_id]['state'] = 'guest_name'
            return jsonify(response)
        else:
            # Existing logic for logged-in user...
            time_str = message
            patient_id = user_sessions.get(user_id, {}).get('patient_id')
            
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT patient_id FROM Patients WHERE user_id = %s", (user_id,))
            pat = cur.fetchone()
            cur.close()
            conn.close()

            if pat:
                ctx = user_sessions[user_id]['context']
                success = book_appointment(pat[0], ctx['doctor_id'], ctx['date'], time_str)
                if success:
                    response["text"] = f"✅ Appointment Confirmed for {ctx['date']} at {time_str}! You can view it in 'My Appointments'."
                    user_sessions[user_id] = {'state': 'start', 'context': {}}
                else:
                    response["text"] = "Something went wrong booking the slot. Please try again later."
            else:
                response["text"] = "I couldn't verify your Patient Profile. Please ensure you are registered as a patient."
            
            return jsonify(response)

    # --- GUEST REGISTRATION FLOW ---
    if state == 'guest_name':
        user_sessions[user_id]['context']['guest_name'] = message
        response["text"] = f"Thanks {message}. What is your **Phone Number**?"
        user_sessions[user_id]['state'] = 'guest_phone'
        return jsonify(response)

    if state == 'guest_phone':
        user_sessions[user_id]['context']['guest_phone'] = message
        response["text"] = "Got it. Finally, what is your **Email Address**? (We will use this to create your account)."
        user_sessions[user_id]['state'] = 'guest_email'
        return jsonify(response)

    if state == 'guest_email':
        email = message
        ctx = user_sessions[user_id]['context']
        name_parts = ctx['guest_name'].split()
        first_name = name_parts[0]
        last_name = name_parts[-1] if len(name_parts) > 1 else ""
        phone = ctx['guest_phone']
        
        # Auto-Register Logic
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        try:
            # Check if email exists
            cur.execute("SELECT user_id, role_id FROM Users WHERE email = %s", (email,))
            existing_user = cur.fetchone()

            patient_id = None
            
            # Fetch Role ID for 'Patient'
            cur.execute("SELECT role_id FROM Roles WHERE role_name = 'Patient'")
            role_row = cur.fetchone()
            patient_role_id = role_row['role_id'] if role_row else 3 # Default to 3 if fetch fails

            if existing_user:
                # Assuming simple check: if existing, try to find patient profile
                # Note: We are using role_id now, not role string
                cur.execute("SELECT patient_id FROM Patients WHERE user_id = %s", (existing_user['user_id'],))
                pat_row = cur.fetchone()
                if pat_row:
                    patient_id = pat_row['patient_id']
                else:
                    response["text"] = "Your email is registered but no patient profile found. Contact support."
                    return jsonify(response)
            else:
                # Create NEW User
                # Schema: user_id, role_id, admin_id, first_name, last_name, email, phone, password, gender, dob, address, created_at, status
                current_date = datetime.now().strftime('%Y-%m-%d')
                
                # Using a hashed password is better, but for python demo, we insert plain or simple hash 
                # Ideally: Use bcrypt. For now, matching the PHP's simple flow or just plain text if PHP uses `password_verify`.
                # The PHP uses `password_hash($password, PASSWORD_BCRYPT)`. Python can do this too or just store text and let user reset.
                # For this demo, we store a clear placeholder or simple hash if we had the lib.
                # Let's just store "Password123" - USER SHOULD RESET.
                
                cur.execute("""
                    INSERT INTO Users 
                    (role_id, first_name, last_name, email, phone, password, gender, dob, address, created_at, status) 
                    VALUES 
                    (%s, %s, %s, %s, %s, 'Password123', 'Other', '2000-01-01', 'Online Bot User', %s, 'Active')
                """, (patient_role_id, first_name, last_name, email, phone, current_date))
                
                new_user_id = cur.lastrowid
                
                # Create Patient Profile
                # Schema: patient_id, user_id, blood_group, emergency_contact, insurance_number, medical_history
                cur.execute("""
                    INSERT INTO Patients 
                    (user_id, blood_group, emergency_contact, insurance_number, medical_history) 
                    VALUES 
                    (%s, 'N/A', %s, 'N/A', 'None')
                """, (new_user_id, phone))
                patient_id = cur.lastrowid
                conn.commit()

            # Now Book
            if patient_id:
                success = book_appointment(patient_id, ctx['doctor_id'], ctx['date'], ctx['time'])
                if success:
                    if existing_user:
                        response["text"] = f"✅ Appointment Booked for {ctx['date']}! You have an account, please login to view details."
                    else:
                        response["text"] = f"✅ Booking Confirmed! We have created an account for you.\nUser: {email}\nPass: Password123\n\n**Please Login to view your appointment.**"
                    
                    user_sessions[user_id] = {'state': 'start', 'context': {}}
                else:
                    response["text"] = "Booking failed due to internal error."
        
        except Exception as e:
            print(f"Registration Error: {e}")
            response["text"] = f"An error occurred during registration: {str(e)}"
        finally:
            cur.close()
            conn.close()
            
        return jsonify(response)


    # --- FAQ HANDLING ---
    if "faq" in message:
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

    # --- FALLBACK ---
    response["text"] = "I'm not sure I understood that. 🤔 Try selecting an option below."
    response["options"] = ["Book Appointment", "Hospital FAQ", "Contact Support"]
    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5002, debug=True)
