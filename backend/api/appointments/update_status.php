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

$user_role = strtolower($payload['role']);
$data = json_decode(file_get_contents("php://input"), true);
$appointment_id = $data['appointment_id'] ?? null;
$new_status = $data['status'] ?? null;

if (!$appointment_id || !$new_status) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit();
}

$allowed_statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
if (!in_array($new_status, $allowed_statuses)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid status']);
    exit();
}

try {
    // Only Doctor, Admin, Receptionist can change status
    if (!in_array($user_role, ['doctor', 'admin', 'receptionist'])) {
        echo json_encode(['status' => 'error', 'message' => 'Access denied']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE Appointments SET status = ? WHERE appointment_id = ?");
    $stmt->execute([$new_status, $appointment_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Status updated successfully']);

        // 📧 NEW: Send Cancellation Notification
        if ($new_status === 'Cancelled') {
            try {
                require_once '../../utils/NotificationService.php';
                // Get Patient Details
                $stmt_pat = $pdo->prepare("SELECT u.user_id, u.email, u.first_name, u.last_name, a.appointment_date, a.appointment_time 
                                          FROM Appointments a 
                                          JOIN Patients p ON a.patient_id = p.patient_id 
                                          JOIN Users u ON p.user_id = u.user_id 
                                          WHERE a.appointment_id = ?");
                $stmt_pat->execute([$appointment_id]);
                $pat = $stmt_pat->fetch();
                if ($pat) {
                    $pName = $pat['first_name'] . ' ' . $pat['last_name'];
                    NotificationService::sendAppointmentCancellation($pat['email'], $pat['user_id'], $pName, $pat['appointment_date'], $pat['appointment_time']);
                }
            } catch (Exception $e_mail) {}
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No changes made or appointment not found']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
