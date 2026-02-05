<?php
include 'backend/config/db.php';
$stmt = $pdo->prepare("SELECT u.first_name, u.last_name, u.email FROM Patients p JOIN Users u ON p.user_id = u.user_id WHERE p.patient_id = ?");
$stmt->execute([5]);
print_r($stmt->fetch());
?>
