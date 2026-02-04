<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->message) || !isset($data->type)) {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data. Did not receive user_id, message, or type."));
    exit();
}

// Map new notification types to existing database ENUM('Alert', 'Reminder')
// If type is Info or AI_Result, we map it to 'Alert' or 'Reminder' to avoid schema change
$db_type = 'Alert'; // Default
if ($data->type == 'Reminder') {
    $db_type = 'Reminder';
} else if ($data->type == 'Info') {
    $db_type = 'Alert'; // Info maps to Alert
} else if ($data->type == 'AI_Result') {
    $db_type = 'Alert'; // AI Result maps to Alert
} else if ($data->type == 'Alert') {
    $db_type = 'Alert';
}

// Prepend the real type to the message so frontend knows, e.g. "[AI_Result] Analysis Complete"
$final_message = "[" . $data->type . "] " . $data->message;

// Use the $pdo object defined in config/db.php
$db = $pdo;

$query = "INSERT INTO Notifications (user_id, message, type, status, created_at) VALUES (:user_id, :message, :type, 'Unread', NOW())";
$stmt = $db->prepare($query);

$stmt->bindParam(":user_id", $data->user_id);
$stmt->bindParam(":message", $final_message);
$stmt->bindParam(":type", $db_type);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(array("message" => "Notification created successfully."));
} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to create notification."));
}
?>
