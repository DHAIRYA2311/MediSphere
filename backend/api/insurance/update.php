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

if (isset($data->claim_id) && isset($data->status)) {
    $claim_id = $data->claim_id;
    $status = $data->status; // Approved or Pending (as per current enum)
    
    try {
        $pdo->beginTransaction();

        // 1. Fetch Claim and associated Bill
        $stmt = $pdo->prepare("SELECT ic.*, b.total_amount, b.paid_amount as current_paid FROM Insurance_Claims ic JOIN Billing b ON ic.billing_id = b.bill_id WHERE ic.claim_id = ?");
        $stmt->execute([$claim_id]);
        $claim = $stmt->fetch();

        if (!$claim) {
            throw new Exception("Claim or linked Bill not found.");
        }

        // 2. Prevent re-processing if already Approved
        if ($claim['claim_status'] === 'Approved' && $status === 'Approved') {
            throw new Exception("This claim is already approved.");
        }

        // 3. Update Claim Status
        $stmt = $pdo->prepare("UPDATE Insurance_Claims SET claim_status = ?, processed_date = CURDATE() WHERE claim_id = ?");
        $stmt->execute([$status, $claim_id]);

        // 4. Update Billing if Approved
        if ($status === 'Approved') {
            $approved_amount = $claim['claim_amount'];
            $new_paid_amount = $claim['current_paid'] + $approved_amount;
            
            // Determine new payment status
            $payment_status = ($new_paid_amount >= $claim['total_amount']) ? 'Paid' : 'Partial';
            
            $stmt = $pdo->prepare("UPDATE Billing SET paid_amount = ?, payment_status = ?, payment_date = CURDATE() WHERE bill_id = ?");
            $stmt->execute([$new_paid_amount, $payment_status, $claim['billing_id']]);
        }

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Claim processed and Billing updated.']);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID or Status']);
}
?>
