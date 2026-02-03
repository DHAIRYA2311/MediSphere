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

$user_id = $payload['user_id'];
$role = strtolower($payload['role']);

try {
    // Base users query
    $sql = "SELECT d.*, 
                   u.first_name as patient_first_name, 
                   u.last_name as patient_last_name
            FROM Donation d
            LEFT JOIN Patients p ON d.patient_id = p.patient_id
            LEFT JOIN Users u ON p.user_id = u.user_id";

    // Filtering logic
    if ($role === 'patient') {
        // Find patient_id for this user
        $stmt_p = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt_p->execute([$user_id]);
        $patient = $stmt_p->fetch();
        
        if (!$patient) {
            echo json_encode(['status' => 'success', 'data' => []]); // No patient profile found
            exit();
        }

        $sql .= " WHERE d.patient_id = " . $patient['patient_id'];
    }

    $sql .= " ORDER BY d.donation_date DESC, d.donation_id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $donations]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error', 'debug' => $e->getMessage()]);
}
?>
