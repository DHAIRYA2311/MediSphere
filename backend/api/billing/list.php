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
$user_id = $payload['id'];

if ($role == 'doctor') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

try {
    $sql = "
        SELECT 
            b.*, 
            p.user_id as patient_user_id,
            u.first_name, 
            u.last_name, 
            u.email, u.phone, u.gender, u.dob,
            p.blood_group,
            ic.claim_status,
            ic.claim_id
        FROM Billing b
        JOIN Patients p ON b.patient_id = p.patient_id
        JOIN Users u ON p.user_id = u.user_id
        LEFT JOIN Insurance_Claims ic ON b.bill_id = ic.billing_id
    ";

    $where = [];
    $params = [];

    if ($role == 'patient') {
        // Find patient_id for this user
        $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $patient_id = $stmt->fetchColumn();
        $where[] = "b.patient_id = ?";
        $params[] = $patient_id;
    } elseif (isset($_GET['patient_id'])) {
        $where[] = "b.patient_id = ?";
        $params[] = $_GET['patient_id'];
    }

    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    $sql .= " ORDER BY b.payment_date DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $bills = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $bills]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}
?>
