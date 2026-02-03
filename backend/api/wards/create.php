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
if ($role !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->ward_name) || !isset($data->capacity)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO Wards (ward_name, capacity) VALUES (?, ?)");
    $stmt->execute([$data->ward_name, $data->capacity]);
    echo json_encode(['status' => 'success', 'message' => 'Ward created successfully']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
