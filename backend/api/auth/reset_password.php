<?php
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../config/cors.php';
require_once '../../config/db.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    $token = $data->token ?? '';
    $new_password = $data->password ?? '';

    if (!$token || !$new_password) {
        echo json_encode(["success" => false, "message" => "Missing token or password"]);
        exit();
    }

    // Verify Token
    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        echo json_encode(["success" => false, "message" => "Invalid token format"]);
        exit();
    }

    list($payload_base64, $signature) = $parts;
    $secret_key = "MEDISPHERE_PASSWORD_RESET_KEY";
    
    // Check Signature
    $expected_signature = hash_hmac('sha256', $payload_base64, $secret_key);
    if ($signature !== $expected_signature) {
        echo json_encode(["success" => false, "message" => "Invalid or tampered token"]);
        exit();
    }

    $payload = json_decode(base64_decode($payload_base64), true);
    if (!$payload || !isset($payload['email']) || !isset($payload['exp'])) {
        echo json_encode(["success" => false, "message" => "Invalid token payload"]);
        exit();
    }

    // Check Expiry
    if (time() > $payload['exp']) {
        echo json_encode(["success" => false, "message" => "Token has expired. Please request a new one."]);
        exit();
    }

    $email = $payload['email'];
    $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);

    // Update Password
    $stmt = $pdo->prepare("UPDATE Users SET password = ? WHERE email = ?");
    $result = $stmt->execute([$hashed_password, $email]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Password updated successfully! You can now log in."]);
    } else {
        echo json_encode(["success" => false, "message" => "Could not update password. User may no longer exist."]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
?>
