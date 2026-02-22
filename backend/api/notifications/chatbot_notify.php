<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';
require_once '../../utils/NotificationService.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['action'])) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid data"]);
    exit();
}

$action = $data['action'];

try {
    if ($action === 'welcome') {
        NotificationService::sendWelcome(
            $data['email'],
            $data['user_id'],
            $data['first_name'],
            $data['role']
        );
    } 
    elseif ($action === 'appointment') {
        // Fetch patient and doctor names for the notification
        $stmt_pat = $pdo->prepare("SELECT first_name, last_name, email FROM Users WHERE user_id = ?");
        $stmt_pat->execute([$data['user_id']]);
        $pat = $stmt_pat->fetch();

        // Get Doctor Name
        $stmt_doc = $pdo->prepare("SELECT u.first_name, u.last_name, u.email, u.user_id 
                                  FROM Doctors d 
                                  JOIN Users u ON d.user_id = u.user_id 
                                  WHERE d.doctor_id = ?");
        $stmt_doc->execute([$data['doctor_id']]);
        $doc = $stmt_doc->fetch();

        if ($pat && $doc) {
            $pName = $pat['first_name'] . ' ' . $pat['last_name'];
            $dName = $doc['first_name'] . ' ' . $doc['last_name'];
            
            // Notification for Patient
            NotificationService::sendAppointmentConfirmation(
                $pat['email'],
                $data['user_id'],
                $pName,
                $dName,
                $data['date'],
                $data['time']
            );

            // Notification for Doctor
            NotificationService::sendDoctorAssignment(
                $doc['email'],
                $doc['user_id'],
                $dName,
                $pName,
                $data['date'] . " at " . $data['time']
            );
        }
    }

    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
