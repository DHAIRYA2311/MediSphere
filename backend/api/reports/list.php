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

$role = strtolower($payload['role']);
$user_id = $payload['id'];

try {
    $sql = "SELECT r.*, 
            p.patient_id, u_p.first_name as p_first, u_p.last_name as p_last,
            d.doctor_id, u_d.first_name as d_first, u_d.last_name as d_last
            FROM Reports r
            JOIN Patients p ON r.patient_id = p.patient_id
            JOIN Users u_p ON p.user_id = u_p.user_id
            LEFT JOIN Doctors d ON r.doctor_id = d.doctor_id
            LEFT JOIN Users u_d ON d.user_id = u_d.user_id";

    if ($role === 'patient') {
        $stmt_p = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt_p->execute([$user_id]);
        $patient_id = $stmt_p->fetchColumn();
        
        $sql .= " WHERE r.patient_id = $patient_id";
    } elseif ($role === 'doctor') {
        $stmt_d = $pdo->prepare("SELECT doctor_id FROM Doctors WHERE user_id = ?");
        $stmt_d->execute([$user_id]);
        $doctor_id = $stmt_d->fetchColumn();
        
        // Doctors can see reports linked to them OR potentially all reports for their patients? 
        // For now, let's show reports where they are the assigned doctor.
        // OR better: Doctors usually need to see ALL reports for a patient they are treating.
        // Let's stick to simple: Reports assigned to this doctor.
        $sql .= " WHERE r.doctor_id = $doctor_id";
    }
    // Admin, Receptionist, Staff see all (default)

    $sql .= " ORDER BY r.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $reports]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
