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

    $sent = false;
    $log_file = __DIR__ . "/../../../email_log.txt";

    // Try SMTP
    if (file_exists('../../config/email_config.php') && file_exists('../../utils/SimpleSMTP.php')) {
        include_once '../../config/email_config.php';
        include_once '../../utils/SimpleSMTP.php';

        if (defined('SMTP_USER') && SMTP_USER !== 'your_email@gmail.com') {
            try {
                $smtp = new SimpleSMTP();
                $smtp->connect(SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);
                
                $email_body = "
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                        <h2 style='color: #dc3545;'>Reset Your Password</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your Medisphere password. Click the button below to choose a new one:</p>
                        <div style='margin: 30px 0;'>
                            <a href='$reset_link' style='background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Reset Password</a>
                        </div>
                        <p style='color: #666; font-size: 14px;'>This link will expire in 30 minutes.</p>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='color: #999; font-size: 12px;'>If you did not request this, please ignore this email.</p>
                    </div>
                ";
                            
                $smtp->sendEmail($email, "Reset Your Password - Medisphere", $email_body, SMTP_FROM_EMAIL, SMTP_FROM_NAME);
                $sent = true;
            } catch (Exception $e) {
                @file_put_contents($log_file, "Reset SMTP Failed [$email]: " . $e->getMessage() . "\n", FILE_APPEND);
            }
        }
    }

    if (!$sent) {
        @file_put_contents($log_file, "Password Reset [$email]: $reset_link\n", FILE_APPEND);
    }

    echo json_encode([
        "success" => true,
        "message" => "If that email is registered, you will receive a reset link shortly."
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "An error occurred."]);
}
?>
