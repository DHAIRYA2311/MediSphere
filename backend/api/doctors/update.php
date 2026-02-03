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

// Only Admin or the Doctor themselves can update
$user_id = $payload['id'];
$role = strtolower($payload['role']);

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->doctor_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Doctor ID required']);
    exit();
}

// Verify ownership if not admin
if ($role != 'admin') {
    $stmt = $pdo->prepare("SELECT user_id FROM Doctors WHERE doctor_id = ?");
    $stmt->execute([$data->doctor_id]);
    $doc_user_id = $stmt->fetchColumn();

    if ($doc_user_id != $user_id) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Access denied']);
        exit();
    }
}

try {
    // Update Doctors table
    $stmt = $pdo->prepare("UPDATE Doctors SET specialization=?, department=?, qualification=?, years_of_experience=? WHERE doctor_id=?");
    $stmt->execute([
        $data->specialization,
        $data->department,
        $data->qualification,
        $data->years_of_experience,
        $data->doctor_id
    ]);

    // Update Users table (phone, address, status if admin)
    // Get user_id for this doctor
    $stmt = $pdo->prepare("SELECT user_id FROM Doctors WHERE doctor_id = ?");
    $stmt->execute([$data->doctor_id]);
    $uid = $stmt->fetchColumn();

    if ($uid) {
        $update_fields = [];
        $params = [];

        if (isset($data->phone)) {
            $update_fields[] = "phone = ?";
            $params[] = $data->phone;
        }
        if (isset($data->address)) {
            $update_fields[] = "address = ?";
            $params[] = $data->address;
        }
        if ($role == 'admin' && isset($data->user_status)) {
            $update_fields[] = "status = ?";
            $params[] = $data->user_status;
        }

        if (!empty($update_fields)) {
            $params[] = $uid;
            $sql = "UPDATE Users SET " . implode(", ", $update_fields) . " WHERE user_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
    }

    echo json_encode(['status' => 'success', 'message' => 'Doctor updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $e->getMessage()]);
}
?>
