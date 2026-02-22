<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$user_id = $payload['id'];
$role = $payload['role'];

// Optional filter by patient_id
$patient_id = isset($_GET['patient_id']) ? $_GET['patient_id'] : null;

// Logic: If user is medical staff (admin, staff, doctor, receptionist), they can see all or filter.
// If user is a patient, they can ONLY see their own documents.
$is_staff = in_array($role, ['admin', 'staff', 'doctor', 'receptionist']);

try {
    $sql = "SELECT d.*, p.patient_id, u.first_name, u.last_name, u.email, u.phone, u.gender, u.dob, p.blood_group 
            FROM Documents d
            JOIN Patients p ON d.patient_id = p.patient_id
            JOIN Users u ON p.user_id = u.user_id";
    
    $params = [];
            
    if ($is_staff) {
        // Staff can filter by patient_id if provided
        if ($patient_id) {
            $sql .= " WHERE d.patient_id = ?";
            $params[] = $patient_id;
        } else {
            $sql .= " ORDER BY d.document_id DESC";
        }
    } else {
        // Patient can ONLY see their own docs (linked via user_id in payload)
        $sql .= " WHERE u.user_id = ? ORDER BY d.document_id DESC";
        $params[] = $user_id;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $documents]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error', 'debug' => $e->getMessage()]);
}
?>
