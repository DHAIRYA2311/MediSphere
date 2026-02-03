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
$doctor_id = $data->doctor_id;

try {
    // Get user_id first
    $stmt = $pdo->prepare("SELECT user_id FROM Doctors WHERE doctor_id = ?");
    $stmt->execute([$doctor_id]);
    $user_id = $stmt->fetchColumn();

    if ($user_id) {
        // Set User status to Inactive instead of hard delete to preserve foreign key constraints with appointments etc.
        $stmt = $pdo->prepare("UPDATE Users SET status = 'Inactive' WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        echo json_encode(['status' => 'success', 'message' => 'Doctor deactivated successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Doctor not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Operation failed: ' . $e->getMessage()]);
}
?>
