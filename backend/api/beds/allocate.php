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
if (!in_array($role, ['admin', 'receptionist'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied. Only Reception/Admin can allocate beds.']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->bed_id) || !isset($data->patient_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Update Bed status
    $stmt = $pdo->prepare("UPDATE Beds SET status = 'Occupied' WHERE bed_id = ? AND status = 'Free'");
    $stmt->execute([$data->bed_id]);
    
    if ($stmt->rowCount() == 0) {
        throw new Exception("Bed is not available");
    }

    // 2. Create Allocation
    // release_date is NOT NULL, so we use a dummy future date to signify 'active'
    $future_date = '2099-12-31'; 
    $stmt = $pdo->prepare("INSERT INTO Bed_Allocations (bed_id, patient_id, allocation_date, release_date) VALUES (?, ?, CURDATE(), ?)");
    $stmt->execute([$data->bed_id, $data->patient_id, $future_date]);

    // 3. Initialize IPD Billing if not exists
    $stmt = $pdo->prepare("SELECT bill_id FROM Billing WHERE patient_id = ? AND appointment_id IS NULL AND payment_date = '2099-12-31' LIMIT 1");
    $stmt->execute([$data->patient_id]);
    $existing_bill = $stmt->fetch();

    if (!$existing_bill) {
        $stmt = $pdo->prepare("INSERT INTO Billing (patient_id, appointment_id, total_amount, paid_amount, payment_status, payment_date) VALUES (?, NULL, 0, 0, 'Pending', '2099-12-31')");
        $stmt->execute([$data->patient_id]);
    }

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Bed allocated successfully']);

    // 📧 NEW: Send Admission Notification
    try {
        require_once '../../utils/NotificationService.php';
        // Get Patient & Ward Info
        $stmt_info = $pdo->prepare("SELECT u.user_id, u.email, u.first_name, u.last_name, w.ward_name, b.bed_number 
                                   FROM Beds b 
                                   JOIN Wards w ON b.ward_id = w.ward_id 
                                   JOIN Patients p ON p.patient_id = ? 
                                   JOIN Users u ON p.user_id = u.user_id 
                                   WHERE b.bed_id = ?");
        $stmt_info->execute([$data->patient_id, $data->bed_id]);
        $info = $stmt_info->fetch();
        if ($info) {
            $pName = $info['first_name'] . ' ' . $info['last_name'];
            NotificationService::sendAdmissionConfirmation($info['email'], $info['user_id'], $pName, $info['ward_name'], $info['bed_number']);
        }
    } catch (Exception $e_mail) {}

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
