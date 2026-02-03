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

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($data->staff_id)) {
        // UPDATE
        try {
            $stmt = $pdo->prepare("UPDATE Staff SET designation=?, shift=? WHERE staff_id=?");
            $stmt->execute([$data->designation, $data->shift, $data->staff_id]);
            
            // Optionally update user phone
             if (isset($data->phone)) {
                $stmt = $pdo->prepare("SELECT user_id FROM Staff WHERE staff_id=?");
                $stmt->execute([$data->staff_id]);
                $uid = $stmt->fetchColumn();
                if ($uid) {
                    $stmt = $pdo->prepare("UPDATE Users SET phone=? WHERE user_id=?");
                    $stmt->execute([$data->phone, $uid]);
                }
            }

            echo json_encode(['status' => 'success', 'message' => 'Staff updated']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
        }
    } else {
        // CREATE (Add new User + Staff entry)
        try {
            // Check for duplicate email
             $stmt = $pdo->prepare("SELECT user_id FROM Users WHERE email = ?");
            $stmt->execute([$data->email]);
            if ($stmt->fetch()) {
                 echo json_encode(['status' => 'error', 'message' => 'Email exists']);
                 exit();
            }

            // Get 'Receptionist' role? Or do we need a 'Staff' role?
            // The DB has 'Staff' table but Roles table has 'Admin','Doctor','Patient','Receptionist'.
            // If designation is 'Nurse' or 'Janitor', do they login?
            // If they login, they need a Role.
            // Let's assume for now we use 'Receptionist' role for login-able staff or create a 'Staff' role.
            // Or maybe 'Staff' don't login?
            // If they have user_id, they are in Users table, so they can login if given a role.
            // Let's add 'Staff' role if not exists or default to 'Receptionist' for now?
            // Actually, let's insert 'Staff' into Roles table first if needed.
            
            // Allow dynamic role creation or just use 'Staff'
             $stmt = $pdo->prepare("SELECT role_id FROM Roles WHERE role_name = 'Staff'");
             $stmt->execute();
             $role_id = $stmt->fetchColumn();
             
             if (!$role_id) {
                 $pdo->exec("INSERT INTO Roles (role_name) VALUES ('Staff')");
                 $role_id = $pdo->lastInsertId();
             }

            $hash = password_hash($data->password, PASSWORD_BCRYPT);
            
            $stmt = $pdo->prepare("INSERT INTO Users (role_id, first_name, last_name, email, phone, password, gender, dob, address, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Active')");
            $stmt->execute([
                $role_id, $data->first_name, $data->last_name, $data->email, $data->phone, 
                $hash, $data->gender, $data->dob, $data->address
            ]);
            $user_id = $pdo->lastInsertId();

            $stmt = $pdo->prepare("INSERT INTO Staff (user_id, designation, shift) VALUES (?, ?, ?)");
            $stmt->execute([$user_id, $data->designation, $data->shift]);

            echo json_encode(['status' => 'success', 'message' => 'Staff added']);

        } catch (PDOException $e) {
             echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
}
?>
