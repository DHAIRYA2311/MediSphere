<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload || !in_array(strtolower($payload['role']), ['admin', 'staff'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->bed_id) || !isset($data->bed_number)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE Beds SET bed_number = ? WHERE bed_id = ?");
    $stmt->execute([$data->bed_number, $data->bed_id]);

    echo json_encode(['status' => 'success', 'message' => 'Bed updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
