# Face Attendance Service

## Setup
1. Install dependencies (if not already done):
   ```
   pip install -r requirements.txt
   ```

## Run
1. Start the Flask Service:
   ```
   python app.py
   ```
   The service will run on `http://localhost:5001`.

## Features
- POST `/register_face`: Register a new user face.
- POST `/recognize_face`: Recognize a face from an image.

## Integration
The PHP backend communicates with this service via `backend/api/attendance/mark_attendance.php`.
Make sure this python script is running for the Face Attendance feature to work.
