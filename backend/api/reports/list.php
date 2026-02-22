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
            p.patient_id, u_p.first_name as p_first, u_p.last_name as p_last, u_p.email as p_email, u_p.phone as p_phone, u_p.gender as p_gender, u_p.dob as p_dob, p.blood_group,
            d.doctor_id, u_d.first_name as d_first, u_d.last_name as d_last, d.specialization
            FROM Reports r
            JOIN Patients p ON r.patient_id = p.patient_id
            JOIN Users u_p ON p.user_id = u_p.user_id
            LEFT JOIN Doctors d ON r.doctor_id = d.doctor_id
            LEFT JOIN Users u_d ON d.user_id = u_d.user_id";
    
    $where = [];
    $params = [];

    if ($role === 'patient') {
        $stmt_p = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt_p->execute([$user_id]);
        $patient_id = $stmt_p->fetchColumn();
        
        if (!$patient_id) {
            echo json_encode(['status' => 'success', 'data' => []]);
            exit();
        }
        $where[] = "r.patient_id = ?";
        $params[] = $patient_id;

    } elseif ($role === 'doctor') {
        $stmt_d = $pdo->prepare("SELECT doctor_id FROM Doctors WHERE user_id = ?");
        $stmt_d->execute([$user_id]);
        $doctor_id = $stmt_d->fetchColumn();
        
        if (!$doctor_id) {
            echo json_encode(['status' => 'success', 'data' => []]);
            exit();
        }
        $where[] = "r.doctor_id = ?";
        $params[] = $doctor_id;
    } elseif (!in_array($role, ['admin', 'receptionist', 'staff'])) {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized access to reports']);
        exit();
    }

    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    $sql .= " ORDER BY r.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $reports]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
