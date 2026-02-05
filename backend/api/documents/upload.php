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
$appointment_id = $_POST['appointment_id'] ?? null;

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
    $db_path = "uploads/documents/" . $new_filename;
    
    try {
        // --- 1. HANDLE UNIQUE PRESCRIPTION LOGIC ---
        // We use appointment_id if provided. If DB column doesn't exist, we search by naming convention.
        $existing_id = null;
        
        // Try searching by appointment_id column first
        try {
            $check = $pdo->prepare("SELECT document_id, file_path FROM Documents WHERE patient_id = ? AND type = 'Prescription' AND appointment_id = ?");
            $check->execute([$patient_id, $appointment_id]);
            $existing = $check->fetch();
            if ($existing) $existing_id = $existing['document_id'];
        } catch (PDOException $e) {
            // FALLBACK: If column doesn't exist, search for app_id in the file_path string
            if ($type === 'Prescription' && $appointment_id) {
                $pattern = "%_" . $appointment_id . "_prescription.%"; // Matches naming convention in WalkIn/Consultation
                $check = $pdo->prepare("SELECT document_id, file_path FROM Documents WHERE patient_id = ? AND type = 'Prescription' AND file_path LIKE ?");
                $check->execute([$patient_id, $pattern]);
                $existing = $check->fetch();
                if ($existing) $existing_id = $existing['document_id'];
            }
        }

        if ($existing_id) {
            // We found an old one! Replace it.
            $stmt = $pdo->prepare("SELECT file_path FROM Documents WHERE document_id = ?");
            $stmt->execute([$existing_id]);
            $old_path = $stmt->fetchColumn();
            if ($old_path && file_exists("../../" . $old_path)) unlink("../../" . $old_path);

            $update = $pdo->prepare("UPDATE Documents SET file_path = ? WHERE document_id = ?");
            $update->execute([$db_path, $existing_id]);
            echo json_encode(['status' => 'success', 'message' => 'Document updated successfully', 'path' => $db_path]);
            exit();
        }

        // --- 2. INSERT NEW RECORD ---
        try {
            $stmt = $pdo->prepare("INSERT INTO Documents (patient_id, type, file_path, appointment_id) VALUES (?, ?, ?, ?)");
            $stmt->execute([$patient_id, $type, $db_path, $appointment_id]);
        } catch (PDOException $e) {
            // Fallback for old schema (no appointment_id column)
            $stmt = $pdo->prepare("INSERT INTO Documents (patient_id, type, file_path) VALUES (?, ?, ?)");
            $stmt->execute([$patient_id, $type, $db_path]);
        }
        
        echo json_encode(['status' => 'success', 'message' => 'File uploaded successfully', 'path' => $db_path]);
    } catch (PDOException $e) {
        if (file_exists($target_file)) unlink($target_file); 
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to upload file']);
}
?>
