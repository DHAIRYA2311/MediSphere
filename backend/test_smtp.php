<?php
// Standalone SMTP Tester
header("Content-Type: text/plain");
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "Starting SMTP Test...\n";

if (!file_exists(__DIR__ . '/config/email_config.php') || !file_exists(__DIR__ . '/utils/SimpleSMTP.php')) {
    die("Error: Config or Utils file missing. Checked in " . __DIR__ . "\n");
}

include __DIR__ . '/config/email_config.php';
include __DIR__ . '/utils/SimpleSMTP.php';

echo "Loaded Config.\n";
echo "Host: " . SMTP_HOST . ":" . SMTP_PORT . "\n";
echo "User: " . SMTP_USER . "\n";

try {
    $smtp = new SimpleSMTP();
    echo "Connecting...\n";
    $smtp->connect(SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);
    echo "Connected!\n";
    
    $to = "amindhairya1@gmail.com"; // Self test
    $subject = "Medisphere SMTP Test";
    $body = "<h1>It Works!</h1><p>This is a test email from Medisphere Backend.</p>";
    
    echo "Sending email to $to...\n";
    $res = $smtp->sendEmail($to, $subject, $body, SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    
    if ($res) {
        echo "SUCCESS: Email accepted by server.\n";
    } else {
        echo "FAILURE: Server rejected email.\n";
    }

} catch (Exception $e) {
    echo "CRITICAL ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>
