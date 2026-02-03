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

$role = strtolower($payload['role']);
if ($role !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->ward_id) || !isset($data->bed_number)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit();
}

try {
    // Check Capacity
    $stmt = $pdo->prepare("SELECT COUNT(*) as current_count, w.capacity 
                           FROM Beds b 
                           JOIN Wards w ON b.ward_id = w.ward_id 
                           WHERE b.ward_id = ?");
    $stmt->execute([$data->ward_id]);
    $result = $stmt->fetch();

    // If no beds exist yet, result still returns capacity if join works, 
    // but if no beds, count is 0. 
    // Wait, simpler to fetch ward capacity separately first to be safe, 
    // but a LEFT JOIN or just fetching ward capacity is better.
    
    // Better query:
    $stmt = $pdo->prepare("SELECT capacity FROM Wards WHERE ward_id = ?");
    $stmt->execute([$data->ward_id]);
    $capacity = $stmt->fetchColumn();

    if (!$capacity) {
        echo json_encode(['status' => 'error', 'message' => 'Ward not found']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM Beds WHERE ward_id = ?");
    $stmt->execute([$data->ward_id]);
    $current_count = $stmt->fetchColumn();

    if ($current_count >= $capacity) {
        echo json_encode(['status' => 'error', 'message' => 'Ward capacity reached! Cannot add more beds.']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO Beds (ward_id, bed_number, status) VALUES (?, ?, 'Free')");
    $stmt->execute([$data->ward_id, $data->bed_number]);
    echo json_encode(['status' => 'success', 'message' => 'Bed added successfully']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
