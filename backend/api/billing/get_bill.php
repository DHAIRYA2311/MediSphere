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

$user_id = $payload['id'];
$role = strtolower($payload['role']);
$bill_id = $_GET['bill_id'] ?? null;

if (!$bill_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Bill ID is required']);
    exit();
}

try {
    $query = "
        SELECT b.*, 
               u_p.first_name as patient_fname, u_p.last_name as patient_lname, u_p.email as patient_email, u_p.phone as patient_phone,
               u_d.first_name as doctor_fname, u_d.last_name as doctor_lname, d.specialization,
               ic.claim_id, ic.claim_status, ic.insurance_number, ic.claim_amount, ic.processed_date
        FROM Billing b
        JOIN Patients p ON b.patient_id = p.patient_id
        JOIN Users u_p ON p.user_id = u_p.user_id
        LEFT JOIN Appointments a ON b.appointment_id = a.appointment_id
        LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
        LEFT JOIN Users u_d ON d.user_id = u_d.user_id
        LEFT JOIN Insurance_Claims ic ON b.bill_id = ic.billing_id
        WHERE b.bill_id = ?
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute([$bill_id]);
    $bill = $stmt->fetch();

    if (!$bill) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Bill not found']);
        exit();
    }

    // Security: Patients can only see their own bills
    if ($role === 'patient') {
        $check_stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $check_stmt->execute([$user_id]);
        $patient_id = $check_stmt->fetchColumn();
        if ($bill['patient_id'] != $patient_id) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Access denied']);
            exit();
        }
    }

    echo json_encode(['status' => 'success', 'data' => $bill]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
