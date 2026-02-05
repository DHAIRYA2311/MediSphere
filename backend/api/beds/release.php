<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload) {
    http_response_code(401);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$bed_id = $data['bed_id'] ?? null;
$patient_id = $data['patient_id'] ?? null;
$total_amount = $data['total_amount'] ?? 0;

if (!$bed_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing Bed ID']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Update Bed Status to Free
    $stmt = $pdo->prepare("UPDATE Beds SET status = 'Free' WHERE bed_id = ?");
    $stmt->execute([$bed_id]);

    // 2. Update Allocation Record
    $stmt = $pdo->prepare("UPDATE Bed_Allocations SET release_date = CURDATE() WHERE bed_id = ? AND release_date = '2099-12-31'");
    $stmt->execute([$bed_id]);

    // 3. Create Final Billing Entry (Initial status: Pending)
    if ($patient_id && $total_amount > 0) {
        $stmt = $pdo->prepare("INSERT INTO Billing (patient_id, total_amount, paid_amount, payment_status, payment_date) VALUES (?, ?, ?, 'Pending', CURDATE())");
        $stmt->execute([$patient_id, $total_amount, 0]);
        $billing_id = $pdo->lastInsertId();
    }

    $pdo->commit();
    echo json_encode([
        'status' => 'success', 
        'message' => 'Patient discharged. Final bill generated (Pending).',
        'bill_id' => $billing_id ?? null
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
