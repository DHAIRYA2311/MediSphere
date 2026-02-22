<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload || strtolower($payload['role']) != 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    // Delete User
    $id = $_GET['id'];
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT role_id FROM Users WHERE user_id = ?");
    $stmt->execute([$id]);
    $user_role_id = $stmt->fetchColumn();
    
    // Simple protection: Don't let admin delete themselves (though frontend handles this too)
    if ($payload['id'] == $id) {
        echo json_encode(['status' => 'error', 'message' => 'Cannot delete yourself']);
        exit();
    }

    try {
        // Warning: This will fail if there are foreign keys in other tables (like appointments).
        // Best practice is "soft delete" (status=Inactive), which we already have.
        // But if the user insists on CRUD 'Delete', we try.
        $stmt = $pdo->prepare("DELETE FROM Users WHERE user_id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'User deleted']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Cannot delete user (likely has related records). Deactivate instead.']);
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create User (simplified version of register, but by admin)
    // Or Update User
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->action) && $data->action == 'delete') {
         // Alternative delete via POST if DELETE method issues
         // ... implementation same as above
    }
    
    if (isset($data->user_id)) {
        // UPDATE
        try {
            $sql = "UPDATE Users SET first_name=?, last_name=?, email=?, phone=?, gender=?, address=? WHERE user_id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data->first_name, $data->last_name, $data->email, $data->phone, 
                $data->gender, $data->address, $data->user_id
            ]);
            echo json_encode(['status' => 'success', 'message' => 'User updated']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } else {
        // CREATE
        // Requires all fields: first_name, last_name, email, password, role_id...
        // Admin likely wants to just add a doctor or staff quickly?
        // Let's implement full create
        try {
            // Check email
            $stmt = $pdo->prepare("SELECT user_id FROM Users WHERE email = ?");
            $stmt->execute([$data->email]);
            if ($stmt->fetch()) {
                echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
                exit();
            }

            // Get role_id
            $stmt = $pdo->prepare("SELECT role_id FROM Roles WHERE role_name = ?");
            $stmt->execute([$data->role]);
            $role_id = $stmt->fetchColumn();

            $hash = password_hash($data->password, PASSWORD_BCRYPT);

            $sql = "INSERT INTO Users (role_id, first_name, last_name, email, phone, password, gender, dob, address, created_at, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Active')";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $role_id, $data->first_name, $data->last_name, $data->email, $data->phone, 
                $hash, $data->gender, $data->dob, $data->address
            ]);
            
            $user_id = $pdo->lastInsertId();

            // Insert into role specific table
            if (strtolower($data->role) == 'doctor') {
                $stmt = $pdo->prepare("INSERT INTO Doctors (user_id, specialization, department, qualification, years_of_experience) VALUES (?, 'General', 'General', 'MBBS', 0)");
                $stmt->execute([$user_id]);
            } elseif (strtolower($data->role) == 'patient') {
                $stmt = $pdo->prepare("INSERT INTO Patients (user_id, blood_group, emergency_contact, insurance_number, medical_history) VALUES (?, 'O+', 'N/A', 'N/A', '')");
                $stmt->execute([$user_id]);
            } elseif (strtolower($data->role) == 'receptionist') {
                $stmt = $pdo->prepare("INSERT INTO Receptionist (user_id, shift, created_at) VALUES (?, 'Morning', NOW())");
                $stmt->execute([$user_id]);
            } elseif (strtolower($data->role) == 'staff') {
                $stmt = $pdo->prepare("INSERT INTO Staff (user_id, designation, shift) VALUES (?, 'Nurse', 'Morning')");
                $stmt->execute([$user_id]);
            }

            echo json_encode(['status' => 'success', 'message' => 'User created successfully']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Create failed: ' . $e->getMessage()]);
        }
    }
}
?>
