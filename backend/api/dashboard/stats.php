<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

// Prevent unwanted output
// ob_clean(); 
header('Content-Type: application/json');

// Error handling that returns JSON
function jsonError($message) {
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit();
}

try {
    $token = JWT::get_bearer_token();
    if (!$token) {
        jsonError('No token provided');
    }
    
    $payload = JWT::decode($token);
    if (!$payload) {
        http_response_code(401);
        jsonError('Unauthorized');
    }
} catch (Exception $e) {
    jsonError($e->getMessage());
}

$role = strtolower($payload['role']);
$user_id = $payload['id'];

$stats = [];

try {
    if ($role == 'admin') {
        $stats['total_users'] = $pdo->query("SELECT COUNT(*) FROM Users")->fetchColumn();
        $stats['total_doctors'] = $pdo->query("SELECT COUNT(*) FROM Doctors")->fetchColumn();
        $stats['total_patients'] = $pdo->query("SELECT COUNT(*) FROM Patients")->fetchColumn();
        $stats['total_appointments'] = $pdo->query("SELECT COUNT(*) FROM Appointments")->fetchColumn();
        $stats['today_appointments'] = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE appointment_date = CURDATE()")->fetchColumn();
        
        // New Stats - Safely try to fetch them
        try {
            $stats['total_staff'] = $pdo->query("SELECT COUNT(*) FROM Staff")->fetchColumn();
        } catch (Exception $e) { $stats['total_staff'] = 0; }

        try {
            $stats['total_revenue'] = $pdo->query("SELECT SUM(paid_amount) FROM Billing")->fetchColumn() ?: 0;
        } catch (Exception $e) { $stats['total_revenue'] = 0; }

        try {
            // Attendance proxy: Active Staff count
            $stats['attendance'] = $pdo->query("SELECT COUNT(*) FROM Users u JOIN Staff s ON u.user_id = s.user_id WHERE u.status = 'Active'")->fetchColumn();
        } catch (Exception $e) { $stats['attendance'] = 0; }
    } elseif ($role == 'doctor') {
        // Get doctor_id
        $stmt = $pdo->prepare("SELECT doctor_id FROM Doctors WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $doctor_id = $stmt->fetchColumn();

        if ($doctor_id) {
            $stats['my_appointments'] = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE doctor_id = $doctor_id")->fetchColumn();
            $stats['today_appointments'] = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE doctor_id = $doctor_id AND appointment_date = CURDATE()")->fetchColumn();
            $stats['pending_appointments'] = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE doctor_id = $doctor_id AND status = 'Pending'")->fetchColumn();
        }
    } elseif ($role == 'patient') {
        // Get patient_id
        $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $patient_id = $stmt->fetchColumn();

        if ($patient_id) {
            $stats['my_appointments'] = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE patient_id = $patient_id")->fetchColumn();
            $stats['upcoming_appointments'] = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE patient_id = $patient_id AND appointment_date >= CURDATE()")->fetchColumn();
        }
    } elseif ($role == 'staff') {
        // Ward occupancy summary
        try {
            $total_beds = $pdo->query("SELECT COUNT(*) FROM Beds")->fetchColumn() ?: 1;
            $occupied_beds = $pdo->query("SELECT COUNT(*) FROM Beds WHERE status = 'Occupied'")->fetchColumn();
            $stats['occupied_beds'] = round(($occupied_beds / $total_beds) * 100);
            $stats['available_beds'] = $pdo->query("SELECT COUNT(*) FROM Beds WHERE status = 'Available'")->fetchColumn();
            $stats['active_visitors'] = $pdo->query("SELECT COUNT(*) FROM Visitors WHERE exit_time IS NULL")->fetchColumn();
            
            // Personal attendance summary
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM attendance WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE())");
            $stmt->execute([$user_id]);
            $stats['my_attendance_count'] = $stmt->fetchColumn();
        } catch (Exception $e) { }
    } elseif ($role == 'receptionist') {
        $stats['today_appointments'] = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE appointment_date = CURDATE()")->fetchColumn();
        $stats['pending_appointments'] = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE status = 'Pending'")->fetchColumn();
        $stats['total_patients'] = $pdo->query("SELECT COUNT(*) FROM Patients")->fetchColumn();
    }

    echo json_encode(['status' => 'success', 'data' => $stats]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}
?>
