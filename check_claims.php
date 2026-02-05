<?php
include 'backend/config/db.php';
$stmt = $pdo->query("DESCRIBE Insurance_Claims");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
