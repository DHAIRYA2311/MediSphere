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
if (!in_array($role, ['admin', 'receptionist'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied. Only Reception/Admin can discharge patients.']);
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

    // 3. Finalize Running IPD Bill
    if ($patient_id) {
        // Find existing IPD bill
        $stmt = $pdo->prepare("SELECT bill_id, paid_amount FROM Billing WHERE patient_id = ? AND appointment_id IS NULL AND payment_date = '2099-12-31' LIMIT 1");
        $stmt->execute([$patient_id]);
        $bill = $stmt->fetch();

        if ($bill) {
            $status = ($bill['paid_amount'] >= $total_amount) ? 'Paid' : (($bill['paid_amount'] > 0) ? 'Partial' : 'Pending');
            
            $stmt = $pdo->prepare("UPDATE Billing SET total_amount = ?, payment_status = ?, payment_date = CURDATE() WHERE bill_id = ?");
            $stmt->execute([$total_amount, $status, $bill['bill_id']]);
            $billing_id = $bill['bill_id'];
        }
    }

    $pdo->commit();
    echo json_encode([
        'status' => 'success', 
        'message' => 'Patient discharged. Final bill generated (Pending).',
        'bill_id' => $billing_id ?? null
    ]);

    // 📧 NEW: Discharge & Final Bill Notification
    if ($patient_id) {
        try {
            require_once '../../utils/NotificationService.php';
            // Get Patient Data
            $stmt_pat = $pdo->prepare("SELECT u.user_id, u.email, u.first_name, u.last_name FROM Patients p JOIN Users u ON p.user_id = u.user_id WHERE p.patient_id = ?");
            $stmt_pat->execute([$patient_id]);
            $pat = $stmt_pat->fetch();
            if ($pat) {
                $pName = $pat['first_name'] . ' ' . $pat['last_name'];
                // 1. Discharge Summary Note (Email + In-App)
                NotificationService::sendDischargeSummary($pat['email'], $pat['user_id'], $pName);
                
                // 2. Final Bill Note (Email + In-App)
                if (isset($billing_id)) {
                    NotificationService::sendInvoiceGenerated($pat['email'], $pat['user_id'], $pName, $total_amount, $billing_id);
                }
            }
        } catch (Exception $e_mail) {}
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
