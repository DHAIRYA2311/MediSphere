<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/db.php';

if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing user_id."));
    exit();
}

$user_id = $_GET['user_id'];
$limit = isset($_GET['limit']) ? $_GET['limit'] : 20;

// Use the $pdo object defined in config/db.php
$db = $pdo;

$query = "SELECT * FROM Notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit";
$stmt = $db->prepare($query);

$stmt->bindParam(":user_id", $user_id);
$stmt->bindParam(":limit", $limit, PDO::PARAM_INT);

$stmt->execute();

$notifications = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // Parse the [Type] prefix we added in create.php
    // Format: "[RealType] Message"
    $real_type = "Info"; // Default
    $clean_message = $row['message'];

    if (preg_match('/^\[(.*?)\] (.*)$/', $row['message'], $matches)) {
        $real_type = $matches[1];
        $clean_message = $matches[2];
    } else {
        // Fallback to DB type
        $real_type = $row['type'];
    }

    $item = array(
        "notification_id" => $row['notification_id'],
        "user_id" => $row['user_id'],
        "message" => $clean_message,
        "original_type" => $row['type'], // DB value (Alert/Reminder)
        "type" => $real_type,            // Application value (AI_Result, Info, etc.)
        "status" => $row['status'],
        "created_at" => $row['created_at']
    );
    array_push($notifications, $item);
}

echo json_encode($notifications);
?>
