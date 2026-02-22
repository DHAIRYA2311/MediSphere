<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';
require_once '../../utils/NotificationService.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$user_id = $payload['id'];
$role = $payload['role'];

$data = json_decode(file_get_contents("php://input"));
$patient_id = null;

// Logic: If user is receptionist/admin, they can provide a patient_id.
// Otherwise, we look up the patient_id associated with the logged-in user.
if (in_array($role, ['receptionist', 'admin', 'staff']) && isset($data->patient_id)) {
    $patient_id = $data->patient_id;
} else {
    $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $patient = $stmt->fetch();
    
    if ($patient) {
        $patient_id = $patient['patient_id'];
    } else if ($role == 'patient') {
        echo json_encode(['status' => 'error', 'message' => 'Patient profile not found']);
        exit();
    }
}

if (!$patient_id) {
    echo json_encode(['status' => 'error', 'message' => 'Valid Patient ID required']);
    exit();
}

if (isset($data->doctor_id) && isset($data->date) && isset($data->time) && isset($data->method)) {
    $doctor_id = $data->doctor_id;
    $date = $data->date;
    $time = $data->time;
    $method = $data->method; // Online or Walk-in
    $notes = isset($data->notes) ? $data->notes : '';
    
    // Auto-confirm Online appointments for now to simplify flow
    $status = 'Confirmed'; 
    
    // Generate Meeting Code if Online
    $meeting_code = null;
    if ($method === 'Online') {
        $meeting_code = 'medisphere-' . uniqid() . '-' . rand(1000, 9999);
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, booking_method, status, notes, meeting_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$patient_id, $doctor_id, $date, $time, $method, $status, $notes, $meeting_code]);

        // 📧 NEW: Send Notifications to Patient & Doctor
        try {
            // Get Patient Data
            $stmt_pat = $pdo->prepare("SELECT u.user_id, u.email, u.first_name, u.last_name FROM Patients p JOIN Users u ON p.user_id = u.user_id WHERE p.patient_id = ?");
            $stmt_pat->execute([$patient_id]);
            $pat_data = $stmt_pat->fetch();

            // Get Doctor Data
            $stmt_doc = $pdo->prepare("SELECT u.user_id, u.email, u.first_name, u.last_name FROM Doctors d JOIN Users u ON d.user_id = u.user_id WHERE d.doctor_id = ?");
            $stmt_doc->execute([$doctor_id]);
            $doc_data = $stmt_doc->fetch();

            if ($pat_data && $doc_data) {
                $pName = $pat_data['first_name'] . ' ' . $pat_data['last_name'];
                $dName = $doc_data['first_name'] . ' ' . $doc_data['last_name'];
                
                // Alert Patient (Email + In-App)
                NotificationService::sendAppointmentConfirmation($pat_data['email'], $pat_data['user_id'], $pName, $dName, $date, $time);
                
                // Alert Doctor (Email + In-App)
                NotificationService::sendDoctorAssignment($doc_data['email'], $doc_data['user_id'], $dName, $pName, "$date at $time");
            }
        } catch (Exception $e_mail) {
            // Silence mail errors to avoid breaking the core booking flow
        }

        echo json_encode(['status' => 'success', 'message' => 'Appointment booked successfully']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Booking failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
}
?>
