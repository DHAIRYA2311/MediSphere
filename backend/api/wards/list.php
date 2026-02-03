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
    // Fetch all wards with their capacity and current occupancy
    // We join with Beds to count total beds created, and count occupied beds
    $sql = "SELECT 
                w.ward_id, 
                w.ward_name, 
                w.capacity, 
                (SELECT COUNT(*) FROM Beds b WHERE b.ward_id = w.ward_id) as total_beds,
                (SELECT COUNT(*) FROM Beds b WHERE b.ward_id = w.ward_id AND b.status = 'Occupied') as occupied_beds
            FROM Wards w";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $wards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $wards]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
