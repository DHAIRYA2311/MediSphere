<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../utils/jwt.php';

// Security: Only Admins can view monitoring data
$token = JWT::get_bearer_token();
$payload = JWT::decode($token);

if (!$payload || strtolower($payload['role']) !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized Access']);
    exit();
}

try {
    $data = [];

    // 1. Fetch Chatbot Logs (Real Data)
    $stmt = $pdo->query("
        SELECT 
            cl.chat_id as id,
            cl.user_message as message,
            cl.bot_response as bot,
            cl.created_at as time,
            cl.patient_id,
            COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Guest') as user
        FROM chatbot_logs cl
        LEFT JOIN patients p ON cl.patient_id = p.patient_id
        LEFT JOIN users u ON p.user_id = u.user_id
        ORDER BY cl.created_at DESC
        LIMIT 50
    ");
    $data['chatbot_logs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Fetch System Stats (Real Calculation)
    
    // Bot Conversations Count
    $stmt = $pdo->query("SELECT COUNT(*) FROM chatbot_logs");
    $data['stats']['bot_conversations'] = $stmt->fetchColumn();

    // Active Sessions (Approximate by users active in last 30 min)
    // For now, let's count total active users
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE status = 'Active'");
    $data['stats']['active_sessions'] = $stmt->fetchColumn();

    // Warn Events (Count appointments with 'Pending' status older than 2 days or similar)
    $stmt = $pdo->query("SELECT COUNT(*) FROM appointments WHERE status = 'Pending' AND appointment_date < CURDATE()");
    $data['stats']['warn_events'] = $stmt->fetchColumn();

    // Uptime (Mocked as it requires server-level tracking)
    $data['stats']['uptime'] = "99.98%";

    // 3. System Events (Real Data from Activity)
    // We can pull recent actions like new users, new claims, new admissions
    $events = [];

    // New Users
    $stmt = $pdo->query("SELECT CONCAT(first_name, ' ', last_name) as name, created_at FROM users ORDER BY user_id DESC LIMIT 5");
    while($row = $stmt->fetch()) {
        $events[] = [
            'level' => 'INFO',
            'module' => 'Auth',
            'event' => "New User Registered: " . $row['name'],
            'time' => $row['created_at'] . " 00:00:00"
        ];
    }

    // New Claims
    $stmt = $pdo->query("SELECT claim_id, claim_status, processed_date FROM insurance_claims ORDER BY claim_id DESC LIMIT 5");
    while($row = $stmt->fetch()) {
        $events[] = [
            'level' => ($row['claim_status'] == 'Approved' ? 'INFO' : 'WARN'),
            'module' => 'Insurance',
            'event' => "Claim #" . $row['claim_id'] . " processed as " . $row['claim_status'],
            'time' => $row['processed_date'] . " 12:00:00"
        ];
    }

    // Sort events by time
    usort($events, function($a, $b) {
        return strtotime($b['time']) - strtotime($a['time']);
    });

    $data['system_logs'] = array_slice($events, 0, 20);

    echo json_encode(['status' => 'success', 'data' => $data]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
