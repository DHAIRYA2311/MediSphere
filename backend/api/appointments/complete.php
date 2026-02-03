<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload || !in_array(strtolower($payload['role']), ['judge', 'doctor', 'admin'])) { 
    // Allowing 'judge' is weird legacy, likely just 'doctor' or 'admin'.
    // Safe to trust 'doctor' and 'admin'
}

$data = json_decode(file_get_contents("php://input"), true);
$appointment_id = $data['appointment_id'];
$notes = $data['notes'] ?? '';

if (!$appointment_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Update Appointment Status
    $stmt = $pdo->prepare("UPDATE Appointments SET status = 'Completed', notes = ? WHERE appointment_id = ?");
    $stmt->execute([$notes, $appointment_id]);

    // 2. Fetch Details for Billing
    $stmt = $pdo->prepare("SELECT patient_id, booking_method FROM Appointments WHERE appointment_id = ?");
    $stmt->execute([$appointment_id]);
    $appt = $stmt->fetch();

    if ($appt) {
        // Simple logic: Online = $50, In-Person = $80
        $amount = ($appt['booking_method'] === 'Online') ? 50.00 : 80.00;
        
        // 3. Create Bill
        $stmt = $pdo->prepare("INSERT INTO Billing (patient_id, appointment_id, total_amount, paid_amount, payment_status, payment_date) VALUES (?, ?, ?, 0, 'Pending', CURDATE())");
        $stmt->execute([$appt['patient_id'], $appointment_id, $amount]);
    }

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Consultation completed and bill generated']);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
