<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

header('Content-Type: application/json');

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
    // Common stats for all staff roles
    $commonStats = function() use ($pdo) {
        $stats = [];
        
        // Total counts
        $stats['total_patients'] = (int) $pdo->query("SELECT COUNT(*) FROM Patients")->fetchColumn();
        $stats['total_doctors'] = (int) $pdo->query("SELECT COUNT(*) FROM Doctors")->fetchColumn();
        $stats['total_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments")->fetchColumn();
        $stats['today_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments WHERE appointment_date = CURDATE()")->fetchColumn();
        $stats['pending_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments WHERE status = 'Pending'")->fetchColumn();
        
        // Bed statistics
        try {
            $stats['total_beds'] = (int) $pdo->query("SELECT COUNT(*) FROM Beds")->fetchColumn();
            $stats['available_beds'] = (int) $pdo->query("SELECT COUNT(*) FROM Beds WHERE status = 'Available'")->fetchColumn();
            $stats['occupied_beds'] = (int) $pdo->query("SELECT COUNT(*) FROM Beds WHERE status = 'Occupied'")->fetchColumn();
        } catch (Exception $e) {
            $stats['total_beds'] = 0;
            $stats['available_beds'] = 0;
            $stats['occupied_beds'] = 0;
        }
        
        // Weekly visits data (last 7 days)
        $weeklyVisits = [];
        $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        try {
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime("-$i days"));
                $dayName = date('D', strtotime($date));
                $count = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE appointment_date = '$date'")->fetchColumn();
                $weeklyVisits[] = [
                    'name' => substr($dayName, 0, 3),
                    'value' => (int) $count,
                    'date' => $date
                ];
            }
        } catch (Exception $e) {
            // Fallback with zeros
            foreach ($days as $day) {
                $weeklyVisits[] = ['name' => $day, 'value' => 0];
            }
        }
        $stats['weekly_visits'] = $weeklyVisits;
        
        // Today's schedule
        $schedule = [];
        try {
            $stmt = $pdo->query("
                SELECT 
                    a.appointment_id,
                    TIME_FORMAT(a.appointment_time, '%H:%i') as time,
                    CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                    CONCAT('Dr. ', d.first_name, ' ', d.last_name) as doctor_name,
                    a.status,
                    a.reason
                FROM Appointments a
                JOIN Patients p ON a.patient_id = p.patient_id
                JOIN Doctors d ON a.doctor_id = d.doctor_id
                WHERE a.appointment_date = CURDATE()
                ORDER BY a.appointment_time
                LIMIT 5
            ");
            $schedule = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $schedule = [];
        }
        $stats['today_schedule'] = $schedule;
        
        // Recent appointments
        $recentAppointments = [];
        try {
            $stmt = $pdo->query("
                SELECT 
                    a.appointment_id,
                    a.appointment_date,
                    TIME_FORMAT(a.appointment_time, '%H:%i') as appointment_time,
                    CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                    CONCAT('Dr. ', d.first_name, ' ', d.last_name) as doctor_name,
                    a.status
                FROM Appointments a
                JOIN Patients p ON a.patient_id = p.patient_id
                JOIN Doctors d ON a.doctor_id = d.doctor_id
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
                LIMIT 5
            ");
            $recentAppointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $recentAppointments = [];
        }
        $stats['recent_appointments'] = $recentAppointments;
        
        return $stats;
    };

    if ($role == 'admin') {
        $stats = $commonStats();
        $stats['total_users'] = (int) $pdo->query("SELECT COUNT(*) FROM Users")->fetchColumn();
        
        try {
            $stats['total_staff'] = (int) $pdo->query("SELECT COUNT(*) FROM Staff")->fetchColumn();
        } catch (Exception $e) { 
            $stats['total_staff'] = 0; 
        }

        try {
            $stats['total_revenue'] = (float) ($pdo->query("SELECT COALESCE(SUM(paid_amount), 0) FROM Billing")->fetchColumn() ?: 0);
            $stats['pending_bills'] = (int) $pdo->query("SELECT COUNT(*) FROM Billing WHERE status = 'Pending'")->fetchColumn();
        } catch (Exception $e) { 
            $stats['total_revenue'] = 0;
            $stats['pending_bills'] = 0;
        }

        try {
            $stats['active_staff'] = (int) $pdo->query("SELECT COUNT(*) FROM Users WHERE status = 'Active' AND role IN ('staff', 'receptionist', 'doctor')")->fetchColumn();
        } catch (Exception $e) { 
            $stats['active_staff'] = 0; 
        }
        
    } elseif ($role == 'doctor') {
        $stmt = $pdo->prepare("SELECT doctor_id FROM Doctors WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $doctor_id = $stmt->fetchColumn();

        if ($doctor_id) {
            $stats['my_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments WHERE doctor_id = $doctor_id")->fetchColumn();
            $stats['today_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments WHERE doctor_id = $doctor_id AND appointment_date = CURDATE()")->fetchColumn();
            $stats['pending_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments WHERE doctor_id = $doctor_id AND status = 'Pending'")->fetchColumn();
            $stats['completed_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments WHERE doctor_id = $doctor_id AND status = 'Completed'")->fetchColumn();
            
            // Weekly appointments for this doctor
            $weeklyVisits = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime("-$i days"));
                $dayName = date('D', strtotime($date));
                $count = $pdo->query("SELECT COUNT(*) FROM Appointments WHERE doctor_id = $doctor_id AND appointment_date = '$date'")->fetchColumn();
                $weeklyVisits[] = [
                    'name' => substr($dayName, 0, 3),
                    'value' => (int) $count
                ];
            }
            $stats['weekly_visits'] = $weeklyVisits;
            
            // Today's schedule for this doctor
            $stmt = $pdo->query("
                SELECT 
                    a.appointment_id,
                    TIME_FORMAT(a.appointment_time, '%H:%i') as time,
                    CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                    a.status,
                    a.reason
                FROM Appointments a
                JOIN Patients p ON a.patient_id = p.patient_id
                WHERE a.doctor_id = $doctor_id AND a.appointment_date = CURDATE()
                ORDER BY a.appointment_time
                LIMIT 10
            ");
            $stats['today_schedule'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
    } elseif ($role == 'patient') {
        $stmt = $pdo->prepare("SELECT patient_id FROM Patients WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $patient_id = $stmt->fetchColumn();

        if ($patient_id) {
            $stats['my_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments WHERE patient_id = $patient_id")->fetchColumn();
            $stats['upcoming_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments WHERE patient_id = $patient_id AND appointment_date >= CURDATE() AND status != 'Cancelled'")->fetchColumn();
            $stats['completed_appointments'] = (int) $pdo->query("SELECT COUNT(*) FROM Appointments WHERE patient_id = $patient_id AND status = 'Completed'")->fetchColumn();
            
            // Upcoming appointments list
            $stmt = $pdo->query("
                SELECT 
                    a.appointment_id,
                    a.appointment_date,
                    TIME_FORMAT(a.appointment_time, '%H:%i') as appointment_time,
                    CONCAT('Dr. ', d.first_name, ' ', d.last_name) as doctor_name,
                    d.specialization,
                    a.status
                FROM Appointments a
                JOIN Doctors d ON a.doctor_id = d.doctor_id
                WHERE a.patient_id = $patient_id AND a.appointment_date >= CURDATE()
                ORDER BY a.appointment_date, a.appointment_time
                LIMIT 5
            ");
            $stats['upcoming_list'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
    } elseif (in_array($role, ['receptionist', 'staff'])) {
        $stats = $commonStats();
        
        // Additional stats for receptionist
        try {
            $stats['total_revenue'] = (float) ($pdo->query("SELECT COALESCE(SUM(paid_amount), 0) FROM Billing")->fetchColumn() ?: 0);
            $stats['today_revenue'] = (float) ($pdo->query("SELECT COALESCE(SUM(paid_amount), 0) FROM Billing WHERE DATE(created_at) = CURDATE()")->fetchColumn() ?: 0);
        } catch (Exception $e) {
            $stats['total_revenue'] = 0;
            $stats['today_revenue'] = 0;
        }
    }

    echo json_encode(['status' => 'success', 'data' => $stats]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
