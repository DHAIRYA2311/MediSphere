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

$target_dir = "../../uploads/reports/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $patient_id = $_POST['patient_id'] ?? null;
    $doctor_id = $_POST['doctor_id'] ?? null;
    $report_type = $_POST['report_type'] ?? '';

    // If patient, FORCE patient_id to be their own
    if ($role === 'patient') {
        $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt->execute([$payload['id']]);
        $found_patient_id = $stmt->fetchColumn();
        
        if (!$found_patient_id) {
            echo json_encode(['status' => 'error', 'message' => 'Patient record not found for this user']);
            exit();
        }
        $patient_id = $found_patient_id;
    }
    
    // File upload
    if (isset($_FILES['report_file']) && $_FILES['report_file']['error'] == 0) {
        $file_name = time() . '_' . basename($_FILES['report_file']['name']);
        $target_file = $target_dir . $file_name;
        $file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
        
        // Allow certain file formats
        $allowed_types = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        if (!in_array($file_type, $allowed_types)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Allowed: PDF, JPG, PNG, DOC']);
            exit();
        }

        if (move_uploaded_file($_FILES['report_file']['tmp_name'], $target_file)) {
            // Save to DB
            // Store relative path or just filename. Storing relative path is usually easier for frontend retention.
            // But here we need to be careful with serving. 
            // Let's store "uploads/reports/$file_name"
            $db_file_path = "uploads/reports/" . $file_name;
            
            try {
                $sql = "INSERT INTO Reports (patient_id, doctor_id, report_type, report_file, created_at) VALUES (?, ?, ?, ?, CURRENT_DATE)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$patient_id, $doctor_id, $report_type, $db_file_path]);
                
                echo json_encode(['status' => 'success', 'message' => 'Report uploaded successfully']);
            } catch (PDOException $e) {
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No file uploaded or upload error']);
    }
}
?>
