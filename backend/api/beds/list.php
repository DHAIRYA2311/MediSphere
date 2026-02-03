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

$ward_id = $_GET['ward_id'] ?? null;
if (!$ward_id) {
    echo json_encode(['status' => 'error', 'message' => 'Ward ID required']);
    exit();
}

try {
    // Get beds for this ward. Also join with Bed_Allocations AND Patients to see who is there.
    // We want the CURRENT active allocation (where status is Occupied).
    // Note: Since Allocations schema has release_date NOT NULL, we search for allocations where the Bed is Occupied (status in Beds table is definitive)
    // and grab the latest allocation for that bed.
    $sql = "SELECT 
                b.bed_id, 
                b.bed_number, 
                b.status,
                ba.allocation_id,
                p.patient_id,
                u.first_name,
                u.last_name
            FROM Beds b
            LEFT JOIN (
                SELECT * FROM Bed_Allocations 
                WHERE allocation_id IN (SELECT MAX(allocation_id) FROM Bed_Allocations GROUP BY bed_id)
            ) ba ON b.bed_id = ba.bed_id AND b.status = 'Occupied'
            LEFT JOIN Patients p ON ba.patient_id = p.patient_id
            LEFT JOIN Users u ON p.user_id = u.user_id
            WHERE b.ward_id = ?";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ward_id]);
    $beds = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $beds]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
