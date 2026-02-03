<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$data = json_decode(file_get_contents("php://input"), true);

// Required fields for Registration & Booking
$required = ['first_name', 'last_name', 'email', 'phone', 'password', 'dob', 'gender', 'address', 'appointment_date', 'appointment_time', 'department', 'doctor_id'];

foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Missing field: $field"]);
        exit();
    }
}

try {
    $pdo->beginTransaction();

    // 1. Check if User exists
    $stmt = $pdo->prepare("SELECT user_id, email, password, role_id FROM Users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $existingUser = $stmt->fetch();

    $user_id = null;
    $patient_id = null;

    if ($existingUser) {
        // User exists, check credentials? 
        // For security, if user exists, we probably shouldn't just auto-book without login.
        // Option 1: Fail and say "Account exists, please login".
        // Option 2 (User Request "Collect patient data"): Assuming new patient.
        
        http_response_code(409); // Conflict
        echo json_encode(['status' => 'error', 'message' => 'An account with this email already exists. Please login to book.']);
        $pdo->rollBack();
        exit();
    } else {
        // 2. Create User
        // Get Role ID for Patient
        $stmt = $pdo->prepare("SELECT role_id FROM Roles WHERE role_name = 'Patient'");
        $stmt->execute();
        $role_id = $stmt->fetchColumn();

        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("
            INSERT INTO Users (role_id, first_name, last_name, email, phone, password, gender, dob, address, created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Active')
        ");
        $stmt->execute([
            $role_id, $data['first_name'], $data['last_name'], $data['email'], 
            $data['phone'], $hashed_password, $data['gender'], $data['dob'], $data['address']
        ]);
        $user_id = $pdo->lastInsertId();

        // 3. Create Patient Record
        $stmt = $pdo->prepare("INSERT INTO Patients (user_id, blood_group, emergency_contact, insurance_number, medical_history) VALUES (?, ?, ?, ?, ?)");
        // Defaults/Empty for optional patient fields if not in form
        $stmt->execute([$user_id, 'O+', $data['phone'], '', '']); 
        $patient_id = $pdo->lastInsertId();
    }

    // 4. Create Appointment
    $stmt = $pdo->prepare("
        INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, booking_method, status, notes)
        VALUES (?, ?, ?, ?, 'Online', 'Confirmed', ?)
    ");
    $stmt->execute([$patient_id, $data['doctor_id'], $data['appointment_date'], $data['appointment_time'], $data['notes'] ?? 'Initial Booking']);

    $pdo->commit();

    // 5. Generate Token for Auto-Login
    $token_payload = [
        'id' => $user_id,
        'email' => $data['email'],
        'role' => 'Patient',
        'name' => $data['first_name'] . ' ' . $data['last_name']
    ];
    $jwt = JWT::generate_token($token_payload);

    echo json_encode([
        'status' => 'success', 
        'message' => 'Registration and Booking Successful!',
        'token' => $jwt,
        'user' => $token_payload
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
