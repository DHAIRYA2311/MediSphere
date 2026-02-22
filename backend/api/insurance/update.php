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
            // Rule 4: Update billing paid_amount = total_amount, Set payment_status = Paid
            $stmt = $pdo->prepare("UPDATE Billing SET paid_amount = total_amount, payment_status = 'Paid', payment_date = CURDATE() WHERE bill_id = ?");
            $stmt->execute([$claim['billing_id']]);
        }

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Claim processed and Billing updated.']);

        // 📧 NEW: Send Insurance Notification
        try {
            require_once '../../utils/NotificationService.php';
            // Get Patient Data
            $stmt_pat = $pdo->prepare("SELECT u.user_id, u.email, u.first_name, u.last_name FROM Insurance_Claims ic JOIN Patients p ON ic.patient_id = p.patient_id JOIN Users u ON p.user_id = u.user_id WHERE ic.claim_id = ?");
            $stmt_pat->execute([$claim_id]);
            $pat = $stmt_pat->fetch();
            if ($pat) {
                $pName = $pat['first_name'] . ' ' . $pat['last_name'];
                NotificationService::sendInsuranceUpdate($pat['email'], $pat['user_id'], $pName, $status, $claim_id);
            }
        } catch (Exception $e_mail) {}

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID or Status']);
}
?>
