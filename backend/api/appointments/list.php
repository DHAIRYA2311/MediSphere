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

// Fetch appointments based on role
if (strtolower($role) == 'patient') {
    $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $patient_id = $stmt->fetchColumn();

    $query = "
        SELECT a.*, d.specialization, u.first_name as doctor_fname, u.last_name as doctor_lname 
        FROM Appointments a 
        JOIN Doctors d ON a.doctor_id = d.doctor_id 
        JOIN Users u ON d.user_id = u.user_id 
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    ";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$patient_id]);

} elseif (strtolower($role) == 'doctor') {
    $stmt = $pdo->prepare("SELECT doctor_id FROM Doctors WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $doctor_id = $stmt->fetchColumn();

    $query = "
        SELECT a.*, u.first_name as patient_fname, u.last_name as patient_lname 
        FROM Appointments a 
        JOIN Patients p ON a.patient_id = p.patient_id 
        JOIN Users u ON p.user_id = u.user_id 
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    ";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$doctor_id]);
} else {
    // Admin or Receptionist - see all? or filtered. Let's return all for now.
    $query = "
        SELECT a.*, 
               u_d.first_name as doctor_fname, u_d.last_name as doctor_lname,
               u_p.first_name as patient_fname, u_p.last_name as patient_lname
        FROM Appointments a
        JOIN Doctors d ON a.doctor_id = d.doctor_id
        JOIN Users u_d ON d.user_id = u_d.user_id
        JOIN Patients p ON a.patient_id = p.patient_id
        JOIN Users u_p ON p.user_id = u_p.user_id
        ORDER BY a.appointment_date DESC
    ";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
}

$appointments = $stmt->fetchAll();
echo json_encode(['status' => 'success', 'data' => $appointments]);
?>
