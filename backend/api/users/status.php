<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload || strtolower($payload['role']) != 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->status)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing parameters']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE Users SET status = ? WHERE user_id = ?");
    $stmt->execute([$data->status, $data->user_id]);

    echo json_encode(['status' => 'success', 'message' => 'User status updated']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $e->getMessage()]);
}
?>
