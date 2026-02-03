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

try {
    $stmt = $pdo->prepare("
        SELECT 
            u.user_id, 
            u.first_name, 
            u.last_name, 
            u.email, 
            u.phone, 
            u.gender, 
            u.created_at, 
            u.status,
            r.role_name
        FROM Users u
        LEFT JOIN Roles r ON u.role_id = r.role_id
        ORDER BY u.created_at DESC
    ");
    $stmt->execute();
    $users = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $users]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch users: ' . $e->getMessage()]);
}
?>
