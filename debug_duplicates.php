<?php
include 'backend/config/db.php';
$stmt = $pdo->prepare("SELECT * FROM Users WHERE email = ?");
$stmt->execute(['kavan@gmail.com']);
print_r($stmt->fetchAll());
?>
