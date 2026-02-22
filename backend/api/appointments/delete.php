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

$user_role = strtolower($payload['role']);
$data = json_decode(file_get_contents("php://input"), true);
$appointment_id = $data['appointment_id'] ?? null;

if (!$appointment_id) {
    echo json_encode(['status' => 'error', 'message' => 'Appointment ID required']);
    exit();
}

try {
    // Only Admin, Receptionist, or the assigned Doctor can delete?
    // For simplicity, let's allow staff and doctors.
    if (!in_array($user_role, ['doctor', 'admin', 'receptionist'])) {
        echo json_encode(['status' => 'error', 'message' => 'Access denied']);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM Appointments WHERE appointment_id = ?");
    $stmt->execute([$appointment_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Appointment deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Appointment not found']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
