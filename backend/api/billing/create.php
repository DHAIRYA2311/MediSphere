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

$role = strtolower($payload['role']);

// Patients and Doctors cannot create bills
if (in_array($role, ['patient', 'doctor'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->patient_id) || !isset($data->total_amount)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit();
}

try {
    // If bill_id exists, update? Or just create new. Let's assume create for now or handle update if needed.
    // For simplicity: Create.
    
    $stmt = $pdo->prepare("INSERT INTO Billing (patient_id, appointment_id, total_amount, paid_amount, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data->patient_id,
        $data->appointment_id ?? null, // Optional
        $data->total_amount,
        $data->paid_amount ?? 0,
        $data->payment_status ?? 'Pending',
        $data->payment_date ?? date('Y-m-d')
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Bill created successfully']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}
?>
