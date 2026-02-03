<?php
require_once 'config/cors.php';
require_once 'config/db.php';

header('Content-Type: application/json');

echo json_encode(['status' => 'success', 'message' => 'Medisphere API is working']);
?>
