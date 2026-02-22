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

if (!isset($data->bed_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Bed ID required']);
    exit();
}

try {
    $updates = [];
    $params = [];

    if (isset($data->bed_number)) {
        $updates[] = "bed_number = ?";
        $params[] = $data->bed_number;
    }
    if (isset($data->status)) {
        $updates[] = "status = ?";
        $params[] = $data->status;
    }

    if (empty($updates)) {
        echo json_encode(['status' => 'error', 'message' => 'No fields to update']);
        exit();
    }

    $params[] = $data->bed_id;
    $sql = "UPDATE Beds SET " . implode(", ", $updates) . " WHERE bed_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['status' => 'success', 'message' => 'Bed updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
