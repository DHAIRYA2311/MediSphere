<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';

// Get all doctors with their user details
$stmt = $pdo->prepare("
    SELECT 
        d.doctor_id, 
        d.specialization, 
        d.department, 
        d.qualification,
        d.years_of_experience,
        u.first_name, 
        u.last_name, 
        u.email
    FROM Doctors d
    JOIN Users u ON d.user_id = u.user_id
");
$stmt->execute();
$doctors = $stmt->fetchAll();

echo json_encode(['status' => 'success', 'data' => $doctors]);
?>
