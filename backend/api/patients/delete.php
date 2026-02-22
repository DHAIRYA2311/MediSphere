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

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'Patient ID required']);
    exit();
}

try {
    $pdo->beginTransaction();

    // Get user_id first
    $stmt = $pdo->prepare("SELECT user_id FROM Patients WHERE patient_id = ?");
    $stmt->execute([$id]);
    $user_id = $stmt->fetchColumn();

    if (!$user_id) {
        throw new Exception("Patient not found");
    }

    // Delete related records (Appointments, etc. - in a real app we'd handle these or use soft delete)
    // For now, let's try to delete Patient and User
    
    $stmt = $pdo->prepare("DELETE FROM Patients WHERE patient_id = ?");
    $stmt->execute([$id]);

    $stmt = $pdo->prepare("DELETE FROM Users WHERE user_id = ?");
    $stmt->execute([$user_id]);

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Patient and user record deleted']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Delete failed: ' . $e->getMessage()]);
}
?>
