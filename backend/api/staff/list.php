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

try {
    $stmt = $pdo->prepare("
        SELECT 
            s.staff_id, 
            s.designation, 
            s.shift, 
            u.user_id,
            u.first_name, 
            u.last_name, 
            u.email, 
            u.phone, 
            u.status
        FROM Staff s
        JOIN Users u ON s.user_id = u.user_id
        ORDER BY u.first_name ASC
    ");
    $stmt->execute();
    $staff = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $staff]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed: ' . $e->getMessage()]);
}
?>
