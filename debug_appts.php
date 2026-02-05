<?php
include 'backend/config/db.php';
$stmt = $pdo->query("SELECT * FROM Appointments WHERE notes = 'Booked via Chatbot'");
$appts = $stmt->fetchAll();
print_r($appts);
?>
