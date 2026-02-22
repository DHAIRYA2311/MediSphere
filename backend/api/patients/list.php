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

$role = strtolower($payload['role']);

// Only Admin, Doctor, Receptionist, Staff can list all patients
if (!in_array($role, ['admin', 'doctor', 'receptionist', 'staff'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            p.patient_id, 
            p.blood_group, 
            p.emergency_contact, 
            p.insurance_number,
            p.medical_history,
            u.user_id,
            u.first_name, 
            u.last_name, 
            u.email, 
            u.phone, 
            u.gender, 
            u.dob,
            u.address
        FROM Patients p
        JOIN Users u ON p.user_id = u.user_id
        ORDER BY u.last_name ASC
    ");
    $stmt->execute();
    $patients = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $patients]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch patients: ' . $e->getMessage()]);
}
?>
