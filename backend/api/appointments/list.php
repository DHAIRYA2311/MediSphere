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

$user_id = $payload['id'];
$role = trim(strtolower($payload['role']));

try {
    if ($role === 'patient') {
        $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $patient_id = $stmt->fetchColumn();

        if (!$patient_id) {
            echo json_encode(['status' => 'success', 'data' => []]);
            exit();
        }

        $query = "
            SELECT a.*, 
                   d.specialization, u_d.first_name as doctor_fname, u_d.last_name as doctor_lname,
                   u_p.first_name as patient_fname, u_p.last_name as patient_lname,
                   u_p.gender as patient_gender, u_p.dob as patient_dob, u_p.phone as patient_phone,
                   p.blood_group as patient_blood_group
            FROM Appointments a 
            JOIN Doctors d ON a.doctor_id = d.doctor_id 
            JOIN Users u_d ON d.user_id = u_d.user_id 
            JOIN Patients p ON a.patient_id = p.patient_id
            JOIN Users u_p ON p.user_id = u_p.user_id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$patient_id]);

    } elseif ($role === 'doctor') {
        $stmt = $pdo->prepare("SELECT doctor_id FROM Doctors WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $doctor_id = $stmt->fetchColumn();

        if (!$doctor_id) {
            echo json_encode(['status' => 'success', 'data' => []]);
            exit();
        }

        $query = "
            SELECT a.*, 
                   d.specialization, u_d.first_name as doctor_fname, u_d.last_name as doctor_lname,
                   u_p.first_name as patient_fname, u_p.last_name as patient_lname,
                   u_p.email as patient_email, u_p.phone as patient_phone, u_p.gender as patient_gender, u_p.dob as patient_dob,
                   p.blood_group as patient_blood_group
            FROM Appointments a 
            JOIN Doctors d ON a.doctor_id = d.doctor_id
            JOIN Users u_d ON d.user_id = u_d.user_id
            JOIN Patients p ON a.patient_id = p.patient_id 
            JOIN Users u ON p.user_id = u.user_id 
            JOIN Users u_p ON p.user_id = u_p.user_id -- Standardize aliases
            WHERE a.doctor_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        ";
        // Wait, I used 'u' and 'u_p' both. I'll stick to 'u_p' for consistency with patient_fname
        $query = "
            SELECT a.*, 
                   d.specialization, u_d.first_name as doctor_fname, u_d.last_name as doctor_lname,
                   u_p.first_name as patient_fname, u_p.last_name as patient_lname,
                   u_p.email as patient_email, u_p.phone as patient_phone, u_p.gender as patient_gender, u_p.dob as patient_dob,
                   p.blood_group as patient_blood_group
            FROM Appointments a 
            JOIN Doctors d ON a.doctor_id = d.doctor_id 
            JOIN Users u_d ON d.user_id = u_d.user_id
            JOIN Patients p ON a.patient_id = p.patient_id 
            JOIN Users u_p ON p.user_id = u_p.user_id
            WHERE a.doctor_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$doctor_id]);

    } elseif (in_array($role, ['admin', 'receptionist', 'staff', 'reception'])) {
        $query = "
            SELECT a.*, 
                   u_d.first_name as doctor_fname, u_d.last_name as doctor_lname, d.specialization,
                   u_p.first_name as patient_fname, u_p.last_name as patient_lname,
                   u_p.email as patient_email, u_p.phone as patient_phone, u_p.gender as patient_gender, u_p.dob as patient_dob,
                   p.blood_group as patient_blood_group
            FROM Appointments a
            JOIN Doctors d ON a.doctor_id = d.doctor_id
            JOIN Users u_d ON d.user_id = u_d.user_id
            JOIN Patients p ON a.patient_id = p.patient_id
            JOIN Users u_p ON p.user_id = u_p.user_id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
    } else {
        echo json_encode(['status' => 'error', 'message' => "Access denied: Your role '{$role}' is not authorized for appointment logs."]);
        exit();
    }

    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $appointments]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
