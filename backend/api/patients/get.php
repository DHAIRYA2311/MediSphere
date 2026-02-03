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

$user_id = $payload['id'];
$role = strtolower($payload['role']);

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    // If no ID provided, try to get current user's patient profile
    if ($role == 'patient') {
        $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $id = $stmt->fetchColumn();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Patient ID required']);
        exit();
    }
}

// Logic to check permissions? 
// Admin/Doctor can view any. Patient can only view own.
if ($role == 'patient') {
    $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $own_id = $stmt->fetchColumn();
    if ($own_id != $id) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Access denied']);
        exit();
    }
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            p.*, 
            u.first_name, 
            u.last_name, 
            u.email, 
            u.phone, 
            u.gender, 
            u.dob,
            u.address
        FROM Patients p
        JOIN Users u ON p.user_id = u.user_id
        WHERE p.patient_id = ?
    ");
    $stmt->execute([$id]);
    $patient = $stmt->fetch();

    if ($patient) {
        echo json_encode(['status' => 'success', 'data' => $patient]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Patient not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Db error: ' . $e->getMessage()]);
}
?>
