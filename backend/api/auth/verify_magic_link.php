<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Disable error reporting to output only clean JSON
error_reporting(0);
ini_set('display_errors', 0);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $raw_input = file_get_contents("php://input");
    $data = json_decode($raw_input);
    $token = $data->token ?? '';

    if (!$token) {
        echo json_encode(["success" => false, "message" => "Missing token"]);
        exit();
    }

    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        echo json_encode(["success" => false, "message" => "Invalid token format"]);
        exit();
    }

    list($payload_b64, $signature_provided) = $parts;
    $secret_key = "MEDISPHERE_SECRET_KEY";

    // Verify Signature
    $signature_calculated = hash_hmac('sha256', $payload_b64, $secret_key);

    if (!hash_equals($signature_calculated, $signature_provided)) {
        echo json_encode(["success" => false, "message" => "Invalid token signature"]);
        exit();
    }

    // Check Expiry
    $payload = json_decode(base64_decode($payload_b64), true);
    $now = time();
    if ($payload['exp'] < $now) {
        echo json_encode([
            "success" => false, 
            "message" => "Token expired. Created: " . ($payload['exp'] - 900) . ", Expires: " . $payload['exp'] . ", Now: " . $now
        ]);
        exit();
    }

    $email = $payload['email'];

    // --- AUTOLOGIN LOGIC ---
    // Use output buffering to catch any rogue output from db.php (like connection errors)
    ob_start();
    include_once '../../config/db.php';
    $rogue_output = ob_get_clean();

    // Use the $pdo object defined in config/db.php
    if (!isset($pdo)) {
        echo json_encode(["success" => false, "message" => "Database connection failed. " . strip_tags($rogue_output)]);
        exit();
    }
    $db = $pdo;

    // Find User by Email
    $query = "SELECT u.user_id, u.first_name, u.last_name, u.email, u.role_id, r.role_name 
              FROM Users u 
              JOIN Roles r ON u.role_id = r.role_id 
              WHERE u.email = :email LIMIT 1";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Generate REAL JWT Token
        require_once '../../utils/jwt.php';
        $payload = [
            'id' => $user['user_id'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['email'],
            'role' => strtolower($user['role_name']),
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24) // 24 hours
        ];
        $jwtToken = JWT::encode($payload);

        echo json_encode([
            "status" => "success",
            "message" => "Magic login successful",
            "user" => [
                "id" => $user['user_id'],
                "name" => $user['first_name'] . ' ' . $user['last_name'],
                "email" => $user['email'],
                "role" => strtolower($user['role_name'])
            ],
            "token" => $jwtToken
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "User not found. Please register first."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server Error: " . $e->getMessage()]);
}
?>
