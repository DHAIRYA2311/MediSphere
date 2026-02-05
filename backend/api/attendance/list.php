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

$role = strtolower($payload['role']);
if (!in_array($role, ['admin', 'receptionist', 'staff', 'doctor'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

try {
    // Select logs joined with User/Staff info
    $sql = "SELECT 
                a.attendance_id,
                a.date,
                a.check_in_time,
                a.check_out_time,
                a.method,
                u.first_name,
                u.last_name,
                u.email,
                s.designation
            FROM attendance a
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN staff s ON u.user_id = s.user_id
            ORDER BY a.date DESC, a.check_in_time DESC";
            
    $stmt = $pdo->query($sql);
    $logs = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $logs]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch logs: ' . $e->getMessage()]);
}
?>
