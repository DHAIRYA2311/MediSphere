<?php
// DISABLE ERROR REPORTING (To prevent JSON corruption)
error_reporting(0);
ini_set('display_errors', 0);

// CORS HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Get Input
    $data = json_decode(file_get_contents("php://input"));
    $email = $data->email ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format"]);
        exit();
    }

    // Generate Token
    $secret_key = "MEDISPHERE_SECRET_KEY";
    $timestamp = time();
    $payload = base64_encode(json_encode(["email" => $email, "exp" => $timestamp + 900])); // 15 min expiry
    $signature = hash_hmac('sha256', $payload, $secret_key);
    $token = "$payload.$signature";
    
    // Explicit port 3000 for frontend link (assuming React runs on 3000)
    $magic_link = "http://127.0.0.1:3000/magic-login?token=" . $token;

    // --- SYNCHRONOUS EMAIL LOGIC ---
    $log_file = __DIR__ . "/../../../email_log.txt";
    $debug_msg = "";
    $sent = false;

    // Try Real Email
    if (file_exists('../../config/email_config.php') && file_exists('../../utils/SimpleSMTP.php')) {
        include_once '../../config/email_config.php';
        include_once '../../utils/SimpleSMTP.php';

        if (defined('SMTP_USER') && SMTP_USER !== 'your_email@gmail.com') {
            try {
                $smtp = new SimpleSMTP();
                // 5-10s timeout is fine for a login action
                $smtp->connect(SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);
                
                $email_body = "
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                        <h2 style='color: #0d6efd;'>Sign in to Medisphere</h2>
                        <p>Hello,</p>
                        <p>We received a request to sign in to your Medisphere account using a magic link.</p>
                        <div style='margin: 30px 0;'>
                            <a href='$magic_link' style='background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Sign In Now</a>
                        </div>
                        <p style='color: #666; font-size: 14px;'>Or copy and paste this link into your browser:</p>
                        <p style='background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #555;'>$magic_link</p>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='color: #999; font-size: 12px;'>If you did not request this link, you can safely ignore this email.</p>
                    </div>
                ";
                            
                $smtp->sendEmail($email, "Sign in to Medisphere", $email_body, SMTP_FROM_EMAIL, SMTP_FROM_NAME);
                $sent = true;
                $debug_msg = "Sent via SMTP";
            } catch (Exception $e) {
                // Log failure but don't fail the request to UI
                $debug_msg = "SMTP Error: " . $e->getMessage();
                @file_put_contents($log_file, "SMTP Failed [$email]: " . $e->getMessage() . "\n", FILE_APPEND);
            }
        }
    }

    // Fallback Logging
    if (!$sent) {
        $debug_msg .= " (Logged to file)";
        @file_put_contents($log_file, "Magic Link [$email]: $magic_link\n", FILE_APPEND);
    }

    echo json_encode([
        "success" => true,
        "message" => "Magic link sent! Check your inbox.",
        "debug_info" => $debug_msg,
        "debug_link" => $magic_link // We can leave this for dev convenience or remove for prod
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
?>
