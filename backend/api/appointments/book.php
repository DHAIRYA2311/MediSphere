<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

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

        echo json_encode(['status' => 'success', 'message' => 'Appointment booked successfully']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Booking failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
}
?>
