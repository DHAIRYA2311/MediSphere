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

// Optional filter by patient_id
$patient_id = isset($_GET['patient_id']) ? $_GET['patient_id'] : null;

try {
    $sql = "SELECT d.*, p.patient_id, u.first_name, u.last_name 
            FROM Documents d
            JOIN Patients p ON d.patient_id = p.patient_id
            JOIN Users u ON p.user_id = u.user_id";
            
    if ($patient_id) {
        $sql .= " WHERE d.patient_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$patient_id]);
    } else {
        $sql .= " ORDER BY d.document_id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    }
    
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $documents]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error', 'debug' => $e->getMessage()]);
}
?>
