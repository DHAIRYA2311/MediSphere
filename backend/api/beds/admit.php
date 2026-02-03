<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

$data = json_decode(file_get_contents("php://input"), true);
$patient_id = $data['patient_id'];
$bed_id = $data['bed_id'];
$appointment_id = $data['appointment_id'] ?? null;

if (!$patient_id || !$bed_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing Data']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Mark Bed as Occupied
    $stmt = $pdo->prepare("UPDATE Beds SET status = 'Occupied' WHERE bed_id = ?");
    $stmt->execute([$bed_id]);

    // 2. Allocating Bed (Setting release date to 7 days from now as placeholder/estimated)
    $release_date = date('Y-m-d', strtotime('+7 days'));
    $stmt = $pdo->prepare("INSERT INTO Bed_Allocations (bed_id, patient_id, allocation_date, release_date) VALUES (?, ?, CURDATE(), ?)");
    $stmt->execute([$bed_id, $patient_id, $release_date]);

    // 3. Mark Appointment Completed (if linked)
    if ($appointment_id) {
        $stmt = $pdo->prepare("UPDATE Appointments SET status = 'Completed', notes = CONCAT(notes, ' - Admitted to Ward') WHERE appointment_id = ?");
        $stmt->execute([$appointment_id]);
    }

    // 4. Create Admission Bill
    $stmt = $pdo->prepare("INSERT INTO Billing (patient_id, appointment_id, total_amount, paid_amount, payment_status, payment_date) VALUES (?, ?, 500.00, 0, 'Pending', CURDATE())");
    $stmt->execute([$patient_id, $appointment_id]);

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Patient admitted successfully']);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
