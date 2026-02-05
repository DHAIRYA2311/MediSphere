<?php
include 'backend/config/db.php';
try {
    $stmt = $pdo->query("DESCRIBE ai_faces");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($cols);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
