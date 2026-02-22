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
if (!in_array($role, ['admin', 'staff', 'receptionist'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->patient_id) || !isset($data->amount) || !isset($data->type)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Get current IPD bill (appointment_id is NULL and payment_date is '2099-12-31')
    $stmt = $pdo->prepare("SELECT bill_id, total_amount, paid_amount FROM Billing WHERE patient_id = ? AND appointment_id IS NULL AND payment_date = '2099-12-31' LIMIT 1");
    $stmt->execute([$data->patient_id]);
    $bill = $stmt->fetch();

    if (!$bill) {
        // Create it if it doesn't exist (for older admissions)
        $stmt = $pdo->prepare("INSERT INTO Billing (patient_id, appointment_id, total_amount, paid_amount, payment_status, payment_date) VALUES (?, NULL, 0, 0, 'Pending', '2099-12-31')");
        $stmt->execute([$data->patient_id]);
        $bill_id = $pdo->lastInsertId();
        $bill = ['bill_id' => $bill_id, 'total_amount' => 0, 'paid_amount' => 0];
    }

    $new_total = (float)$bill['total_amount'];
    $new_paid = (float)$bill['paid_amount'];

    if ($data->type === 'charge') {
        $new_total += (float)$data->amount;
    } elseif ($data->type === 'deposit') {
        $new_paid += (float)$data->amount;
    }

    // 2. Calculate Status
    $status = 'Pending';
    if ($new_paid > 0) {
        if ($new_paid < $new_total) {
            $status = 'Partial';
        } else {
            $status = 'Paid';
        }
    }

    // 3. Update
    $stmt = $pdo->prepare("UPDATE Billing SET total_amount = ?, paid_amount = ?, payment_status = ? WHERE bill_id = ?");
    $stmt->execute([$new_total, $new_paid, $status, $bill['bill_id']]);

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Running bill updated']);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
