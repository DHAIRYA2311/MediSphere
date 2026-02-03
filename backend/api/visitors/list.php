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
    // Join with Patients and Users to get Patient Name
    // Visitors: visitor_id, patient_id, visitor_name, relation, entry_time, exit_time
    // Patients: patient_id, user_id
    // Users: user_id, first_name, last_name
    
    $query = "
        SELECT v.*, 
               u.first_name as patient_first_name, 
               u.last_name as patient_last_name
        FROM Visitors v
        LEFT JOIN Patients p ON v.patient_id = p.patient_id
        LEFT JOIN Users u ON p.user_id = u.user_id
        ORDER BY v.entry_time DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $visitors]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error', 'debug' => $e->getMessage()]);
}
?>
