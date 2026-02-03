<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../../config/db.php';

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['image'])) {
        
        $image = $_FILES['image'];

        // Prepare data for Python Service
        $cfile = new CURLFile($image['tmp_name'], $image['type'], $image['name']);
        $data = array('image' => $cfile);

        // Call Python Service
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:5001/recognize_face");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $result = curl_exec($ch);
        
        if (curl_errno($ch)) {
             $response['status'] = 'error';
             $response['message'] = 'Curl error: ' . curl_error($ch);
        } else {
            $json_result = json_decode($result, true);
            
            if ($json_result && $json_result['status'] === 'success') {
                $user_id = $json_result['user_id'];
                
                // Fetch User Details to confirm and mark attendance
                try {
                    $stmt = $pdo->prepare("SELECT first_name, last_name, role_id FROM Users WHERE user_id = ?");
                    $stmt->execute([$user_id]);
                    $user = $stmt->fetch();

                    if ($user) {
                        // Mark Attendance in DB (Simple Logic: Check-in)
                        // In a real app, handle Check-out based on previous records
                        $check_stmt = $pdo->prepare("INSERT INTO Attendance (user_id, date, check_in_time, method) VALUES (?, CURDATE(), CURTIME(), 'Biometric')");
                        try {
                             $check_stmt->execute([$user_id]);
                             $response['status'] = 'success';
                             $response['message'] = "Attendance marked for " . $user['first_name'] . " " . $user['last_name'];
                             $response['user'] = $user;
                        } catch (PDOException $e) {
                             // Maybe already checked in?
                             $response['status'] = 'info';
                             $response['message'] = "Attendance already marked or error: " . $e->getMessage();
                        }

                    } else {
                        $response['status'] = 'error';
                        $response['message'] = 'User ID recognized but not found in Users table.';
                    }
                } catch (Exception $e) {
                    $response['status'] = 'error';
                    $response['message'] = 'Database Error: ' . $e->getMessage();
                }

            } else {
                $response['status'] = 'error';
                $response['message'] = isset($json_result['message']) ? $json_result['message'] : 'Face not recognized';
            }
        }
        curl_close($ch);

    } else {
        $response['status'] = 'error';
        $response['message'] = 'Missing image';
    }
} else {
    $response['status'] = 'error';
    $response['message'] = 'Invalid request method';
}

echo json_encode($response);
?>
