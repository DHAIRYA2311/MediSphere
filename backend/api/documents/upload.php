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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit();
}

$patient_id = $_POST['patient_id'] ?? '';
$type = $_POST['type'] ?? '';

if (empty($patient_id) || empty($type) || !isset($_FILES['file'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing data or file']);
    exit();
}

$target_dir = "../../uploads/documents/";
if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);

$file_ext = strtolower(pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION));
// Sanitize filename: timestamp_patientID_type.ext
$safe_type = preg_replace('/[^a-z0-9]+/', '-', strtolower($type));
$new_filename = time() . "_" . $patient_id . "_" . $safe_type . "." . $file_ext;
$target_file = $target_dir . $new_filename;

if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    // Save to DB
    // Store relative path or full URL. Usually relative to backend root.
    $db_path = "uploads/documents/" . $new_filename;
    
    try {
        $stmt = $pdo->prepare("INSERT INTO Documents (patient_id, type, file_path) VALUES (?, ?, ?)");
        $stmt->execute([$patient_id, $type, $db_path]);
        
        echo json_encode(['status' => 'success', 'message' => 'File uploaded successfully']);
    } catch (PDOException $e) {
        unlink($target_file); // Delete file if DB insert fails
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to upload file']);
}
?>
