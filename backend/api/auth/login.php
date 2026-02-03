<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    $email = trim($data->email);
    $password = $data->password;

    // Join with Roles table to get the role name
    $stmt = $pdo->prepare("
        SELECT u.user_id, u.first_name, u.last_name, u.email, u.password, r.role_name 
        FROM Users u 
        JOIN Roles r ON u.role_id = r.role_id 
        WHERE u.email = ?
    ");
    $stmt->execute([$email]);

    if($stmt->rowCount() > 0) {
        $user = $stmt->fetch();
        if(password_verify($password, $user['password'])) {
            $payload = [
                'id' => $user['user_id'],
                'name' => $user['first_name'] . ' ' . $user['last_name'],
                'email' => $user['email'],
                'role' => strtolower($user['role_name']), // Frontend likely expects lowercase roles
                'iat' => time(),
                'exp' => time() + (60 * 60 * 24) // 24 hours expiration
            ];
            
            $token = JWT::encode($payload);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user['user_id'],
                    'name' => $user['first_name'] . ' ' . $user['last_name'],
                    'role' => strtolower($user['role_name'])
                ]
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Incomplete data']);
}
?>
