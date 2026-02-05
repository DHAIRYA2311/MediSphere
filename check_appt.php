<?php
include 'backend/config/db.php';
$stmt = $pdo->query("DESCRIBE Appointments");
$cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo implode(", ", $cols);
?>
