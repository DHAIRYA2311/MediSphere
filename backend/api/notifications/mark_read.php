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

if (!isset($data->notification_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing notification_id."));
    exit();
}

// Use the $pdo object defined in config/db.php
$db = $pdo;

$query = "UPDATE Notifications SET status = 'Read' WHERE notification_id = :notification_id";
$stmt = $db->prepare($query);

$stmt->bindParam(":notification_id", $data->notification_id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(array("message" => "Notification marked as read."));
} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to update notification."));
}
?>
