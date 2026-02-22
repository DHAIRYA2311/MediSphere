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

    // 📧 NEW: ICU Transfer Notification
    try {
        require_once '../../utils/NotificationService.php';
        // Get Ward Info and Patient Email
        $stmt_target = $pdo->prepare("SELECT u.user_id, w.ward_name, u.email, u.first_name, u.last_name 
                                     FROM Beds b 
                                     JOIN Wards w ON b.ward_id = w.ward_id 
                                     JOIN Bed_Allocations ba ON ba.allocation_id = ? 
                                     JOIN Patients p ON ba.patient_id = p.patient_id 
                                     JOIN Users u ON p.user_id = u.user_id 
                                     WHERE b.bed_id = ?");
        $stmt_target->execute([$allocation_id, $data->target_bed_id]);
        $info = $stmt_target->fetch();
        
        if ($info && stripos($info['ward_name'], 'ICU') !== false) {
            $pName = $info['first_name'] . ' ' . $info['last_name'];
            NotificationService::sendICUTransfer($info['email'], $info['user_id'], $pName, $info['ward_name']);
        }
    } catch (Exception $e_mail) {}

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
