<?php
require_once 'backend/config/db.php';
try {
    $stmt = $pdo->query("DESCRIBE Documents");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo $e->getMessage();
}
