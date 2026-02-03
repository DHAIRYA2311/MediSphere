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

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->patient_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Patient ID required']);
    exit();
}

// TODO: permission checks (Doctor/Admin can update medical info, Patient can update personal info?)
// For now, allow basic updates

try {
    // Update Patients table
    $stmt = $pdo->prepare("UPDATE Patients SET blood_group=?, emergency_contact=?, insurance_number=?, medical_history=? WHERE patient_id=?");
    $stmt->execute([
        $data->blood_group ?? '',
        $data->emergency_contact ?? '',
        $data->insurance_number ?? '',
        $data->medical_history ?? '',
        $data->patient_id
    ]);

    // Optionally update Users table (phone, address)
    if (isset($data->phone) || isset($data->address)) {
        // Need to get user_id first
        $stmt = $pdo->prepare("SELECT user_id FROM Patients WHERE patient_id = ?");
        $stmt->execute([$data->patient_id]);
        $uid = $stmt->fetchColumn();

        if ($uid) {
             $stmt = $pdo->prepare("UPDATE Users SET phone=?, address=? WHERE user_id=?");
             $stmt->execute([$data->phone, $data->address, $uid]);
        }
    }

    echo json_encode(['status' => 'success', 'message' => 'Patient details updated']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $e->getMessage()]);
}
?>
