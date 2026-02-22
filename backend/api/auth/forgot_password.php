<?php
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../config/cors.php';
require_once '../../config/db.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    $email = $data->email ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format"]);
        exit();
    }

    // Check if user exists
    $stmt = $pdo->prepare("SELECT user_id FROM Users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() === 0) {
        // We return success anyway for security (don't reveal if email exists)
        echo json_encode(["success" => true, "message" => "If that email is registered, you will receive a reset link shortly."]);
        exit();
    }

    // Generate Stateless Token
    $secret_key = "MEDISPHERE_PASSWORD_RESET_KEY";
    $timestamp = time();
    $payload = base64_encode(json_encode(["email" => $email, "exp" => $timestamp + 1800])); // 30 min expiry
    $signature = hash_hmac('sha256', $payload, $secret_key);
    $token = "$payload.$signature";
    
    $reset_link = "http://127.0.0.1:3000/reset-password?token=" . $token;

    // Use Centralized Mailer
    require_once '../../utils/Mailer.php';
    
    $email_body = "
        <p>Hello,</p>
        <p>We received a request to reset your Medisphere password. Click the button below to choose a new one:</p>
        <div style='margin: 30px 0;'>
            <a href='$reset_link' style='background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Reset Password</a>
        </div>
        <p style='color: #666; font-size: 14px;'>This link will expire in 30 minutes.</p>
    ";
                
    $sent = Mailer::send($email, "Reset Your Password - Medisphere", $email_body);

    echo json_encode([
        "success" => true,
        "message" => "If that email is registered, you will receive a reset link shortly."
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "An error occurred."]);
}
?>
