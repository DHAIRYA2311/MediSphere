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

$role = strtolower($payload['role']);
if (!in_array($role, ['admin', 'receptionist', 'doctor'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied. Staff only.']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (isset($data->donation_type) && isset($data->donation_amount) && isset($data->donation_date)) {
    
    $patient_id = !empty($data->patient_id) ? $data->patient_id : NULL;
    $donation_type = $data->donation_type; // CSH, ITM, SRV
    $donation_amount = intval($data->donation_amount);
    $donation_date = $data->donation_date;
    
    // Auto-fill received_by with logged-in user's name
    $received_by = $payload['name'];

    // Basic Validation
    if ($donation_amount <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Amount must be positive']);
        exit();
    }
    
    $valid_types = ['CSH', 'ITM', 'SRV'];
    if (!in_array($donation_type, $valid_types)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid donation type. Use CSH, ITM, or SRV']);
        exit();
    }

    try {
        // Validate patient_id if provided
        if ($patient_id) {
            $check_pat = $pdo->prepare("SELECT COUNT(*) FROM Patients WHERE patient_id = ?");
            $check_pat->execute([$patient_id]);
            if ($check_pat->fetchColumn() == 0) {
                echo json_encode(['status' => 'error', 'message' => 'Invalid Patient ID']);
                exit();
            }
        }

        $stmt = $pdo->prepare("INSERT INTO Donation (patient_id, donation_type, donation_amount, donation_date, received_by) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$patient_id, $donation_type, $donation_amount, $donation_date, $received_by]);

        echo json_encode(['status' => 'success', 'message' => 'Donation recorded successfully']);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
}
?>
