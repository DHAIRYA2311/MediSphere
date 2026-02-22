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

try {
    $user_id = $payload['id'];
    $role = strtolower($payload['role']);

    // Allow Admins or Receptionists to view other staff profiles via ?id=X
    if (isset($_GET['id']) && in_array($role, ['admin', 'receptionist'])) {
        $user_id = $_GET['id'];
    }
    $sql = "
        SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, u.gender, u.dob, u.address, u.created_at, u.status, r.role_name,
               s.staff_id, s.designation, s.shift
        FROM Users u
        JOIN Roles r ON u.role_id = r.role_id
        LEFT JOIN Staff s ON u.user_id = s.user_id
        WHERE u.user_id = ?
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'Staff profile not found']);
        exit();
    }

    // 1. Get Today's Attendance
    $today = date('Y-m-d');
    $stmt = $pdo->prepare("SELECT * FROM Attendance WHERE user_id = ? AND date = ?");
    $stmt->execute([$user_id, $today]);
    $attendance_today = $stmt->fetch();

    // 2. Monthly Summary
    $start_of_month = date('Y-m-01');
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM Attendance WHERE user_id = ? AND date >= ?");
    $stmt->execute([$user_id, $start_of_month]);
    $monthly_presence = $stmt->fetchColumn();

    // 3. Role-based Responsibilities (Placeholders for now)
    $responsibilities = [];
    $designation = strtolower($user['designation'] ?? '');
    $role_name = strtolower($user['role_name']);

    if ($designation === 'nurse') {
        // Fetch assigned patients from bed_allocations if any linking exists
        // (Assuming Nurses are assigned to Wards, we might need a bridge table, 
        // but let's just fetch active bed allocations in all wards for now as a placeholder)
        $stmt = $pdo->query("SELECT ba.*, u.first_name, u.last_name, b.bed_number, w.ward_name 
                             FROM Bed_Allocations ba 
                             JOIN Patients p ON ba.patient_id = p.patient_id
                             JOIN Users u ON p.user_id = u.user_id
                             JOIN Beds b ON ba.bed_id = b.bed_id
                             JOIN Wards w ON b.ward_id = w.ward_id
                             WHERE b.status = 'Occupied' LIMIT 5");
        $responsibilities = $stmt->fetchAll();
    } else if ($designation === 'receptionist' || $role_name === 'receptionist') {
        // Today's appointments
        $stmt = $pdo->prepare("SELECT a.*, u.first_name, u.last_name FROM Appointments a 
                               JOIN Patients p ON a.patient_id = p.patient_id
                               JOIN Users u ON p.user_id = u.user_id
                               WHERE a.appointment_date = ? LIMIT 10");
        $stmt->execute([$today]);
        $responsibilities = $stmt->fetchAll();
    } else if ($designation === 'lab technician') {
        // Reports to process
        $stmt = $pdo->query("SELECT r.*, u.first_name, u.last_name FROM Reports r
                             JOIN Patients p ON r.patient_id = p.patient_id
                             JOIN Users u ON p.user_id = u.user_id
                             ORDER BY r.created_at DESC LIMIT 5");
        $responsibilities = $stmt->fetchAll();
    }

    // 4. Permissions (Logical mapping based on role)
    $permissions = [
        'view_records' => in_array($role_name, ['admin', 'doctor', 'staff', 'receptionist']),
        'edit_billing' => in_array($role_name, ['admin', 'receptionist']),
        'upload_reports' => in_array($role_name, ['admin', 'doctor', 'staff']) && $designation === 'lab technician',
        'allocate_bed' => in_array($role_name, ['admin', 'receptionist', 'staff'])
    ];

    echo json_encode([
        'status' => 'success',
        'data' => [
            'profile' => $user,
            'attendance' => [
                'today' => $attendance_today,
                'monthly_count' => $monthly_presence
            ],
            'responsibilities' => $responsibilities,
            'permissions' => $permissions
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
