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

try {
    $query = "
        SELECT ic.*, 
               u.first_name as patient_first_name, 
               u.last_name as patient_last_name,
               b.total_amount as bill_amount
        FROM Insurance_Claims ic
        LEFT JOIN Patients p ON ic.patient_id = p.patient_id
        LEFT JOIN Users u ON p.user_id = u.user_id
        LEFT JOIN Billing b ON ic.billing_id = b.bill_id
        ORDER BY ic.processed_date DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $claims = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $claims]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error', 'debug' => $e->getMessage()]);
}
?>
