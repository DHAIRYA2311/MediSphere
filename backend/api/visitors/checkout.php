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

$data = json_decode(file_get_contents("php://input"));

if (isset($data->visitor_id)) {
    $visitor_id = $data->visitor_id;
    $exit_time = date('Y-m-d H:i:s');

    try {
        $stmt = $pdo->prepare("UPDATE Visitors SET exit_time = ? WHERE visitor_id = ?");
        $stmt->execute([$exit_time, $visitor_id]);

        echo json_encode(['status' => 'success', 'message' => 'Visitor checked out successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Check-out failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
}
?>
