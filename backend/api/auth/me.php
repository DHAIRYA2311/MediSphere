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
    $payload_json = json_encode($payload);
    $user_id = $payload['id'];
    // error_log("Requesting profile for user_id: " . $user_id);
    
    // Simplified query for debugging
    $stmt = $pdo->prepare("
        SELECT 
            u.*, 
            r.role_name
        FROM Users u 
        JOIN Roles r ON u.role_id = r.role_id 
        WHERE u.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if ($user) {
        if (strtolower($user['role_name']) === 'staff') {
            $stmt_staff = $pdo->prepare("SELECT designation, shift, staff_id FROM Staff WHERE user_id = ?");
            $stmt_staff->execute([$user_id]);
            $staff = $stmt_staff->fetch();
            if ($staff) {
                $user = array_merge($user, $staff);
            }
        }
        echo json_encode(['status' => 'success', 'data' => $user]);
    } else {
        echo json_encode(['status' => 'error', 'message' => "User not found (ID: $user_id)"]);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
