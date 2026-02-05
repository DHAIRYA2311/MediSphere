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

// Only Admin, Doctor, Receptionist, Staff, and Patient can upload
$role = strtolower($payload['role']);
if (!in_array($role, ['admin', 'doctor', 'receptionist', 'staff', 'patient'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

// Use absolute-like path relative to the script
$target_dir = __DIR__ . "/../../uploads/reports/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $patient_id = $_POST['patient_id'] ?? null;
    $doctor_id = $_POST['doctor_id'] ?? null;
    $report_type = $_POST['report_type'] ?? 'General';

    // If patient, FORCE patient_id to be their own
    if ($role === 'patient') {
        $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt->execute([$payload['id']]);
        $found_patient_id = $stmt->fetchColumn();
        
        if (!$found_patient_id) {
            echo json_encode(['status' => 'error', 'message' => 'Patient record not found. Please complete your profile.']);
            exit();
        }
        $patient_id = $found_patient_id;
    }
    
    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'Valid Patient ID is required']);
        exit();
    }

    // File upload
    if (isset($_FILES['report_file']) && $_FILES['report_file']['error'] == 0) {
        $file_original_name = basename($_FILES['report_file']['name']);
        $file_ext = strtolower(pathinfo($file_original_name, PATHINFO_EXTENSION));
        
        // Allowed formats
        $allowed_types = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        if (!in_array($file_ext, $allowed_types)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Allowed: PDF, JPG, PNG, DOC']);
            exit();
        }

        $file_name = "report_" . time() . "_" . rand(1000, 9999) . "." . $file_ext;
        $target_file = $target_dir . $file_name;

        if (move_uploaded_file($_FILES['report_file']['tmp_name'], $target_file)) {
            // Store path relative to backend root for easy access
            $db_file_path = "uploads/reports/" . $file_name;
            
            try {
                $sql = "INSERT INTO Reports (patient_id, doctor_id, report_type, report_file, created_at) VALUES (?, ?, ?, ?, CURRENT_DATE)";
                $stmt = $pdo->prepare($sql);
                // Use NULL if doctor_id is empty
                $final_doctor_id = !empty($doctor_id) ? $doctor_id : null;
                $stmt->execute([$patient_id, $final_doctor_id, $report_type, $db_file_path]);
                
                echo json_encode(['status' => 'success', 'message' => 'Report uploaded and saved successfully']);
            } catch (PDOException $e) {
                // Cleanup file if DB insert fails
                @unlink($target_file);
                echo json_encode(['status' => 'error', 'message' => 'DB Error: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file to destination']);
        }
    } else {
        $err = $_FILES['report_file']['error'] ?? 'No file';
        echo json_encode(['status' => 'error', 'message' => 'File selection is required. Error code: ' . $err]);
    }
}
?>
