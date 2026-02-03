<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload) {
    http_response_code(401);
    exit();
}

try {
    // Determine patient ID
    $user_id = $payload['id'];
    $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $patient_id = $stmt->fetchColumn();

    if (!$patient_id) {
        // user might not be a patient or profile not linked
        echo json_encode(['status' => 'success', 'data' => null]);
        exit();
    }

    // Find active allocation
    // Active means release_date = '2099-12-31' in our logic
    $sql = "SELECT 
                w.ward_name, 
                b.bed_number, 
                ba.allocation_date 
            FROM Bed_Allocations ba
            JOIN Beds b ON ba.bed_id = b.bed_id
            JOIN Wards w ON b.ward_id = w.ward_id
            WHERE ba.patient_id = ? AND ba.release_date > CURDATE()
            ORDER BY ba.allocation_id DESC LIMIT 1";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$patient_id]);
    $allocation = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $allocation]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
