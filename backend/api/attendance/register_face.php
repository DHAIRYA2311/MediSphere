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
    if (isset($_FILES['image']) && isset($_POST['user_id'])) {
        
        $user_id = $_POST['user_id'];
        $image = $_FILES['image'];

        // Prepare data for Python Service
        $cfile = new CURLFile($image['tmp_name'], $image['type'], $image['name']);
        $data = array('user_id' => $user_id, 'image' => $cfile);

        // Call Python Service
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:5001/register_face");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $result = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
             $response['status'] = 'error';
             $response['message'] = 'Curl error: ' . curl_error($ch);
        } else {
            $json_result = json_decode($result, true);
            if ($json_result['status'] === 'success') {
                $response['status'] = 'success';
                $response['message'] = 'Face registered successfully via AI Service.';
            } else {
                $response['status'] = 'error';
                $response['message'] = 'AI Service Error: ' . $json_result['message'];
            }
        }
        curl_close($ch);

    } else {
        $response['status'] = 'error';
        $response['message'] = 'Missing image or user ID';
    }
} else {
    $response['status'] = 'error';
    $response['message'] = 'Invalid request method';
}

echo json_encode($response);
?>
