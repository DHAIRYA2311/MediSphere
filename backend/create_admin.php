<?php
require_once 'config/db.php';

$email = 'admin@medisphere.com';
$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);
$role_name = 'Admin';

// Get Role ID
$stmt = $pdo->prepare("SELECT role_id FROM Roles WHERE role_name = ?");
$stmt->execute([$role_name]);
$role_id = $stmt->fetchColumn();

if (!$role_id) {
    die("Error: 'Admin' role not found in Roles table. Please run backend/patch_schema.sql first.\n");
}

// Check if admin exists
$stmt = $pdo->prepare("SELECT user_id FROM Users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    die("Admin user already exists ($email).\n");
}

// Insert User
try {
    $sql = "INSERT INTO Users (role_id, first_name, last_name, email, phone, password, gender, dob, address, created_at, status)
            VALUES (?, 'System', 'Admin', ?, '0000000000', ?, 'Other', '2000-01-01', 'Admin HQ', NOW(), 'Active')";
    $stmt = $pdo->prepare($sql);
    
    if ($stmt->execute([$role_id, $email, $hash])) {
        // Also insert into Admin table if you have one, though primarily we use Users table now.
        // But database.sql has an Admin table. Let's see if we need to link it.
        // The Users table has an 'admin_id' foreign key? No, it has foreign key TO Admin table?
        // Checking schema: Users has admin_id (FK to Admin).
        // ERROR in Schema design maybe? 
        // Let's re-read the schema.
        // Users: admin_id REFERENCES Admin(admin_id).
        // This implies a User BELONGS to an Admin? Or IS an Admin?
        // Usually, if a User IS an Admin, we'd insert into Admin table and link back?
        // Or simpler: Just use Users table with role.
        // Given `login.php` checks Users table, we are good.
        // But to be consistent with your complex schema, let's insert into Admin table too and link them?
        // Schema: Admin(admin_id, username, password, status). 
        // This seems redundant with Users table.
        // For now, let's just ensure the User entry is there so Login works.
        
        echo "Admin user created successfully!\n";
        echo "Email: $email\n";
        echo "Password: $password\n";
    } else {
        echo "Failed to insert admin user.\n";
    }
} catch (PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}
?>
