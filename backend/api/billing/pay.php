<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

$data = json_decode(file_get_contents("php://input"));

if (!$data->bill_id) {
    http_response_code(400);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE Billing SET payment_status = 'Paid', paid_amount = total_amount WHERE bill_id = ?");
    $stmt->execute([$data->bill_id]);

    echo json_encode(['status' => 'success', 'message' => 'Payment Successful']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
