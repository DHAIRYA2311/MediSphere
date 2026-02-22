<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';

// Public endpoint to fetch active doctors for the landing page booking form
try {
    $stmt = $pdo->prepare("
        SELECT 
            d.doctor_id, 
            d.specialization, 
            d.department, 
            u.first_name, 
            u.last_name
        FROM Doctors d
        JOIN Users u ON d.user_id = u.user_id
        WHERE u.status = 'Active'
    ");
    $stmt->execute();
    $doctors = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $doctors]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal Server Error']);
}
?>
