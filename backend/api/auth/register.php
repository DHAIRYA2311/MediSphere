<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->first_name) && isset($data->last_name) && isset($data->email) && isset($data->password) && isset($data->role) && isset($data->gender) && isset($data->dob) && isset($data->address) && isset($data->phone)) {
    $first_name = trim($data->first_name);
    $last_name = trim($data->last_name);
    $email = trim($data->email);
    $password = $data->password;
    $role_name = ucfirst(strtolower($data->role)); // Ensure capitalization matches DB if needed, usually 'Patient', 'Doctor'
    $gender = $data->gender;
    $dob = $data->dob;
    $address = $data->address;
    $phone = $data->phone;

    // Validate Status
    $status = 'Active'; 
    $created_at = date('Y-m-d');

    // Check if email exists
    $stmt = $pdo->prepare("SELECT user_id FROM Users WHERE email = ?");
    $stmt->execute([$email]);
    if($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
        exit();
    }

    // Get Role ID
    $stmt = $pdo->prepare("SELECT role_id FROM Roles WHERE role_name = ?");
    $stmt->execute([$role_name]);
    $role_row = $stmt->fetch();
    
    if (!$role_row) {
        // Fallback or error if role doesn't exist. For now, try to insert it? Or fail.
        // Better to fail for security, valid roles should be seeded.
        // Try one more time with exact case from input
        echo json_encode(['status' => 'error', 'message' => 'Invalid role selected']);
        exit();
    }
    $role_id = $role_row['role_id'];

    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO Users (role_id, first_name, last_name, email, phone, password, gender, dob, address, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$role_id, $first_name, $last_name, $email, $phone, $password_hash, $gender, $dob, $address, $created_at, $status]);
        $user_id = $pdo->lastInsertId();

        // Create role specific entries matching the schema table names (Patients, Doctors, Receptionist)
        if (strtolower($role_name) == 'patient') {
            // Patients schema: patient_id, user_id, blood_group, emergency_contact, insurance_number, medical_history
            // Start with empty/default values for optional fields not in registration form
            $stmt = $pdo->prepare("INSERT INTO Patients (user_id, blood_group, emergency_contact, insurance_number, medical_history) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, 'N/A', 'N/A', 'N/A', 'None']);
        
        } elseif (strtolower($role_name) == 'doctor') {
            // Doctors schema: doctor_id, user_id, specialization, department, qualification, years_of_experience
            $stmt = $pdo->prepare("INSERT INTO Doctors (user_id, specialization, department, qualification, years_of_experience) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, 'General', 'General', 'MBBS', 0]);
        
        } elseif (strtolower($role_name) == 'receptionist') {
             // Receptionist schema: reception_id, user_id, shift, created_at
             $stmt = $pdo->prepare("INSERT INTO Receptionist (user_id, shift, created_at) VALUES (?, ?, ?)");
             $stmt->execute([$user_id, 'Morning', date('Y-m-d H:i:s')]);
        }

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'User registered successfully']);
    } catch(Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Incomplete data. Required: first_name, last_name, email, password, role, gender, dob, address, phone']);
}
?>
