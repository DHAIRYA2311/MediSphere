<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload) {
    http_response_code(401);
    exit();
}

$id = $_GET['id'] ?? '';

if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT a.appointment_id, a.status, a.patient_id, a.booking_method, a.appointment_date, a.appointment_time,
               p.blood_group, p.insurance_number, p.medical_history,
               u.first_name as patient_fname, u.last_name as patient_lname, u.email, u.phone, u.dob, u.gender
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.patient_id
        JOIN Users u ON p.user_id = u.user_id
        WHERE a.appointment_id = ?
    ");
    $stmt->execute([$id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($data) {
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Appointment not found']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
