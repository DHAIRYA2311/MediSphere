<?php
include 'backend/config/db.php';
try {
    $stmt = $pdo->query("DESCRIBE Reports");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($cols);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
