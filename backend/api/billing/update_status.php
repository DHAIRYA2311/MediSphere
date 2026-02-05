<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload || !in_array(strtolower($payload['role']), ['admin', 'receptionist', 'staff'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized Access']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->bill_id) || !isset($data->status)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit();
}

try {
    $bill_id = $data->bill_id;
    $status = $data->status;
    $paid_amount = $data->paid_amount ?? null;

    if ($status === 'Paid') {
        // If marking as paid, ensure paid_amount matches total or is provided
        if ($paid_amount === null) {
            $stmt = $pdo->prepare("UPDATE Billing SET payment_status = 'Paid', paid_amount = total_amount WHERE bill_id = ?");
            $stmt->execute([$bill_id]);
        } else {
            $stmt = $pdo->prepare("UPDATE Billing SET payment_status = 'Paid', paid_amount = ? WHERE bill_id = ?");
            $stmt->execute([$paid_amount, $bill_id]);
        }
    } else {
        $stmt = $pdo->prepare("UPDATE Billing SET payment_status = ? WHERE bill_id = ?");
        $stmt->execute([$status, $bill_id]);
    }

    echo json_encode(['status' => 'success', 'message' => 'Bill status updated successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
