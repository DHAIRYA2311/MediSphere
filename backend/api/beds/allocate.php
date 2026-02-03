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

$role = strtolower($payload['role']);
if (!in_array($role, ['admin', 'staff', 'receptionist'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->bed_id) || !isset($data->patient_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Update Bed status
    $stmt = $pdo->prepare("UPDATE Beds SET status = 'Occupied' WHERE bed_id = ? AND status = 'Free'");
    $stmt->execute([$data->bed_id]);
    
    if ($stmt->rowCount() == 0) {
        throw new Exception("Bed is not available");
    }

    // 2. Create Allocation
    // release_date is NOT NULL, so we use a dummy future date to signify 'active'
    $future_date = '2099-12-31'; 
    $stmt = $pdo->prepare("INSERT INTO Bed_Allocations (bed_id, patient_id, allocation_date, release_date) VALUES (?, ?, CURDATE(), ?)");
    $stmt->execute([$data->bed_id, $data->patient_id, $future_date]);

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Bed allocated successfully']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
