<?php
require_once 'backend/config/db.php';
$stmt = $pdo->query("SELECT * FROM ai_faces LIMIT 5");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
