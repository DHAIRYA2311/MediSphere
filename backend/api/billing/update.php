<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload || !in_array(strtolower($payload['role']), ['admin', 'staff', 'receptionist'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->bill_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing Bill ID']);
    exit();
}

try {
    // We update the amount and status. 
    // If it's a "Void", the frontend will sent amount 0.
    $stmt = $pdo->prepare("UPDATE Billing SET total_amount = ?, paid_amount = ?, payment_status = ? WHERE bill_id = ?");
    $stmt->execute([
        $data->total_amount,
        $data->paid_amount ?? 0,
        $data->payment_status ?? 'Pending',
        $data->bill_id
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Record updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
