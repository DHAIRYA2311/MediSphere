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

if (isset($data->patient_id) && isset($data->visitor_name) && isset($data->relation)) {
    $patient_id = $data->patient_id;
    $visitor_name = $data->visitor_name;
    $relation = $data->relation;
    $entry_time = date('Y-m-d H:i:s');
    // Using a far future date to represent "Currently Active/Not Checked Out"
    // This avoids 0000-00-00 issues in strict mode
    $exit_time = '2099-12-31 23:59:59'; 

    try {
        $stmt = $pdo->prepare("INSERT INTO Visitors (patient_id, visitor_name, relation, entry_time, exit_time) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$patient_id, $visitor_name, $relation, $entry_time, $exit_time]);

        echo json_encode(['status' => 'success', 'message' => 'Visitor checked in successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Check-in failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
}
?>
