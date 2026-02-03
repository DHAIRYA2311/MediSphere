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

$bill_id = $_GET['bill_id'] ?? null;

if (!$bill_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT b.*, 
               a.appointment_date, a.appointment_time,
               u.first_name as doctor_fname, u.last_name as doctor_lname, 
               d.specialization
        FROM Billing b
        JOIN Appointments a ON b.appointment_id = a.appointment_id
        JOIN Doctors d ON a.doctor_id = d.doctor_id
        JOIN Users u ON d.user_id = u.user_id
        WHERE b.bill_id = ?
    ");

    $stmt->execute([$bill_id]);
    $data = $stmt->fetch();

    if ($data) {
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Bill not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
