<?php
require_once 'backend/config/db.php';
$stmt = $pdo->query("SHOW TABLES");
echo "Tables: " . implode(", ", $stmt->fetchAll(PDO::FETCH_COLUMN)) . "\n";
$stmt = $pdo->query("DESCRIBE attendance");
echo "Attendance Columns:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
