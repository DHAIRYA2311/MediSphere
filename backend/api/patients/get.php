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

$user_id = $payload['id'];
$role = strtolower($payload['role']);

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    // If no ID provided, try to get current user's patient profile
    if ($role == 'patient') {
        $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $id = $stmt->fetchColumn();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Patient ID required']);
        exit();
    }
}

// Logic to check permissions? 
// Admin/Doctor can view any. Patient can only view own.
if ($role == 'patient') {
    $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $own_id = $stmt->fetchColumn();
    if ($own_id != $id) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Access denied']);
        exit();
    }
}

try {
    // 1. Core Profile Data
    $stmt = $pdo->prepare("
        SELECT 
            p.*, u.first_name, u.last_name, u.email, u.phone, u.gender, u.dob, u.address, u.created_at, u.status
        FROM Patients p
        JOIN Users u ON p.user_id = u.user_id
        WHERE p.patient_id = ?
    ");
    $stmt->execute([$id]);
    $patient = $stmt->fetch();

    if (!$patient) {
        echo json_encode(['status' => 'error', 'message' => 'Patient not found']);
        exit();
    }

    // 2. Admission Information
    $stmt = $pdo->prepare("
        SELECT ba.allocation_date, ba.release_date, b.bed_number, b.status as bed_status, w.ward_name
        FROM bed_allocations ba
        JOIN beds b ON ba.bed_id = b.bed_id
        JOIN wards w ON b.ward_id = w.ward_id
        WHERE ba.patient_id = ?
        ORDER BY ba.allocation_date DESC LIMIT 1
    ");
    $stmt->execute([$id]);
    $patient['admission'] = $stmt->fetch() ?: null;

    // 3. Appointments Summary
    $stmt = $pdo->prepare("SELECT * FROM appointments WHERE patient_id = ? ORDER BY appointment_date DESC, appointment_time DESC");
    $stmt->execute([$id]);
    $patient['appointments'] = $stmt->fetchAll();

    // 4. Billing Snapshot
    $stmt = $pdo->prepare("SELECT * FROM billing WHERE patient_id = ? ORDER BY payment_date DESC");
    $stmt->execute([$id]);
    $patient['billing'] = $stmt->fetchAll();

    // 5. Insurance Claims
    $stmt = $pdo->prepare("SELECT * FROM insurance_claims WHERE patient_id = ? ORDER BY processed_date DESC");
    $stmt->execute([$id]);
    $patient['insurance_claims'] = $stmt->fetchAll();

    // 6. Medical Reports
    $stmt = $pdo->prepare("SELECT * FROM reports WHERE patient_id = ? ORDER BY created_at DESC");
    $stmt->execute([$id]);
    $patient['reports'] = $stmt->fetchAll();

    // 7. Documents
    $stmt = $pdo->prepare("SELECT * FROM documents WHERE patient_id = ?");
    $stmt->execute([$id]);
    $patient['documents'] = $stmt->fetchAll();

    // 8. AI Predictions
    $stmt = $pdo->prepare("SELECT * FROM disease_predictions WHERE patient_id = ? ORDER BY created_at DESC");
    $stmt->execute([$id]);
    $patient['ai_predictions'] = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $patient]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Db error: ' . $e->getMessage()]);
}
?>
