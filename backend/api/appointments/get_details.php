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

$user_id = $payload['id'];
$role = strtolower($payload['role']);
$appt_id = $_GET['id'] ?? '';

if (!$appt_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
    exit();
}

try {
    $query = "
        SELECT a.*,
               p.blood_group, p.insurance_number, p.medical_history,
               u_p.first_name as patient_fname, u_p.last_name as patient_lname, u_p.email as patient_email, u_p.phone as patient_phone, u_p.dob as patient_dob, u_p.gender as patient_gender,
               u_d.first_name as doctor_fname, u_d.last_name as doctor_lname, d.specialization
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.patient_id
        JOIN Users u_p ON p.user_id = u_p.user_id
        JOIN Doctors d ON a.doctor_id = d.doctor_id
        JOIN Users u_d ON d.user_id = u_d.user_id
        WHERE a.appointment_id = ?
    ";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$appt_id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        echo json_encode(['status' => 'error', 'message' => 'Appointment not found']);
        exit();
    }

    // Role-based Access Validation
    if ($role === 'patient') {
        $stmt_p = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt_p->execute([$user_id]);
        $patient_id = $stmt_p->fetchColumn();
        if ($data['patient_id'] != $patient_id) {
            echo json_encode(['status' => 'error', 'message' => 'Access denied: This is not your appointment']);
            exit();
        }
    } elseif ($role === 'doctor') {
        $stmt_d = $pdo->prepare("SELECT doctor_id FROM Doctors WHERE user_id = ?");
        $stmt_d->execute([$user_id]);
        $doctor_id = $stmt_d->fetchColumn();
        if ($data['doctor_id'] != $doctor_id) {
            echo json_encode(['status' => 'error', 'message' => 'Access denied: This appointment is not assigned to you']);
            exit();
        }
    } elseif (!in_array($role, ['admin', 'receptionist', 'staff'])) {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
        exit();
    }

    echo json_encode(['status' => 'success', 'data' => $data]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
