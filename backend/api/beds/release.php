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

if (!isset($data->bed_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing Bed ID']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Update Bed Status to Free
    $stmt = $pdo->prepare("UPDATE Beds SET status = 'Free' WHERE bed_id = ?");
    $stmt->execute([$data->bed_id]);

    // 2. Update Allocation Record to set real release date
    // We find the 'active' one (where release_date is the dummy future date)
    $stmt = $pdo->prepare("UPDATE Bed_Allocations SET release_date = CURDATE() WHERE bed_id = ? AND release_date = '2099-12-31'");
    $stmt->execute([$data->bed_id]);

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Bed released successfully']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
