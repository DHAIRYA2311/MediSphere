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

$meeting_code = $_GET['code'] ?? '';

if (!$meeting_code) {
    echo json_encode(['status' => 'error', 'message' => 'Missing code']);
    exit();
}

try {
    // Get Appointment Status and Bill
    $stmt = $pdo->prepare("
        SELECT a.appointment_id, a.status, a.patient_id,
               b.bill_id, b.total_amount, b.payment_status,
               CONCAT(u.first_name, ' ', u.last_name) as patient_name
        FROM Appointments a
        LEFT JOIN Billing b ON a.appointment_id = b.appointment_id
        LEFT JOIN Patients p ON a.patient_id = p.patient_id
        LEFT JOIN Users u ON p.user_id = u.user_id
        WHERE a.meeting_code = ?
    ");
    $stmt->execute([$meeting_code]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($data) {
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Not found']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
