<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload || !in_array(strtolower($payload['role']), ['admin', 'staff'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// source_bed_id and target_bed_id are required
if (!isset($data->source_bed_id) || !isset($data->target_bed_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing source or target bed']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Verify Source is Occupied
    $stmt = $pdo->prepare("SELECT status FROM Beds WHERE bed_id = ?");
    $stmt->execute([$data->source_bed_id]);
    if ($stmt->fetchColumn() !== 'Occupied') {
        throw new Exception("Source bed is not occupied.");
    }

    // 2. Verify Target is Free
    $stmt = $pdo->prepare("SELECT status FROM Beds WHERE bed_id = ?");
    $stmt->execute([$data->target_bed_id]);
    if ($stmt->fetchColumn() !== 'Free') {
        throw new Exception("Target bed is not free.");
    }

    // 3. Find Active Allocation
    // We assume the allocation with the latest allocation_date for this bed is the active one.
    // Or check release_date >= curdate
    $stmt = $pdo->prepare("SELECT allocation_id FROM Bed_Allocations WHERE bed_id = ? ORDER BY allocation_id DESC LIMIT 1");
    $stmt->execute([$data->source_bed_id]);
    $allocation_id = $stmt->fetchColumn();

    if (!$allocation_id) {
        throw new Exception("No active allocation found for this bed.");
    }

    // 4. Update Beds Status
    $stmt = $pdo->prepare("UPDATE Beds SET status = 'Free' WHERE bed_id = ?");
    $stmt->execute([$data->source_bed_id]);

    $stmt = $pdo->prepare("UPDATE Beds SET status = 'Occupied' WHERE bed_id = ?");
    $stmt->execute([$data->target_bed_id]);

    // 5. Move Allocation
    $stmt = $pdo->prepare("UPDATE Bed_Allocations SET bed_id = ? WHERE allocation_id = ?");
    $stmt->execute([$data->target_bed_id, $allocation_id]);

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Patient moved successfully']);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
