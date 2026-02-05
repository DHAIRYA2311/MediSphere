<?php
include 'backend/config/db.php';
$stmt = $pdo->prepare("SELECT * FROM Patients WHERE user_id = ?");
$stmt->execute([13]);
print_r($stmt->fetchAll());
?>
