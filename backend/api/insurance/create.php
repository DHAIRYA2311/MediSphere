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

if (isset($data->patient_id) && isset($data->claim_amount) && isset($data->insurance_number)) {
    $patient_id = $data->patient_id;
    $insurance_number = $data->insurance_number;
    $claim_amount = $data->claim_amount;
    $billing_id = isset($data->billing_id) ? $data->billing_id : NULL;
    $claim_status = 'Pending';
    $processed_date = NULL;

    try {
        /* Removed IPD enforcement per simplified workflow requirements 
        $check = $pdo->prepare("SELECT COUNT(*) FROM Bed_Allocations WHERE patient_id = ?");
        $check->execute([$patient_id]);
        
        if ($check->fetchColumn() == 0) {
            echo json_encode(['status' => 'error', 'message' => 'Claim Denied: Patient is OPD. Insurance is only applicable for In-Patient (IPD) admissions (Bed Allocated).']);
            exit();
        }
        */

        $stmt = $pdo->prepare("INSERT INTO Insurance_Claims (patient_id, billing_id, insurance_number, claim_status, claim_amount, processed_date) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$patient_id, $billing_id, $insurance_number, $claim_status, $claim_amount, $processed_date]);
        $claim_id = $pdo->lastInsertId();

        // 📧 NEW: Send Claim Submission Notification
        try {
            require_once '../../utils/NotificationService.php';
            // Get Patient Data
            $stmt_pat = $pdo->prepare("SELECT u.user_id, u.email, u.first_name, u.last_name FROM Patients p JOIN Users u ON p.user_id = u.user_id WHERE p.patient_id = ?");
            $stmt_pat->execute([$patient_id]);
            $pat = $stmt_pat->fetch();
            if ($pat) {
                $pName = $pat['first_name'] . ' ' . $pat['last_name'];
                NotificationService::sendInsuranceUpdate($pat['email'], $pat['user_id'], $pName, 'Pending (Submitted)', $claim_id);
            }
        } catch (Exception $e_mail) {}

        echo json_encode(['status' => 'success', 'message' => 'Claim submitted successfully', 'claim_id' => $claim_id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Submission failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
}
?>
