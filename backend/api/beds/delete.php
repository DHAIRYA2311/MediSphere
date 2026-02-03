<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload || strtolower($payload['role']) !== 'admin') {
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
    // Check if bed is occupied
    $stmt = $pdo->prepare("SELECT status FROM Beds WHERE bed_id = ?");
    $stmt->execute([$data->bed_id]);
    $status = $stmt->fetchColumn();

    if ($status === 'Occupied') {
        echo json_encode(['status' => 'error', 'message' => 'Cannot delete an occupied bed. Release or move patient first.']);
        exit();
    }

    // Attempt Delete
    // Note: This might fail if there are past allocations and no ON DELETE CASCADE.
    // If so, we might need to delete allocations first? Or just report error.
    // Ideally we shouldn't delete history. 
    // Let's check if allocations exist.
    $stmt = $pdo->prepare("SELECT count(*) FROM Bed_Allocations WHERE bed_id = ?");
    $stmt->execute([$data->bed_id]);
    $count = $stmt->fetchColumn();

    if ($count > 0) {
       // Ideally we soft delete, but for this request let's just delete allocations? 
       // No, that destroys medical history.
       // Let's just return error for now.
       echo json_encode(['status' => 'error', 'message' => 'Cannot delete bed with historical patient records.']);
       exit();
    }

    $stmt = $pdo->prepare("DELETE FROM Beds WHERE bed_id = ?");
    $stmt->execute([$data->bed_id]);

    echo json_encode(['status' => 'success', 'message' => 'Bed deleted successfully']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
