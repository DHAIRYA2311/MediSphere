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

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'Doctor ID required']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            d.*, 
            u.first_name, 
            u.last_name, 
            u.email, 
            u.phone, 
            u.gender, 
            u.dob,
            u.address,
            u.status as user_status
        FROM Doctors d
        JOIN Users u ON d.user_id = u.user_id
        WHERE d.doctor_id = ?
    ");
    $stmt->execute([$id]);
    $doctor = $stmt->fetch();

    if ($doctor) {
        echo json_encode(['status' => 'success', 'data' => $doctor]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Doctor not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Db error: ' . $e->getMessage()]);
}
?>
