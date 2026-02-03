<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$stmt = $pdo->prepare("SELECT b.bed_id, b.bed_number, w.ward_name, w.ward_id 
                       FROM Beds b 
                       JOIN Wards w ON b.ward_id = w.ward_id 
                       WHERE b.status = 'Free'");
$stmt->execute();
$beds = $stmt->fetchAll();

echo json_encode(['status' => 'success', 'data' => $beds]);
?>
